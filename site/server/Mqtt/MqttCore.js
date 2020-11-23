const Promise = require("bluebird");
const mqtt = require("mqtt");
const schedule = require("node-schedule");
const clonedeep = require("lodash.clonedeep");
const nodemailer = require("nodemailer");

const con = require("../database/db_promise");

const MqttDevice = require("./Clients/MqttDevice")
const clients = require("./Clients/clients.json");
const LiveTestDevice = require("./LiveTestDevice")
const LiveTest = require("./LiveTest")

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

var liveTests = []

// Queries
const insertTest = "INSERT INTO trial_tests SET ?"
const insertTestLights = "INSERT INTO trial_tests_has_lights SET ?"
const getSensors = "select l.id as light_id, s.node_id, s.`type` from sensors s join lights l on s.parent_id  = l.id where l.id = ?"
const getLights = "Select * from lights where id in (?)";

const findUsersSiteTest = (user, site) => {
  const usersTestDetails = liveTests.find(
    (el) => parseInt(el.userId) === parseInt(user) && parseInt(el.siteId) === parseInt(site)
  );
  console.log(liveTests.find(
    (el) => parseInt(el.userId) === parseInt(user) && parseInt(el.siteId) === parseInt(site)
  ), liveTests)
  if (typeof usersTestDetails !== "undefined") {
    return usersTestDetails;
  } else return "";
};

const startTest = async (userId, deviceIds, testType, siteId) => {
    let promise = new Promise((resolve, reject) => {
      let testId 
      console.log(mqttClients[siteId])

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
        return Promise.map(rows, (el) => con.query(getSensors, el.id)
          .spread((rows, fields) => {
            const d = new LiveTestDevice(el, testType, userId, testId, mqttClients[siteId])
            d.addSensors(rows)
            console.log(d)
            return d
          }))
        })
        .then(devices => {
          liveTests.push(new LiveTest(testId, userId, devices, testType, true, siteId))
          console.log(devices)
          resolve("Success")
        })
      .catch(err => reject(err))
      } 
  })
  let result = await promise;
  return result;
}

module.exports = {
  startTest: startTest,
  findUsersSiteTest: findUsersSiteTest
}


