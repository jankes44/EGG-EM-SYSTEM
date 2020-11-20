const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const con = require("../database/db2");
var mqtt = require("mqtt");
var schedule = require("node-schedule");
const { on } = require("../database/db2");
const clonedeep = require("lodash.clonedeep");
const nodemailer = require("nodemailer");
const MqttDevice = require("./Clients/MqttDevice")
const clients = require("./Clients/clients.json");
const { Error } = require("sequelize/types");

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

let testInProgress = {false}
var devicesLive = [];

// Queries
const insertTest = "INSERT INTO trial_tests SET ?"
const insertTestLights = "INSERT INTO trial_tests_has_lights SET ?"
const getSensors = "select s.node_id, s.`type` from sensors s join lights l on s.parent_id  = l.id where l.id = ?"
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

const beforeTest = async (userId, deviceIds, nodeIds, testType, errorFunc, site) => {
    let promise = new Promise((resolve, reject) => {
      let devicesCopy = [];
        
      mqttClients[site].testInProgress = true 
      
      const data = {
        lights: device_ids.length,
        result: "In Progress",
        type: testType,
      };
  
      con.query(insertTrial, data, (err, result) => {
        const testId = result.insertId;
        con.query(getLight, [deviceIds], (err, rows) => {
          if (err) errorFunc(err)
          const devices = rows;
          let counter = 0;
          devices.forEach((el) => {
            const params = { trial_tests_id: result.insertId, lights_id: el.id };
            con.query(insertTrialLight, params, (err) => {
              if (err) errorFunc(err)
              con.query(selectSensors, el.id, (err, result) => {
                if (err) errorFunc(err)
                let hasSensors
                let sensors  
                if (result.length > 0) {
                  sensors = result.map((r) => ({
                    sensor_id: r.node_id,
                    type: r.type,
                  }));
                  hasSensors = true;
                } else {
                  hasSensors = false;
                }
                const d = new LiveTestDevice(el, testTime[testType], userId, testId, hasSensors, sensors)
                devicesCopy.push(d);
                counter++;
                if (counter >= devices.length) {
                  liveTests.push({
                    test_id: testId,
                    status: "In progress",
                    user_id: userId,
                    devices: devicesCopy,
                    cut_all_clicked: 0,
                    abort_clicked: 0,
                    finish_clicked: 0,
                    type: testType,
                  });
                  resolve(devicesCopy);
                }
              });
            });
          });
        });
      });
    });
    let result = await promise;
    return result;
  };


//TODO
  async function checkDeviceState(counter, topic, deviceId, user, type, site) {
    let promise = new Promise((resolve, reject) => {
      var usersDevices = findUsersTest(user).devices;
      var messages = new Set();
      let received = false;
      const command = type === "led" ? "10038205000096" : "10018201000096";
      mqttClients[site].publish(deviceId, command)
      .then(deviceId => {
        console.log("state check: " + deviceId);
        const msgTimeout = this.timeout(deviceId, () => {
            usersDevices[counter].powercut = 3; //state 3 = no response
            usersDevices[counter].result.add("Weak connection to mesh");
            updateDeviceState(usersDevices[counter]);
            resolve("No response")
        })
        this.setMessageHandler(msgTimeout, success)
      })
        
          
  
          var msgTimeout = setTimeout(() => {
            //if no response from device in X seconds, continue the loop
            ;
          }, noResponseTimeout);
  
          checkMsgState = (msg) => {
            const msgCut = msg.slice(21, 25).toUpperCase();
            console.log(msg, msgCut, counter);
            switch (msgCut) {
              case "0CCD":
                console.log(usersDevices[counter].result);
                break;
              case "6666":
                usersDevices[counter].result.add("Battery disconnected");
                console.log(usersDevices[counter].result);
                break;
              case "7FFF":
                usersDevices[counter].result.add("Battery powered");
                console.log(usersDevices[counter].result);
                break;
            }
            updateDeviceState(usersDevices[counter]);
          };
  
          device.handleMessage = (packet, callback) => {
            clearInterval(msgTimeout); //if  got the message cancel the timeout on
            var message = packet.payload.toString("utf8");
            if (!messages.has(message) && !received) {
              received = true;
              messages.add(message);
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

  sendTest = () => {
    this.publish("004E", "10018202000096").then(deviceId => {
        const msgTimeout = this.timeout(deviceId, error)
    this.setMessageHandler(msgTimeout, success)
    })
}



module.exports = router;
