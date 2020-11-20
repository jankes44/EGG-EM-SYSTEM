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

// CORE Functions
const beforeTest = async (userId, deviceIds, testType, siteId) => {
    let promise = new Promise((resolve, reject) => {
      let testId 
        
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
        return Promise.map(rows, el => con.query(getSensors, el.id)
          .spread((rows, fields) => {
            const d = new LiveTestDevice(el, testTime[testType], userId, testId)
            d.addSensors(rows)
          }))
        })
        .then(devices => {
          liveTests.push(new LiveTest(testId, userId, devices, testType))
          resolve("Success")
        })
      .catch(err => reject(err))
  })
  let result = await promise;
  return result;
}


// HELPERS
const checkDeviceState = async (counter, topic, deviceId, user, type, site) => {
  const promise = new Promise((resolve, reject) => {
    const mqttMessager = mqttClients[site]
    const usersDevices = findUsersTest(user).devices
    let currentDevice = usersDevices[counter]
    let messages = new Set()
    let received = false
    const command = type === "led" ? "10038205000096" : "10018201000096"
   mqttMessager.publish(deviceId, command)
    .then(deviceId => {
      console.log("state check: " + deviceId);
      const msgTimeout = this.timeout(deviceId, () => {
        currentDevice.setNoResponse()
        currentDevice.addResult("Weak connection to mesh");
        reject("No response")
      })
      mqttMessager.setMessageHandler(msgTimeout, (message) => {
        if (!messages.has(message) && !received) {
          received = true;
          messages.add(message);
          insertMsg(message)
          currentDevice.checkMessageState(message)
          resolve(message)
        }
      })
    })
  })
  let result = await promise; // wait until the promise resolves (*)
  return result;  
}

beforeTest(42, [210,211,212], "Whatever", 3)
.then(r => console.log(r))
.catch(err => console.log(err))


