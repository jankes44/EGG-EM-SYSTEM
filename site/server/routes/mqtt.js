const express = require("express");
const router = express.Router();
const { device } = require("./mqttconnect");
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const con = require("../database/db2");
var mqtt = require("mqtt");
var schedule = require("node-schedule");
const { on } = require("../database/db2");

// const sendTopic = "irjghjhitj45645654";
const sendTopic2 = "DEVCOMSP";
let testInProgress = false;
const testTime = 10800000;
const cutInterval = 5000;
// const callInterval = 5000;
const relayBackOn = 1200000;
var devicesLive = [];
const noResponseTimeout = 15000;
// var usersTest;

// var event = schedule.scheduleJob("*/1 * * * *", function () {
//   checkSiteState = () => {
//     if (testInProgress) {
//       const time = 30000;
//       console.log(
//         "MQTT BUSY:",
//         testInProgress,
//         "RETRYING IN:",
//         time / 1000,
//         "seconds"
//       );
//       const timeout = setTimeout(() => {
//         clearTimeout(timeout);
//         checkSiteState();
//       }, time);
//     } else {
//       testInProgress = true;
//       con.query(
//         `SELECT
//     lights.*,
//     lgt_groups.group_name,
//     levels.id as levels_id,
//     levels.level,
//     buildings.building,
//     sites.mqtt_topic_out,
//     sites.mqtt_topic_in,
//     sites.id as sites_id,
//     sites.name as sites_name
//   FROM
//     lights
//       LEFT OUTER JOIN
//     lgt_groups ON lights.lgt_groups_id = lgt_groups.id
//       LEFT OUTER JOIN
//     levels ON levels.id = lgt_groups.levels_id
//       LEFT OUTER JOIN
//     buildings ON buildings.id = levels.buildings_id
//       LEFT OUTER JOIN
//     sites ON sites.id = buildings.sites_id
//       LEFT OUTER JOIN
//     users_has_sites ON users_has_sites.sites_id = sites.id
//       LEFT OUTER JOIN
//     users ON users.id = users_has_sites.users_id
//   WHERE sites.id = 1
//   group by sites.id, id`,
//         (err, rows) => {
//           if (err) throw err;
//           var deviceData = rows;
//           let counter = 0;
//           const length = deviceData.length;
//           var messages = [];

//           loop = () => {
//             if (counter < length) {
//               const deviceId = deviceData[counter].node_id;
//               const deviceIndex = deviceData[counter].id;
//               var topic = deviceData[counter].mqtt_topic_out;
//               console.log(deviceData[counter].node_id);
//               console.log(topic);
//               publishGetState = () => {
//                 device.publish(
//                   topic,
//                   `${deviceId}10038205000096`,
//                   { qos: 1 },
//                   (err) => {
//                     if (err) {
//                       setTimeout(() => {
//                         publishGetState();
//                         console.log("retrying in 5s");
//                       }, 5000);
//                     } else {
//                       console.log("published on:", topic);
//                       var msgTimeout = setTimeout(() => {
//                         con.query(
//                           "UPDATE lights SET status = 'No connection to bt module' WHERE id = ?",
//                           [deviceIndex],
//                           (err) => {
//                             if (err) throw err;
//                           }
//                         );
//                         console.log("No response");
//                         counter++;
//                         loop();
//                       }, 6000);
//                       device.handleMessage = (packet, callback) => {
//                         clearInterval(msgTimeout);
//                         const message = packet.payload.toString("utf8");
//                         const arrayContainsMessage = messages.includes(message);
//                         const msg_node_id = message.slice("13", "17");
//                         const msg_code = message
//                           .slice("21", "25")
//                           .toUpperCase();
//                         if (!arrayContainsMessage) {
//                           insertMsg(message);
//                           messages.push(message);
//                           switch (msg_code) {
//                             case "0CCD":
//                               con.query(
//                                 "UPDATE lights SET status = 'OK' WHERE id = ?",
//                                 [deviceIndex],
//                                 (err) => {
//                                   if (err) throw err;
//                                 }
//                               );
//                               break;
//                             case "6666":
//                               con.query(
//                                 "UPDATE lights SET status = 'No connection to driver' WHERE id = ?",
//                                 [deviceIndex],
//                                 (err) => {
//                                   if (err) throw err;
//                                 }
//                               );
//                               break;
//                             case "7FFF":
//                               con.query(
//                                 "UPDATE lights SET status = 'Battery powered/under test' WHERE id = ?",
//                                 [deviceIndex],
//                                 (err) => {
//                                   if (err) throw err;
//                                 }
//                               );
//                               break;
//                           }
//                           console.log(message, msg_node_id, msg_code);
//                           counter++;
//                           setTimeout(loop, 1000);
//                           callback(packet);
//                         } else {
//                           callback();
//                         }
//                       };
//                     }
//                   }
//                 );
//               };
//               publishGetState();
//             } else {
//               testInProgress = false;
//               console.log("done", counter, length);
//               counter = 0;
//             }
//           };
//           loop();
//         }
//       );
//     }
//   };
//   checkSiteState();
// });

