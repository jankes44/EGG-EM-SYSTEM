const Promise = require("bluebird");
const clonedeep = require("lodash.clonedeep");
const nodemailer = require("nodemailer");
const schedule = require("node-schedule");

const con = require("../database/db_promise");

const clients = require("./Clients/clients.json");
const MqttDevice = require("./Clients/MqttDevice");
const LiveTestDevice = require("./LiveTestDevice");
const LiveTest = require("./LiveTest");

const cutInterval = 1000;
const relayBackOn = 360000;
const noResponseTimeout = 15000;
const QOS_1 = {qos: 1};

const errorMessages = {
  "0CCD": "",
  6666: "No connection to driver",
  "7FFF": "Battery powered",
};

const deviceCommands = {
  on: "10018202000196",
  off: "10018202000096",
  state: "10018201000096",
  led_state: "10038205000096",
  light_on: "10018202000095",
  light_off: "10018202000194",
  check_gw: "XchkX",
  reboot_gw: "XrebX",
};

let mqttClients = {};
clients.forEach((el) => {
  mqttClients[el.id] = new MqttDevice(el);
});

var liveTests = [];

// Queries
const insertTest = "INSERT INTO trial_tests SET ?";
const insertTestLights = "INSERT INTO trial_tests_has_lights SET ?";
const getSensors =
  "select l.id as light_id, s.node_id, s.`type` from sensors s join lights l on s.parent_id  = l.id where l.id = ? and s.type in (?)";
const getLights = `SELECT DISTINCT lg.*, l.id as levels_id, l.level, b.building, b.id as buildings_id,
                  s.mqtt_topic_out, s.mqtt_topic_in,s.id as sites_id,
                  s.name as sites_name
                  FROM lights lg
                  LEFT JOIN levels l ON l.id = lg.levels_id
                  LEFT JOIN buildings b ON b.id = l.buildings_id
                  LEFT JOIN sites s ON s.id = b.sites_id
                  LEFT JOIN users_has_sites uhs ON uhs.sites_id = s.id
                  LEFT JOIN users u ON u.id = uhs.users_id
                  WHERE lg.id in (?)`;
const checkSiteStateQuery = `select lg.id as light_id, lg.device_id, lg.node_id, l.id as level_id, 
                            l.level, b.building, s.mqtt_topic_out, s.mqtt_topic_in, s.id as site_id, 
                            s.name  as site_name
                            from lights lg 
                            left join levels l on lg.levels_id = l.id 
                            left join buildings b on l.buildings_id = b.id 
                            left join sites s on b.sites_id = s.id 
                            where s.id = ?`;
const noAnswerFromDeviceQuery =
  "UPDATE lights SET status = 'No connection to bt module' WHERE id = ?";
const insertSchedule =
  "insert into schedule (date, test_type, user_id) values (?, ?, ?)";
const insertScheduleDevices =
  "insert into schedule_has_devices (schedule_id, device_id) values ?";

const sensorsTypesToTest = ["VBAT", "LDR"];

/**
 * Finds a test launched by a specific user on a specific site, if present
 *
 * @param {Number} user userId
 * @param {Nuber} site siteId
 * @returns {LiveTest} test lauched by a specific user on a specific site
 */
const findUserSiteTest = (user, site) => {
  const usersTestDetails = liveTests.find(
    (el) => el.userId === user && el.siteId === site
  );
  if (typeof usersTestDetails !== "undefined") {
    return usersTestDetails;
  } else return null;
};

/**
 * Delete a test launched by a specific user ona a specific site
 *
 * @param {Number} user userId
 * @param {Nuber} site siteId
 */
const deleteUserSiteTest = (user, site) => {
  liveTests = liveTests.filter(
    (el) => !(el.userId === user && el.siteId === site)
  );
};

/**
 * Start a test on a set of devices from a selected site
 *
 * @param {Number} userId user (id) who lauched the test
 * @param {Array<String>} deviceIds list of the devices to test
 * @param {String} testType test type (Monthly/Annual)
 * @param {Number} siteId site (id) where to start the test
 */
