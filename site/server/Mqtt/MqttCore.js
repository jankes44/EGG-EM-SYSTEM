const Promise = require("bluebird");
const mqtt = require("mqtt");
const schedule = require("node-schedule");
const clonedeep = require("lodash.clonedeep");
const nodemailer = require("nodemailer");

const con = require("../database/db_promise");

const clients = require("./Clients/clients.json");
const MqttDevice = require("./Clients/MqttDevice")
const LiveTestDevice = require("./LiveTestDevice")
const LiveTest = require("./LiveTest");

const {getLedStateHelper} = require("./MqttHelpers");
const LiveTest = require("./LiveTest");

const cutInterval = 1000;
const relayBackOn = 360000;
const noResponseTimeout = 15000;
const QOS_1 = { qos: 1 };

const errorMessages = {
"0CCD": "",
"6666": "No connection to driver",
"7FFF": "Battery powered",
};

const relayCommands = {
  "on": "10018202000196",
  "off": "10018202000096",
  "state": "10018201000096"
}

let mqttClients = {}
clients.forEach(el => {
    mqttClients[el.id] = new MqttDevice(el)
})

var liveTests = []

// Queries
const insertTest = "INSERT INTO trial_tests SET ?"
const insertTestLights = "INSERT INTO trial_tests_has_lights SET ?"
const getSensors = "select l.id as light_id, s.node_id, s.`type` from sensors s join lights l on s.parent_id  = l.id where l.id = ? and s.type in (?)"
const getLights = "Select * from lights where id in (?)";

const sensorsTypesToTest = ["VBAT", "LDR"]

/**
 * Finds a test launched by a specific user on a specific site, if present
 * 
 * @param {Number} user userId 
 * @param {Nuber} site siteId
 * @returns {LiveTest} test lauched by a specific user on a specific site
 */
const findUsersSiteTest = (user, site) => {
  const usersTestDetails = liveTests.find(el => el.userId === user && el.siteId === site)
  if (typeof usersTestDetails !== "undefined") {
    return usersTestDetails
  } else return null;
};

/**
 * Delete a test launched by a specific user ona a specific site
 * 
 * @param {Number} user userId 
 * @param {Nuber} site siteId
 */
const deleteUserSiteTest = (user, site) => {
  liveTests = liveTests.filter(el => !(el.userId === user && el.siteId === site))
}

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
      let testId 

      if (mqttClients[siteId].testInProgress){
        reject("Test in progrees, try again later")
      }
      else {
        mqttClients[siteId].testInProgress = true 
      
      const data = {
        lights: deviceIds.length,
        result: "In Progress",
        type: testType,
      };
  
      con.query(insertTest, data)
      .spread(result => {
        testId = result.insertId
        return con.query(getLights, [deviceIds])
      })
      .spread(async (rows, fields) => {
        const insertPromises = rows.map(el => {
          const params = { trial_tests_id: testId, lights_id: el.id }
          return con.query(insertTestLights, params)
        })
        await Promise.all(insertPromises);
        
        /*  Promise.map defines the mapping to obtain a promise and the "then" of that promise, 
            but then runs them all */ 
        return Promise.map(rows, (el) => con.query(getSensors, [el.id, sensorsTypesToTest])
          .spread((rows, fields) => {
            const d = new LiveTestDevice(el, testType, userId, testId, mqttClients[siteId])
            d.addSensors(rows)
            return d
          }))
        })
        .then(devices => {
          liveTests.push(new LiveTest(testId, userId, devices, testType, true, siteId))
          resolve("Success")
        })
      .catch(err => reject(err))
      } 
  })
  let result = await promise;
  return result;
}

/**
 * Retrieve the informations of a live test by user and site
 * 
 * @param {Number} user user id 
 * @param {Number} site site id
 */
const getTestInfo = (user, site) => {
  let result = null
  const usersTest = findUsersSiteTest(user, site)
  if (usersTest && typeof usersTest !== "undefined" && mqttClients[site].testInProgress) {
      result = clonedeep(usersTest)
      result.devices.forEach(el => el.result = el.getDeviceStatus())
  }
  return result         
}

const cutPowerAll = (user, site) => {
  const liveTest = findUsersSiteTest(user, site)
  return liveTest.cutPowerAll()
}

const cutPowerSingle = async (user, site, deviceId) => {
  const liveTest = findUsersSiteTest(user, site)
  const device = liveTest.getDeviceById(deviceId)
  const result = await device.cutPower(liveTest.testType)
  return result
}

const finishTest = async (user, site, state) => {
  const liveTest = findUsersSiteTest(user, site)
  let promise = new Promise((reject, resolve) => {
    liveTest.finish(state)
    .then(() => {
      deleteUserSiteTest(user, site)
      resolve()
    })
    .catch(err => reject(err))
  })
  const result = await promise
  return result
}

const setDeviceResult = (user, site, deviceId, result) => {
  let updated = false
  const liveTest = findUsersSiteTest(user, site)
  const device = liveTest.getDeviceById(deviceId)
  if (!device.hasSensors){
    device.result = result
    updated = true
  }
  return updated
}

const sendCommandToRelay = async (nodeId, siteId, cmd) => {
  let promise = new Promise((reject, resolve) => {
    let received = false 
    let messages = new Set()

    mqttClients[siteId].publish(nodeId, relayCommands[cmd])
    .then(message => {
      if (!received && !messages.has(message)){
        const rawResponse = message.slice(13, 25);
        const destinationNode = rawResponse.slice(0, 4);
        const paramData = rawResponse.slice(8, 12);

        received = true;
        messages.add(message);
        console.log(message, paramData);
        if (cmd === 'state'){
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
        }
        else resolve(`${destinationNode}: SET ${cmd.toUpperCase()}`)
      }
      else reject("Message already received")

  })
  .catch(err => reject(err))
  })
  
  const result = await promise
  return result
}

const getLedStates = (devices, site) => {
  let messages = new Set();
  const messenger = mqttClients[site]

  return Promise.each(devices, d => getLedStateHelper(d.nodeId, messenger, messages))
}

const rebootGateway = (siteId) => mqttClients[siteId].publish("", "XrebX")

module.exports = {
  startTest: startTest,
  findUsersSiteTest: findUsersSiteTest,
  getTestInfo: getTestInfo,
  rebootGateway: rebootGateway,
  finishTest: finishTest,
  cutPowerAll: cutPowerAll,
  cutPowerSingle: cutPowerSingle,
  setDeviceResult: setDeviceResult,
  sendCommandToRelay: sendCommandToRelay,
  getLedStates: getLedStates
}

const reboot = false

if (reboot) rebootGateway(3).then(message => console.log(message)).catch(err => console.log(err))
else {
  startTest(42, [210,211,212], "Monthly", 3)
.then(r => {
  getTestInfo(42,3)
  findUsersSiteTest(42,3).cutPowerAll().then(() => "OK").catch(err => "FINAL ERR " + err)
})
.catch(err => console.log(err))

}