const pubHandle = (cmd, deviceId, counter, messages, topic, user) => {
  return new Promise((resolve, reject) => {
    const usersDevices = findUsersTest(user).devices;
    usersDevices[counter].clicked = 1;
    let received = false;
    device.publish(
      //Publish command to user defined topic
      topic,
      `${deviceId}${cmd}`,
      { qos: 1 },
      () => {
        console.log("published on: " + topic);

        var msgTimeout = setTimeout(() => {
          //if no response in time continue
          //if no response from device in X seconds, continue the loop
          console.log(`${deviceId}: NO RES`);
          usersDevices[counter].powercut = 3; //state 3 = no response

          resolve("NO RES");
        }, noResponseTimeout);

        device.handleMessage = (packet, callback) => {
          clearInterval(msgTimeout); //if  got the message cancel the timeout on
          var message = packet.payload.toString("utf8");
          var arrayContainsMessage = messages.includes(message);
          var msg_node_id = message.slice("13", "17");
          if (!arrayContainsMessage) {
            if (!message.includes("hello")) {
              messages.push(message);
              console.log(message, msg_node_id);
              con.query(
                "UPDATE lights SET status = 'Battery powered/under test' WHERE id = ?",
                [usersDevices[counter].id]
              );
              usersDevices[counter].powercut = 1; //state 1 = power has been cut
              if (!received) {
                received = true;
                durationCounterStart(counter, topic, user);
              }
              resolve("power down");
              callback(packet);
            }
          } else {
            console.log(message, arrayContainsMessage);
            callback(packet);
          }
        };
      }
    );
  });
};

async function handleMessage() {
  let promise = new Promise((resolve, reject) => {
    device.handleMessage = (packet, callback) => {
      var message = packet.payload.toString("utf8");
      resolve(message);
      callback(packet);
    };
  });

  let result = await promise; // wait until the promise resolves (*)
  return result;
}

async function insertMsg(msg) {
  var param_data = msg.slice(21, 25);
  var node_id = msg.slice(13, 17);
  let message_content = msg.slice(13, 25);
  var data = {
    raw_message: msg,
    message_content: message_content,
    node_id: node_id,
    param_data: param_data,
  };
  con.query("INSERT INTO mqtt_messages SET ?", data, (err, results) => {
    if (err) throw err;
  });
}

updateDeviceState = (status, id) => {
  console.log("update device state:", status, id);
  con.query(
    `UPDATE lights SET status = ? WHERE id = ?`,
    [status, id],
    (err, res) => {
      if (err) throw err;
    }
  );
};

async function checkDeviceState(counter, topic, deviceId, user, type) {
  let promise = new Promise((resolve, reject) => {
    var usersDevices = findUsersTest(user).devices;
    var messages = [];
    let received = false;
    const command = type === "led" ? "10038205000096" : "10018201000096";
    device.publish(
      //publish cut power command
      topic,
      `${deviceId}${command}`,
      { qos: 1 },
      () => {
        busy = true;
        console.log("state check: " + deviceId);

        var msgTimeout = setTimeout(() => {
          //if no response from device in X seconds, continue the loop
          usersDevices[counter].powercut = 3; //state 3 = no response
          updateDeviceState(
            "Weak connection to Mesh",
            usersDevices[counter].id
          );
          busy = false;
          resolve("No response");
        }, noResponseTimeout);

        checkMsgState = (msg) => {
          const msgCut = msg.slice(21, 25).toUpperCase();
          console.log(msg, msgCut, counter);
          switch (msgCut) {
            case "0CCD":
              updateDeviceState("OK", usersDevices[counter].id);
              // usersDevices[counter].userInput = "OK";
              console.log(usersDevices[counter].userInput);
              break;
            case "6666":
              updateDeviceState(
                "Battery disconnected",
                usersDevices[counter].id
              );
              // usersDevices[counter].userInput = "Battery disconnected";
              console.log(usersDevices[counter].userInput);
              break;
            case "7FFF":
              updateDeviceState(
                "Battery powered/under test",
                usersDevices[counter].id
              );
              usersDevices[counter].userInput = "Battery powered/under test";
              console.log(usersDevices[counter].userInput);
              break;
          }
        };

        device.handleMessage = (packet, callback) => {
          clearInterval(msgTimeout); //if  got the message cancel the timeout on
          var message = packet.payload.toString("utf8");
          if (!messages.includes(message) && !received) {
            received = true;
            messages.push(message);
            setTimeout(() => {
              insertMsg(message);
              checkMsgState(message);
              console.log(messages);
              busy = false;
              resolve(message);
              callback(packet);
            }, 500);
          } else callback(packet);
        };
      }
    );
  });

  let result = await promise; // wait until the promise resolves (*)
  return result;
}

async function checkDeviceConnectivity(topic, deviceData, type) {
  let promise = new Promise((resolve, reject) => {
    var messages = [];
    let received = false;
    const command = type === "led" ? "10038205000096" : "10018201000096";
    device.publish(
      //publish cut power command
      topic,
      `${deviceData.node_id}${command}`,
      () => {
        busy = true;
        console.log("state check: " + deviceData.id);

        var msgTimeout = setTimeout(() => {
          updateDeviceState("Weak connection to Mesh", deviceData.id);
          busy = false;
          resolve("No response");
        }, noResponseTimeout);

        checkMsgState = (msg) => {
          const msgCut = msg.slice(21, 25).toUpperCase();
          console.log(msg, msgCut);
          switch (msgCut) {
            case "0CCD":
              updateDeviceState("OK", deviceData.id);
              // usersDevices[counter].userInput = "OK";
              break;
            case "6666":
              updateDeviceState("Battery disconnected", deviceData.id);
              // usersDevices[counter].userInput = "Battery disconnected";
              break;
            case "7FFF":
              updateDeviceState("Battery powered/under test", deviceData.id);
              // usersDevices[counter].userInput = "Battery powered/under test";
              break;
          }
        };

        device.handleMessage = (packet, callback) => {
          clearInterval(msgTimeout); //if  got the message cancel the timeout on
          var message = packet.payload.toString("utf8");
          if (!messages.includes(message) && !received) {
            received = true;
            messages.push(message);
            setTimeout(() => {
              insertMsg(message);
              checkMsgState(message);
              console.log(messages);
              busy = false;
              resolve(message);
              callback(packet);
            }, 500);
          } else callback(packet);
        };
      }
    );
  });

  let result = await promise; // wait until the promise resolves (*)
  return result;
}