const startTest = async (userId, deviceIds, testType, siteId) => {
  let promise = new Promise((resolve, reject) => {
    let testId;

    if (mqttClients[siteId].testInProgress) {
      reject("Test in progrees, try again later");
    } else {
      mqttClients[siteId].testInProgress = true;

      const data = {
        lights: deviceIds.length,
        result: "In Progress",
        type: testType,
      };

      con
        .query(insertTest, data)
        .spread((result) => {
          testId = result.insertId;
          return con.query(getLights, [deviceIds]);
        })
        .spread(async (rows, fields) => {
          const insertPromises = rows.map((el) => {
            const params = {trial_tests_id: testId, lights_id: el.id};
            return con.query(insertTestLights, params);
          });
          await Promise.all(insertPromises);

          /*  Promise.map defines the mapping to obtain a promise and the "then" of that promise, 
            but then runs them all */
          return Promise.map(rows, (el) =>
            con
              .query(getSensors, [el.id, sensorsTypesToTest])
              .spread((rows, fields) => {
                console.log(el);
                const d = new LiveTestDevice(
                  el,
                  testType,
                  userId,
                  testId,
                  mqttClients[siteId]
                );
                d.addSensors(rows);
                return d;
              })
          );
        })
        .then((devices) => {
          liveTests.push(
            new LiveTest(testId, userId, devices, testType, true, siteId)
          );
          resolve("Success");
        })
        .catch((err) => reject(err));
    }
  });
  let result = await promise;
  return result;
};

/**
 * Retrieve the informations of a live test by user and site
 *
 * @param {Number} user user id
 * @param {Number} site site id
 */
const getTestInfo = (user, site) => {
  let result = null;
  const usersTest = findUserSiteTest(user, site);
  if (
    usersTest &&
    typeof usersTest !== "undefined" &&
    mqttClients[site].testInProgress
  ) {
    result = clonedeep(usersTest);
    result.devices.forEach((el) => (el.result = el.getDeviceStatus()));
  }
  return result;
};

const cutPowerAll = (user, site) => {
  const liveTest = findUserSiteTest(user, site);
  return liveTest.cutPowerAll();
};

const cutPowerSingle = async (user, site, deviceId) => {
  const liveTest = findUserSiteTest(user, site);
  const device = liveTest.getDeviceById(deviceId);
  const result = await device.cutPower(liveTest.testType);
  return result;
};

const finishTest = async (user, site, state) => {
  const liveTest = findUserSiteTest(user, site);
  let promise = new Promise((reject, resolve) => {
    liveTest
      .finish(state)
      .then(() => {
        deleteUserSiteTest(user, site);
        resolve();
      })
      .catch((err) => reject(err));
  });
  const result = await promise;
  return result;
};

const setDeviceResult = (user, site, deviceId, result) => {
  let updated = false;
  const liveTest = findUserSiteTest(user, site);
  const device = liveTest.getDeviceById(deviceId);
  if (!device.hasSensors) {
    device.result = result;
    updated = true;
  }
  return updated;
};

/**
 *
 * @param {String} nodeId nodeId
 * @param {Number} siteId siteId
 * @param {String} cmd string representation of the command that is mapped to the corresponding mqtt command
 * @param {String} fullCmd raw mqtt command
 * @param {Boolean} multiple to indicate if this function is called inside a Promise.each()
 */
const sendCommandToDevice = async (
  nodeId,
  siteId,
  cmd,
  fullCmd = null,
  multiple = false
) => {
  return new Promise((reject, resolve) => {
    let received = false;
    let messages = new Set();
    const command = fullCmd ? fullCmd : deviceCommands[cmd];

    mqttClients[siteId]
      .publish(nodeId, command)
      .then((message) => {
        if (!received && !messages.has(message)) {
          const rawResponse = message.slice(13, 25);
          const destinationNode = rawResponse.slice(0, 4);
          const paramData = rawResponse.slice(8, 12);

          received = true;
          messages.add(message);
          console.log(message, paramData);
          if (fullCmd) {
            resolve(message);
          } else {
            if (cmd === "state") {
              switch (paramData) {
                case "0000":
                  resolve(`${destinationNode}: OFF`);
                  break;
                case "0001":
                  resolve(`${destinationNode}: ON`);
                  break;
                default:
                  resolve(`${destinationNode}: UNKNOWN_RES`);
              }
            } else resolve(`${destinationNode}: SET ${cmd.toUpperCase()}`);
          }
        } else
          multiple
            ? resolve("Message already received")
            : reject("Message already received");
      })
      .catch((err) => (multiple ? resolve(err) : reject(err)));
  });
};

const checkGatewayState = (siteId) => {
  return sendCommandToDevice("", siteId, "check_gw");
};

const checkSiteStateHelper = (device, siteId, cmd) => {
  return new Promise((reject, resolve) => {
    const nodeId = device.node_id;
    const messenger = mqttClients[siteId];
    messenger
      .publish(nodeId, cmd)
      .then((message) => resolve({device: device, message: message}))
      .catch((err) => resolve({device: device, error: err}));
  });
};

