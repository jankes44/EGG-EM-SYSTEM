const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const con = require("../database/db_promise");
var mqtt = require("mqtt");
var schedule = require("node-schedule");
const { on } = require("../database/db2");
const clonedeep = require("lodash.clonedeep");
const nodemailer = require("nodemailer");
const MqttDevice = require("./Clients/MqttDevice")
const clients = require("./Clients/clients.json");
const { reject } = require("lodash");
const LiveTestDevice = require("./LiveTestDevice")
const LiveTest = require("./LiveTest")

const testTime = {
    Annual: 10800000,
    Monthly: 180000,
  };
  
const testCheckpointsTime = {
Annual: [9900000, 3600000, 300000],
Monthly: [150000, 120000, 60000],
};

const cutInterval = 1000;
const relayBackOn = 360000;
const noResponseTimeout = 15000;
const QOS_1 = { qos: 1 };

const errorMessages = {
"0CCD": "",
"6666": "No connection to driver",
"7FFF": "Battery powered",
};

let mqttClients = {}
clients.forEach(el => {
    mqttClients[el.id] = new MqttDevice(el)
})

let testInProgress = false
var liveTests = []

// Queries
const insertTest = "INSERT INTO trial_tests SET ?"
const insertTestLights = "INSERT INTO trial_tests_has_lights SET ?"
const getSensors = "select l.id as light_id, s.node_id, s.`type` from sensors s join lights l on s.parent_id  = l.id where l.id = ?"
const getLights = "Select * from lights where id in (?)";

// Errors
const createRequestError = (res) => (err) => res.sendStatus(400)
const createAutomaticError = () => (err) => { throw err}    

//Successes
const createRequestSuccess = (res) => (data=null) => {
    if (data) res.json(data)
    else res.sendStatus(200)
}
const createAutomaticSuccess = () => (data=null) => console.log("Success")

const beforeTest = async (userId, deviceIds, testType, siteId) => {
    let promise = new Promise((resolve, reject) => {
      let testId 
      let devices = {}
        
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
        rows.forEach(el => devices[el.light_id] = new LiveTestDevice(el, testTime[testType], userId, testId))
        const sensorsPromises = rows.map(el => con.query(getSensors, el.id))
        const insertPromises = rows.map(el => {
          const params = { trial_tests_id: testId, lights_id: el.id }
          return con.query(insertTestLights, params)
        })
        await Promise.all(insertPromises);
        return sensorsPromises;
      })
      .all()
      .then(rows => {
        rows.forEach(r => {
          if (r.length > 0){
            const lightId = r[0].light_id
            devices[lightId].addSensors(r) 
          }
        })
        liveTests.push(new LiveTest(testId, userId, devices, testType));
        resolve("Success")
        })
      })
      .catch(err => reject(err))

    let result = await promise;
    return result;
}


// //TODO
//   async function checkDeviceState(counter, topic, deviceId, user, type, site) {
//     let promise = new Promise((resolve, reject) => {
//       var usersDevices = findUsersTest(user).devices;
//       var messages = new Set();
//       let received = false;
//       const command = type === "led" ? "10038205000096" : "10018201000096";
//       mqttClients[site].publish(deviceId, command)
//       .then(deviceId => {
//         console.log("state check: " + deviceId);
//         const msgTimeout = this.timeout(deviceId, () => {
//             usersDevices[counter].powercut = 3; //state 3 = no response
//             usersDevices[counter].result.add("Weak connection to mesh");
//             updateDeviceState(usersDevices[counter]);
//             resolve("No response")
//         })
//         this.setMessageHandler(msgTimeout, success)
//       })
        
          
  
//           var msgTimeout = setTimeout(() => {
//             //if no response from device in X seconds, continue the loop
//             ;
//           }, noResponseTimeout);
  
//           checkMsgState = (msg) => {
//             const msgCut = msg.slice(21, 25).toUpperCase();
//             console.log(msg, msgCut, counter);
//             switch (msgCut) {
//               case "0CCD":
//                 console.log(usersDevices[counter].result);
//                 break;
//               case "6666":
//                 usersDevices[counter].result.add("Battery disconnected");
//                 console.log(usersDevices[counter].result);
//                 break;
//               case "7FFF":
//                 usersDevices[counter].result.add("Battery powered");
//                 console.log(usersDevices[counter].result);
//                 break;
//             }
//             updateDeviceState(usersDevices[counter]);
//           };
  
//           device.handleMessage = (packet, callback) => {
//             clearInterval(msgTimeout); //if  got the message cancel the timeout on
//             var message = packet.payload.toString("utf8");
//             if (!messages.has(message) && !received) {
//               received = true;
//               messages.add(message);
//               setTimeout(() => {
//                 insertMsg(message);
//                 checkMsgState(message);
//                 console.log(messages);
//                 busy = false;
//                 resolve(message);
//                 callback(packet);
//               }, 500);
//             } else callback(packet);
//           };
//         }
//       );
//     });
  
//     let result = await promise; // wait until the promise resolves (*)
//     return result;
//   }

beforeTest(42, [210,211,212], "Whatever", 3)
.then(r => console.log(r))
.catch(err => console.log(err))


module.exports = router;