durationCounterStart = (counter, topic, user) => {
  var interval = setInterval(() => {
    if (testInProgress === true) {
      var usersDevices = findUsersTest(user).devices;
      usersDevices[counter].duration = usersDevices[counter].duration - 1000;

      if (usersDevices[counter].duration === 0) {
        busy = true;
        var messages = [];
        var timeout = setTimeout(() => {
          if (testInProgress) {
            var deviceId = usersDevices[counter].node_id;
            checkDeviceState(counter, topic, deviceId, user, "led").then(
              (msg) => {
                device.publish(
                  topic,
                  `${deviceId}10018202000196`,
                  { qos: 1 },
                  (err) => {
                    console.log(`${deviceId}: MAIN ON`);
                    var msgTimeout = setTimeout(() => {
                      console.log(`${deviceId}: NO RES`);
                      usersDevices[counter].powercut = 3;
                      con.query(
                        "UPDATE lights SET status = 'Weak connection to Mesh' WHERE id = ?",
                        [usersDevices[counter].id]
                      );
                      counter++;
                      busy = false;
                      setTimeout(loop, 1000);
                      return counter;
                    }, noResponseTimeout);
                    device.handleMessage = (packet, callback) => {
                      clearInterval(msgTimeout);
                      var message = packet.payload.toString("utf8");
                      var arrayContainsMessage = messages.includes(message);
                      var msg_node_id = message.slice("13", "17");
                      if (!arrayContainsMessage) {
                        if (!message.includes("hello")) {
                          messages.push(message);
                          console.log(message, msg_node_id, "test");
                          usersDevices[counter].powercut = 2; //POWERCUT 2 = FINISHED
                          con.query(
                            "UPDATE lights SET status = 'OK' WHERE id = ?",
                            [usersDevices[counter].id]
                          );
                          busy = false;
                          callback(packet);
                        } else callback(packet);
                      } else {
                        console.log(message, arrayContainsMessage);
                        callback(packet);
                      }
                    };
                  }
                );
              }
            );
          } else clearTimeout(timeout);
        }, relayBackOn);
        clearInterval(interval);
      }
    } else {
      clearInterval(interval);
    }
  }, 1000);
};

cutPowerSingle = (res, req, user) => {
  let usersDevices = findUsersTest(user).devices;
  if (usersDevices) {
    let deviceIndex = usersDevices.findIndex((el) => el.id === req.body.device);
    const deviceId = usersDevices[deviceIndex].node_id;
    const topic = usersDevices[deviceIndex].mqtt_topic_out;

    var messages = [];

    console.log(`${deviceId}: MAIN OFF`);
    if (usersDevices[deviceIndex].powercut === 0) {
      res.status(200);
      busy = true;
      pubHandle(
        "10018202000096",
        deviceId,
        deviceIndex,
        messages,
        topic,
        user
      ).then((msg) => {});
    }
  }
};

cutPowerAll = (res, user) => {
  res.status(200);
  console.log("MAIN OFF ALL");
  busy = true;
  let counter = 0;
  const usersTest = findUsersTest(user);
  const usersDevices = usersTest.devices;
  const length = usersDevices.length;
  usersTest.cut_all_clicked = 1;
  usersTest.abort_clicked = 1;

  var messages = [];

  console.log(length);

  loop = () => {
    //loop through devices given in request
    if (counter < length && testInProgress) {
      const deviceId = usersDevices[counter].node_id;
      const topic = usersDevices[counter].mqtt_topic_out;
      console.log(usersDevices[counter].node_id, counter);
      if (usersDevices[counter].powercut === 0) {
        pubHandle(
          "10018202000096",
          deviceId,
          counter,
          messages,
          topic,
          user
        ).then(() => {
          counter++;
          setTimeout(loop, cutInterval);
        });
      } else {
        counter++;
        loop();
      }
    } else {
      console.log(`USER ${user}: DONE -`, counter, length);
      busy = false;
      usersTest.abort_clicked = 0;
      counter = 0;
    }
  };
  loop();
};

beforeTest = (requestBody, res, userParam) => {
  testInProgress = true;
  usersTest = userParam.uid;
  var devices = requestBody.devices;
  var devicesCopy = [];
  con.query(
    "INSERT INTO trial_tests SET ?",
    {
      lights: requestBody.devices.length,
      result: "In Progress",
      set: "Manual",
      type: "Annual",
    },
    (err, result) => {
      requestBody.devices.forEach((el) => {
        con.query(
          "INSERT INTO trial_tests_has_lights SET ?",
          {
            trial_tests_id: result.insertId,
            lights_id: el.id,
          },
          (err) => {
            if (err) throw err;

            el.powercut = 0;
            el.clicked = 0;
            el.duration = testTime;
            el.durationStart = testTime;
            el.user = requestBody.user;
            el.userInput = "";
            el.testid = result.insertId;

            devicesCopy.push(el);
          }
        );
      });
      var testId = result.insertId;
      var user = requestBody.user;
      devicesLive.push({
        test_id: testId,
        status: "In progress",
        user_id: user,
        devices: devicesCopy,
        cut_all_clicked: 0,
        abort_clicked: 0,
        finish_clicked: 0,
      });

      res.send("Devices ready, you can start the test");
    }
  );
};