const checkSiteState = (siteId) => {
  let faultyDevices = [];
  let messages = new Set();

  con
    .query(checkSiteStateQuery, siteId)
    .spread((rows) => {
      Promise.each(rows, (r) =>
        checkSiteStateHelper(r, siteId, deviceCommands["led_state"])
      ).then((items) => {
        items.forEach((item) => {
          if (item.error)
            con
              .query(noAnswerFromDeviceQuery, item.device.id)
              .then(() => console.log("NO ANSWER FROM DEVICE", r.device));
          else if (!messages.has(item.message)) {
            insertMsg(item.message);
            const msg_code = item.message.slice("21", "25").toUpperCase();
            const errorMessage = errorMessages[msg_code];
            if (errorMessage.length > 0) faultyDevices.push(item.device);
          }
        });
        checkGatewayState(siteId)
          .then(() => actOnGatewayState(1, faultyDevices))
          .catch(() => actOnGatewayState(-1, faultyDevices));
      });
    })
    .catch((err) => {
      throw err;
    });
};

const actOnGatewayState = (state, faultyDevices) => {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "platform.notifications2020@gmail.com",
      pass: "Jarek543",
    },
  });

  var mailOptions = {
    from: "automaticTester@egglighting.com",
    to: "jack@egglighting.com, cesare@egglighting.com",
  };

  if (state < 0) {
    mailOptions.subject = "Automatic check - Faulty gateway";
    mailOptions.text = "Faulty gateway, it did not respond";
  } else if (faultyDevices.length > 0) {
    mailOptions.subject = "Automatic check - Faulty devices";
    var text = "Gateway OK,\nFaulty devices:\n";
    faultyDevices.forEach((device) => {
      text =
        text +
        `Device: ${device.node_id} 
      reported error: ${Array.from(device.result).join(", ")}\n`;
    });
    mailOptions.text = text;
  }

  if (mailOptions.hasOwnProperty("text")) {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  }
};

// -------------------------------------------- SCHEDULING ----------------------------------------

const scheduleFromDB = () => {
  con.query(scheduleQuery).spread((rows) => {
    if (rows.length > 0) rows.foreach((job) => this.scheduleJob(job));
  });
};

scheduleJob = (job) => {
  const date = new Date(job.date.toString());
  const name = `job${job.id}`;
  const dateNow = new Date();

  if (date > dateNow) {
    schedule.scheduleJob(name, date, () => runTest(job));
  }
};

runTest = (test) => {
  const userId = test.user_id;
  const device_ids = test.device_id.split(",");
  const testType = test.test_type;
  const siteId = test.site_id;

  startTest(userId, device_ids, testType, siteId)
    .then(() => cutPowerAll(userId, siteId))
    .then(() => {
      const testDuration = testTime[test.test_type] + 1000 * 60 * 5;
      setTimeout(() => {
        finishTest(userId, siteId, "Finished");
      }, testDuration);
    });
};

const scheduleTest = () => {
  // STUB
};

const event = schedule.scheduleJob("*/1 * * * *", () => {
  const scheduledCheck = () => {
    if (testInProgress) {
      const time = 30000;
      console.log(
        "MQTT BUSY:",
        testInProgress,
        "RETRYING IN:",
        time / 1000,
        "seconds"
      );
      const timeout = setTimeout(() => {
        clearTimeout(timeout);
        scheduledCheck();
      }, time);
    } else {
      testInProgress = true;
      checkSiteState(1);
    }
  };
});

module.exports = {
  startTest: startTest,
  findUserSiteTest: findUserSiteTest,
  getTestInfo: getTestInfo,
  // rebootGateway: rebootGateway,
  finishTest: finishTest,
  cutPowerAll: cutPowerAll,
  cutPowerSingle: cutPowerSingle,
  setDeviceResult: setDeviceResult,
  sendCommandToDevice: sendCommandToDevice,
  checkGatewayState: checkGatewayState,
};

// const reboot = false

// if (reboot) rebootGateway(3).then(message => console.log(message)).catch(err => console.log(err))
// else {
//   startTest(42, [210,211,212], "Monthly", 3)
// .then(r => {
//   getTestInfo(42,3)
//   findUserSiteTest(42,3).cutPowerAll().then(() => "OK").catch(err => "FINAL ERR " + err)
// })
// .catch(err => console.log(err))

// }