findUsersTest = (id) => {
  const usersTestDetails = devicesLive.find(
    (el) => parseInt(el.user_id) === parseInt(id)
  );
  // console.log(usersTestDetails);
  if (typeof usersTestDetails !== "undefined") {
    return usersTestDetails;
  } else return "";
};

router.post("/dev/checkconnectivity", auth, (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      checkDeviceConnectivity("DEVCOMSP", req.body.device, "led").then(
        (result) => {
          res.status(200).send(result);
        }
      );
    }
  });
});

//Abort test call
router.post("/aborttest/:testid", auth, (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      req.connection.setTimeout(1000 * 60 * 10);
      console.log(req.params.testid);

      const user = req.body.user;
      var usersTest = findUsersTest(user);
      var usersDevices = usersTest.devices;
      let counter = 0;
      let deviceId;
      const length = usersDevices.length;
      var messages = [];
      usersTest.abort_clicked = 1;

      loop = () => {
        if (counter < length && testInProgress) {
          deviceId = usersDevices[counter].node_id;
          const topic = usersDevices[counter].mqtt_topic_out;
          let msgReceived = false;

          checkDeviceState(counter, topic, deviceId, user, "led").then(
            (msg) => {
              setTimeout(() => {
                device.publish(
                  topic,
                  `${deviceId}10018202000196`,
                  { qos: 1 },
                  (err) => {
                    console.log("published");
                    var msgTimeout = setTimeout(() => {
                      console.log("No response");
                      usersDevices[counter].powercut = 3;
                      counter++;
                      setTimeout(loop, 1000);
                      return counter;
                    }, noResponseTimeout);
                    device.handleMessage = (packet, callback) => {
                      clearInterval(msgTimeout);
                      var message = packet.payload.toString("utf8");
                      var arrayContainsMessage = messages.includes(message);
                      var msg_node_id = message.slice("13", "17");
                      if (!arrayContainsMessage && !msgReceived) {
                        if (!message.includes("hello")) {
                          messages.push(message);
                          console.log(message, msg_node_id, counter);
                          msgReceived = true;
                          usersDevices[counter].powercut = 2;
                          counter++;
                          setTimeout(loop, 1000);
                          callback(packet);
                        }
                      } else {
                        console.log(message, arrayContainsMessage, msgReceived);
                        callback(packet);
                      }
                    };
                  }
                );
              });
            },
            1000
          );
        } else {
          console.log("done", counter, length);
          counter = 0;
          con.query(
            "UPDATE trial_tests SET result='Cancelled' WHERE id=?",
            [req.params.testid],
            () => {
              devicesLive.forEach((el) => {
                con.query(
                  "update trial_tests_has_lights set result=? where trial_tests_id=? and lights_id=?",
                  [el.userInput, req.params.testid, el.id]
                );
              });
              setTimeout(() => {
                var usersTestIndex = devicesLive.findIndex(
                  (el) => el.user_id === req.body.user
                );
                devicesLive.splice(usersTestIndex, 1);
              }, 1000);
              res.status(200).send("Test cancelled");
              testInProgress = false;
              usersTest = 0;
            }
          );
        }
      };
      loop();
    }
  });
});

//save finished test after reviewing
router.post("/savetest/:testid", auth, (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      //handle long duration tasks with request connection settimeout
      req.connection.setTimeout(1000 * 60 * 10);
      console.log(req.params.testid);

      let counter = 0;
      let deviceId;
      var messages = [];
      var user = req.body.user;
      var usersTest = findUsersTest(user);
      var usersDevices = usersTest.devices;
      const length = usersDevices.length;
      usersTest.finish_clicked = 1;

      busy = true;

      loop = () => {
        if (counter < length && testInProgress) {
          deviceId = usersDevices[counter].node_id;
          var topic = usersDevices[counter].mqtt_topic_out;
          var msgReceived = false;

          checkDeviceState(counter, topic, deviceId, user, "led").then(() => {
            setTimeout(() => {
              device.publish(
                topic,
                `${deviceId}10018202000196`,
                { qos: 1 },
                (err) => {
                  console.log("published", deviceId);
                  var msgTimeout = setTimeout(() => {
                    if (usersDevices.length > 0) {
                      console.log("No response");
                      usersDevices[counter].powercut = 3;
                    }
                    counter++;
                    setTimeout(loop, 1000);
                  }, noResponseTimeout);
                  device.handleMessage = (packet, callback) => {
                    clearInterval(msgTimeout);
                    var message = packet.payload.toString("utf8");
                    var arrayContainsMessage = messages.includes(message);
                    var msg_node_id = message.slice("13", "17");

                    if (!arrayContainsMessage && !msgReceived) {
                      if (!message.includes("hello")) {
                        messages.push(message);
                        console.log(message, msg_node_id);
                        msgReceived = true;
                        if (usersDevices.length > 0) {
                          usersDevices[counter].powercut = 2;
                        }
                        counter++;
                        setTimeout(loop, 1000);
                        callback(packet);
                      }
                    } else {
                      console.log(message, arrayContainsMessage, msgReceived);
                      callback(packet);
                    }
                  };
                },
                1000
              );
            });
          });
        } else {
          console.log("done", counter, length);
          busy = false;
          counter = 0;
          con.query(
            "UPDATE trial_tests SET result='Finished' WHERE id=?",
            [req.params.testid],
            () => {
              usersDevices.forEach((el) => {
                con.query(
                  "update trial_tests_has_lights set result=? where trial_tests_id=? and lights_id=?",
                  [el.userInput, req.params.testid, el.id]
                );
              });
              setTimeout(() => {
                var usersTestIndex = devicesLive.findIndex(
                  (el) => el.user_id === req.body.user
                );
                devicesLive.splice(usersTestIndex, 1);
              }, 1000);
              res.status(200).send("Saved successfuly");
              testInProgress = false;
              usersTest = 0;
            }
          );
        }
      };
      loop();
    }
  });
});

//trial test start call
router.post("/trialteststart/:uid", auth, (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      if (testInProgress) {
        res.status(400).send("Test in progress. Try again later.");
      }
      if (!testInProgress) {
        var requestBody = req.body; //receives devices data array
        beforeTest(requestBody, res, req.params); //then passes the devices data array to beforeTest() function
      }
    }
  });
});

//cut power to all devices in test
router.post("/cutpowerall", auth, (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      req.connection.setTimeout(1000 * 60 * 60);
      var user = req.body.user;
      cutPowerAll(res, user);
    }
  });
});

//cut power to a single device in test
router.post("/cutpowersingle", auth, (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      req.connection.setTimeout(1000 * 60 * 60);
      var user = req.body.user;
      cutPowerSingle(res, req, user);
    }
  });
});

//get test info live
router.get("/testinfo/:uid", auth, (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      var usersTest = findUsersTest(req.params.uid);

      if (usersTest) {
        var hasAccess = false;
        if (typeof usersTest !== "undefined" && testInProgress) {
          if (
            parseInt(usersTest.user_id) === parseInt(req.params.uid) ||
            !testInProgress
          ) {
            hasAccess = true;
          }
        }
        res.send([
          {
            isTest: testInProgress,
            hasAccess: hasAccess,
          },
          usersTest,
        ]);
      } else res.send([]);
    }
  });
});

//device result user input
router.post("/userinput/:id", auth, (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      var usersDevices = findUsersTest(req.body.user).devices;
      var deviceIndex = usersDevices.findIndex(
        (x) => parseInt(x.id) === parseInt(req.params.id)
      );
      usersDevices[deviceIndex].userInput = req.body.userInput;
      console.log(usersDevices[deviceIndex]);
      res.send(usersDevices);
    }
  });
});

//device result user input
router.post("/setchecked", auth, (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      var devices = req.body.devices;
      var setValue = req.body.value;
      var usersDevices = findUsersTest(req.body.user).devices;
      // console.log("setchecked", setValue);
      devices.forEach((el) => {
        usersDevices.find((findEl, index) => {
          if (el.id === findEl.id) {
            findEl.userInput = setValue;
            // console.log(el.id, findEl.id, index);
          }
        });
      });
      res.status(200).send("All good");
    }
  });
});

router.post("/app/relay/on", auth, (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      let received = false;
      let nodeID = req.body.node_id;
      let messages = [];

      device.publish(
        sendTopic2,
        `${nodeID}10018202000196`,
        { qos: 1 },
        (err) => {
          if (err) {
            var errTimeout = setTimeout(() => {
              console.log(err, "retrying in 10s");
            }, 10000);
          } else {
            var msgTimeout = setTimeout(() => {
              console.log("NO RES:", nodeID);
              res.status(400).send(`NO RES: ${nodeID}`);
            }, 6000);
            device.handleMessage = (packet, callback) => {
              clearInterval(msgTimeout);
              clearInterval(errTimeout);
              const message = packet.payload.toString("utf8");
              const arrayContainsMessage = messages.includes(message);
              const rawResponse = message.slice(13, 25);
              const destinationNode = rawResponse.slice(0, 4);
              const paramData = rawResponse.slice(8, 12);
              if (!arrayContainsMessage && !received) {
                received = true;
                messages.push(message);
                console.log(message);
                res.status(200).send(`${destinationNode}: SET ON`);
                callback(packet);
              } else callback(packet);
            };
          }
        }
      );
    }
  });
});

router.post("/app/relay/off", auth, (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      let received = false;
      let nodeID = req.body.node_id;
      let messages = [];

      device.publish(
        sendTopic2,
        `${nodeID}10018202000096`,
        { qos: 1 },
        (err) => {
          if (err) {
            var errTimeout = setTimeout(() => {
              console.log(err, "retrying in 10s");
            }, 10000);
          } else {
            var msgTimeout = setTimeout(() => {
              console.log("NO RES:", nodeID);
              res.status(400).send(`NO RES: ${nodeID}`);
            }, 6000);
            device.handleMessage = (packet, callback) => {
              clearInterval(msgTimeout);
              clearInterval(errTimeout);
              const message = packet.payload.toString("utf8");
              const arrayContainsMessage = messages.includes(message);
              const rawResponse = message.slice(13, 25);
              const destinationNode = rawResponse.slice(0, 4);
              const paramData = rawResponse.slice(8, 12);
              if (!arrayContainsMessage && !received) {
                received = true;
                messages.push(message);
                console.log(message, paramData);
                res.status(200).send(`${destinationNode}: SET OFF`);
                callback(packet);
              } else callback(packet);
            };
          }
        }
      );
    }
  });
});

router.post("/app/relay/state", auth, (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      let received = false;
      let nodeID = req.body.node_id;
      let messages = [];

      device.publish(
        sendTopic2,
        `${nodeID}10018201000096`,
        { qos: 1 },
        (err) => {
          if (err) {
            var errTimeout = setTimeout(() => {
              console.log(err, "retrying in 10s");
            }, 10000);
          } else {
            var msgTimeout = setTimeout(() => {
              console.log("NO RES:", nodeID);
              res.status(400).send(`NO RES: ${nodeID}`);
            }, 6000);
            device.handleMessage = (packet, callback) => {
              clearInterval(msgTimeout);
              clearInterval(errTimeout);
              const message = packet.payload.toString("utf8");
              const arrayContainsMessage = messages.includes(message);
              const rawResponse = message.slice(13, 25);
              const destinationNode = rawResponse.slice(0, 4);
              const paramData = rawResponse.slice(8, 12);

              if (!arrayContainsMessage && !received) {
                switch (paramData) {
                  case "0000":
                    res.status(200).send(`${destinationNode}: OFF`);
                    break;
                  case "0001":
                    res.status(200).send(`${destinationNode}: ON`);
                    break;
                  default:
                    res.status(200).send(`${destinationNode}: UNKNOWN_RES`);
                }
                received = true;
                messages.push(message);
                console.log(message);
                callback(packet);
              } else callback(packet);
            };
          }
        }
      );
    }
  });
});

router.post("/dev/relay/on", auth, (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      var deviceData = req.body.devices;
      let counter = 0;
      const length = deviceData.length;
      var messages = [];

      loop = () => {
        if (counter < length) {
          const deviceId = deviceData[counter].node_id;
          var topic = deviceData[counter].mqtt_topic_out;
          console.log(deviceData[counter].node_id);

          publishRelayOn = () => {
            device.publish(
              topic,
              `${deviceId}10018202000196`,
              { qos: 1 },
              (err) => {
                if (err) {
                  var errTimeout = setTimeout(() => {
                    console.log(err, "retrying in 10s");
                    setTimeout(loop, 1000);
                  }, 10000);
                } else {
                  console.log("published");
                  var msgTimeout = setTimeout(() => {
                    console.log("No response, retrying...");
                    setTimeout(loop, 1000);
                  }, 6000);
                  device.handleMessage = (packet, callback) => {
                    clearInterval(msgTimeout);
                    clearInterval(errTimeout);
                    var message = packet.payload.toString("utf8");
                    var arrayContainsMessage = messages.includes(message);
                    var msg_node_id = message.slice("13", "17");
                    if (!arrayContainsMessage) {
                      messages.push(message);
                      console.log(message, msg_node_id);
                      counter++;
                      setTimeout(loop, 500);
                      callback(err, packet);
                    }
                  };
                }
              }
            );
          };
          publishRelayOn();
        } else {
          console.log("done", counter, length);
          counter = 0;
          res.send("Done");
        }
      };
      loop();
    }
  });
});

router.post("/dev/relay/off", auth, (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      var deviceData = req.body.devices;
      let counter = 0;
      const length = deviceData.length;
      var messages = [];

      loop = () => {
        if (counter < length) {
          const deviceId = deviceData[counter].node_id;
          var topic = deviceData[counter].mqtt_topic_out;
          console.log(deviceData[counter].node_id);

          publishRelayOn = () => {
            device.publish(
              topic,
              `${deviceId}10018202000096`,
              { qos: 1 },
              (err) => {
                if (err) {
                  var errTimeout = setTimeout(() => {
                    console.log(err, "retrying in 10s");
                    setTimeout(loop, 1000);
                  }, 10000);
                } else {
                  console.log("published");
                  var msgTimeout = setTimeout(() => {
                    console.log("No response, retrying...");
                    setTimeout(loop, 1000);
                  }, 6000);
                  device.handleMessage = (packet, callback) => {
                    clearInterval(msgTimeout);
                    clearInterval(errTimeout);
                    var message = packet.payload.toString("utf8");
                    var arrayContainsMessage = messages.includes(message);
                    var msg_node_id = message.slice("13", "17");
                    if (!arrayContainsMessage) {
                      messages.push(message);
                      console.log(message, msg_node_id);
                      counter++;
                      setTimeout(loop, 500);
                      callback(err, packet);
                    }
                  };
                }
              }
            );
          };
          publishRelayOn();
        } else {
          console.log("done", counter, length);
          counter = 0;
          res.send("Done");
        }
      };
      loop();
    }
  });
});

router.post("/dev/relay/state", auth, (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      var deviceData = req.body.devices;
      let counter = 0;
      const length = deviceData.length;
      var messages = [];
      console.log(req.body.topic);

      loop = () => {
        if (counter < length) {
          const deviceId = deviceData[counter].node_id;
          var topic = deviceData[counter].mqtt_topic_out;
          console.log(deviceData[counter].node_id);
          let msgReceived = false;

          publishGetState = () => {
            device.publish(
              topic,
              `${deviceId}10018201000096`,
              { qos: 1 },
              (err) => {
                if (err) {
                  var errTimeout = setTimeout(() => {
                    console.log(err, "retrying in 10s");
                    setTimeout(loop, 1000);
                  }, 10000);
                } else {
                  console.log("published on:", topic);
                  var msgTimeout = setTimeout(() => {
                    console.log("No response, retrying...");
                    setTimeout(loop, 1000);
                  }, 5000);
                  device.handleMessage = (packet, callback) => {
                    clearInterval(msgTimeout);
                    clearInterval(errTimeout);
                    var message = packet.payload.toString("utf8");
                    var arrayContainsMessage = messages.includes(message);
                    var msg_node_id = message.slice("13", "17");
                    if (!arrayContainsMessage) {
                      msgReceived = true;
                      insertMsg(message);
                      messages.push(message);
                      console.log(message, msg_node_id);
                      counter++;
                      setTimeout(loop, 500);
                      callback(packet);
                    } else {
                      callback();
                    }
                  };
                }
              }
            );
          };
          publishGetState();
        } else {
          console.log("done", counter, length);
          counter = 0;
          res.send(messages);
        }
      };
      loop();
    }
  });
});

router.post("/dev/led/state", auth, (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      let response = false;
      var deviceData = req.body.devices;
      let counter = 0;
      const length = deviceData.length;
      var messages = [];

      loop = () => {
        if (counter < length) {
          const deviceId = deviceData[counter].node_id;
          var topic = deviceData[counter].mqtt_topic_out;
          console.log(deviceData[counter].node_id);

          publishGetState = () => {
            device.publish(
              topic,
              `${deviceId}10038205000096`,
              { qos: 1 },
              (err) => {
                if (err) {
                  setTimeout(() => {
                    publishGetState();
                    console.log("retrying in 5s");
                  }, 5000);
                } else {
                  console.log("published on:", topic);
                  var msgTimeout = setTimeout(() => {
                    console.log("No response");
                    counter++;
                    loop();
                  }, 6000);
                  device.handleMessage = (packet, callback) => {
                    clearInterval(msgTimeout);
                    var message = packet.payload.toString("utf8");
                    var arrayContainsMessage = messages.includes(message);
                    var msg_node_id = message.slice("13", "17");
                    if (!arrayContainsMessage) {
                      insertMsg(message);
                      messages.push(message);
                      console.log(message, msg_node_id);
                      counter++;
                      setTimeout(loop, 500);
                      callback(packet);
                    } else {
                      callback();
                    }
                  };
                }
              }
            );
          };
          publishGetState();
        } else if (!response) {
          response = true;
          console.log("done", counter, length);
          counter = 0;
          res.send(messages);
        }
      };
      loop();
    }
  });
});

router.post("/dev/light/on", auth, (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      var deviceData = req.body.devices;
      let counter = 0;
      const length = deviceData.length;
      var messages = [];

      loop = () => {
        if (counter < length) {
          const deviceId = deviceData[counter].light_node_id;
          var topic = deviceData[counter].mqtt_topic_out;
          console.log(deviceData[counter].light_node_id);

          publishGetState = () => {
            device.publish(
              topic,
              `${deviceId}10018202000095`,
              { qos: 1 },
              (err) => {
                if (err) {
                  setTimeout(() => {
                    publishGetState();
                    console.log("retrying in 5s");
                  }, 5000);
                } else {
                  console.log("published on:", topic);
                  var msgTimeout = setTimeout(() => {
                    console.log("No response");
                    counter++;
                    loop();
                  }, 6000);
                  device.handleMessage = (packet, callback) => {
                    clearInterval(msgTimeout);
                    var message = packet.payload.toString("utf8");
                    var arrayContainsMessage = messages.includes(message);
                    var msg_node_id = message.slice("13", "17");
                    if (!arrayContainsMessage) {
                      insertMsg(message);
                      messages.push(message);
                      console.log(message, msg_node_id);
                      counter++;
                      setTimeout(loop, 500);
                      callback(packet);
                    } else {
                      callback();
                    }
                  };
                }
              }
            );
          };
          publishGetState();
        } else {
          console.log("done", counter, length);
          counter = 0;
          res.send(messages);
        }
      };
      loop();
    }
  });
});

router.post("/dev/light/off", auth, (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      var deviceData = req.body.devices;
      let counter = 0;
      const length = deviceData.length;
      var messages = [];

      loop = () => {
        if (counter < length) {
          const deviceId = deviceData[counter].light_node_id;
          var topic = deviceData[counter].mqtt_topic_out;
          console.log(deviceData[counter].light_node_id);

          publishGetState = () => {
            device.publish(
              topic,
              `${deviceId}10018202000194`,
              { qos: 1 },
              (err) => {
                if (err) {
                  setTimeout(() => {
                    publishGetState();
                    console.log("retrying in 5s");
                  }, 5000);
                } else {
                  console.log("published on:", topic);
                  var msgTimeout = setTimeout(() => {
                    console.log("No response");
                    counter++;
                    loop();
                  }, 6000);
                  device.handleMessage = (packet, callback) => {
                    clearInterval(msgTimeout);
                    var message = packet.payload.toString("utf8");
                    var arrayContainsMessage = messages.includes(message);
                    var msg_node_id = message.slice("13", "17");
                    if (!arrayContainsMessage) {
                      insertMsg(message);
                      messages.push(message);
                      console.log(message, msg_node_id);
                      counter++;
                      setTimeout(loop, 500);
                      callback(packet);
                    } else {
                      callback();
                    }
                  };
                }
              }
            );
          };
          publishGetState();
        } else {
          console.log("done", counter, length);
          counter = 0;
          res.send(messages);
        }
      };
      loop();
    }
  });
});

router.post("/dev/gateway/state", auth, (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      var topic = req.body.topic;
      var received = 0;

      console.log(topic);
      device.publish(topic, `XchkX`, { qos: 1 }, (err) => {
        let timeout = setTimeout(() => {
          received = 1;
          res.send(`${topic}: NO RES`);
        }, 8000);
        device.handleMessage = (packet, callback) => {
          var message = packet.payload.toString("utf8");
          if (received === 0) {
            clearTimeout(timeout);
            received = 1;
            console.log(message);
            res.send(message);
            callback();
          } else callback();
        };
      });
    }
  });
});

router.post("/dev/ldr", auth, (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      var deviceData = req.body.devices;
      let counter = 0;
      const length = deviceData.length;
      var messages = [];

      loop = () => {
        if (counter < length) {
          const deviceId = deviceData[counter].light_node_id;
          var topic = deviceData[counter].mqtt_topic_out;
          console.log(deviceData[counter].light_node_id);

          publishGetState = () => {
            device.publish(
              topic,
              `${deviceId}10038205000096`, //cmd to read ldr sensor
              { qos: 1 },
              (err) => {
                if (err) {
                  setTimeout(() => {
                    publishGetState();
                    console.log("retrying in 5s");
                  }, 5000);
                } else {
                  console.log("published on:", topic);
                  var msgTimeout = setTimeout(() => {
                    console.log("No response");
                    counter++;
                    loop();
                  }, 6000);
                  device.handleMessage = (packet, callback) => {
                    clearInterval(msgTimeout);
                    const message = packet.payload.toString("utf8");
                    const ldrReading = parseInt(
                      `0x${message.slice(21, 25)}`
                    ).toFixed(4);
                    let arrayContainsMessage = messages.includes(message);
                    const msg_node_id = message.slice("13", "17");
                    var el = messages.find((a) => a.includes(msg_node_id));
                    let onOff =
                      ldrReading > 2000 ? "EM Lamp ON" : "EM Lamp OFF";

                    if (!el) {
                      insertMsg(message);
                      messages.push(`${message} ldr: ${ldrReading} ${onOff}`);
                      console.log(message, msg_node_id, ldrReading);
                      counter++;
                      setTimeout(loop, 1000);
                      callback(packet);
                    } else {
                      callback();
                    }
                  };
                }
              }
            );
          };
          publishGetState();
        } else {
          console.log("done", counter, length);
          counter = 0;
          res.send(messages);
        }
      };
      loop();
    }
  });
});

router.post("/dev/voltage", auth, (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      var deviceData = req.body.devices;
      let counter = 0;
      const length = deviceData.length;
      var messages = [];

      loop = () => {
        if (counter < length) {
          const deviceId = deviceData[counter].volt_reading_node_id;
          var topic = deviceData[counter].mqtt_topic_out;
          console.log(deviceData[counter].volt_reading_node_id);

          publishGetState = () => {
            device.publish(
              topic,
              `${deviceId}10038205000096`,
              { qos: 1 },
              (err) => {
                if (err) {
                  setTimeout(() => {
                    publishGetState();
                    console.log("retrying in 5s");
                  }, 5000);
                } else {
                  console.log("published on:", topic);
                  var msgTimeout = setTimeout(() => {
                    console.log("No response");
                    counter++;
                    loop();
                  }, 6000);
                  device.handleMessage = (packet, callback) => {
                    clearInterval(msgTimeout);
                    const message = packet.payload.toString("utf8");
                    const msgSliced = parseInt(`0x${message.slice(21, 25)}`);
                    let arrayContainsMessage = messages.includes(message);
                    const msg_node_id = message.slice("13", "17");
                    let voltage = msgSliced / 1241.212121 / 0.3;
                    var el = messages.find((a) => a.includes(msg_node_id));

                    if (!el) {
                      insertMsg(message);
                      messages.push(
                        `${message} voltage: ${voltage.toFixed(4)}v`
                      );
                      console.log(
                        message,
                        msg_node_id,
                        voltage.toFixed(4),
                        msgSliced
                      );
                      counter++;
                      setTimeout(loop, 1500);
                      callback(packet);
                    } else {
                      callback();
                    }
                  };
                }
              }
            );
          };
          publishGetState();
        } else {
          console.log("done", counter, length);
          counter = 0;
          res.send(messages);
        }
      };
      loop();
    }
  });
});

router.post("/dev/manual/cmd", auth, (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      var topic = req.body.topic;
      var received = 0;

      console.log(topic);
      device.publish(topic, req.body.command, { qos: 1 }, (err) => {
        var msgTimeout = setTimeout(() => {
          res.send({ message: `NO RES: ${req.body.command}` });
        }, 6000);
        device.handleMessage = (packet, callback) => {
          var message = packet.payload.toString("utf8");
          if (received === 0) {
            clearTimeout(msgTimeout);
            received = 1;
            console.log(message);
            res.send(message);
            callback(packet);
          } else callback(packet);
        };
      });
    }
  });
});

module.exports = router;
