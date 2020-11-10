const express = require("express");
const router = express.Router();
const { device } = require("./mqttconnect");
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const con = require("../database/db2");
var mqtt = require("mqtt");
var schedule = require("node-schedule");

const sendTopic2 = "DEVCOMSP";
const testTime = 10800000;
const cutInterval = 5000;
const relayBackOn = 1200000;
const noResponseWaitTime = 15000;

var liveTest = {};
var testInProgress = false;
var busy = false;

const QOS_1 = {qos: 1}

//Queries
const trialTestsInsert =  "INSERT INTO trial_tests SET ?";
const trialsTestsLightsInsert =  "INSERT INTO trial_tests_has_lights(trial_tests_id, lights_id) VALUES ?"
const updateAbortedTest = "UPDATE trial_tests SET result='Cancelled' WHERE id=?"
const updateLightsResults = "update trial_tests_has_lights set result=? where trial_tests_id=? and lights_id=?"
const updateDeviceStateQuery = "UPDATE lights SET status = ? WHERE id = ?"
const insertMessage = "INSERT INTO mqtt_messages SET ?"

// Messages
const MsgStates = {
    "0CCD": "Ok",
    "6666": "Battery disconnected",
    "7FFF": "Battery powered/under test"
}

// Commands
const checkDeviceLed = "10038205000096" 
const checkDeviceRelay = "10018201000096"

// generateDefaults
const generateTrialTestData = (lights, result="In Progress", set="Manual", type="Annual") => ({
        lights: lights,
        result: result,
        set: set,
        type: type,
    })

const generateDeviceStatus = (device, user, testId) =>
        Object.assign(device, {
            powercut: 0, 
            clicked: 0, 
            duration: testTime, 
            durationStart: testTime, 
            user: user, 
            userInput: "", 
            testid: testId
        })

const generateLiveTestStatus = (testId, userId, devices) => ({
    test_id: testId, 
    status: "In progress",
    user_id: userId,
    devices: devices,
    cut_all_clicked: 0,
    abort_clicked: 0,
    finish_clicked: 0
})

function checkDeviceState(counter, topic, deviceId, type) {
    const usersDevices = liveTest.devices;
    var messages = [];
    let received = false;
    const command = type === "led" ? checkDeviceLed : checkDeviceRelay;
    device.publish(topic, `${deviceId}${command}`, QOS_1)
    .then(() => {
        busy = true 
        console.log("state check: " + deviceId)
        const weakConnectionTimeout = createWeakConnectionTimeout(usersDevices[counter])
        device.handleMessage = (packet, callback) => {
            clearInterval(weakConnectionTimeout); //if  got the message cancel the timeout on
            const message = packet.payload.toString("utf8");
            if (!messages.includes(message) && !received) {
                received = true;
                messages.push(message);
                return createMqttLogTimeout(message, messages, callback)
        } else callback(packet);
    }
    })
}

// TIMEOUT HELPERS
const createMqttLogTimeout = (message, messages, callback) => {
    insertMsg(message);
    checkMsgState(message);
    console.log(messages);
    busy = false;
    callback(packet);
    return message
}

const createWeakConnectionTimeout = (device) => {
    return setTimeout(() => {
        //if no response from device in X seconds, continue the loop
        device.powercut = 3; //state 3 = no response
        updateDeviceState(
          "Weak connection to Mesh",
          device.id
        );
        busy = false;
        return "No Response"
      }, noResponseWaitTime);
}

const createNoResponseTimeout = (device) => {
    return setTimeout(() => {
        console.log("No response");
        device.powercut = 3;
    }, noResponseWaitTime)
}


//MESSAGE HELPERS
const checkMsgState = (msg, device) => {
    const msgCut = msg.slice(21, 25).toUpperCase();
    console.log(msg, msgCut, counter);
    console.log(device.userInput);
    updateDeviceState(MsgStates[msgCut], device.id);
}

async function insertMsg(msg) {
    const data = {
      raw_message: msg,
      message_content: msg.slice(13, 25),
      node_id: msg.slice(13, 17),
      param_data: msg.slice(21, 25),
    };
    con.query(insertMessage, data)
    .catch(err => {throw err})
  }
  
// DEVICE HELPERS
const updateDeviceState = (status, id) => {
    console.log("update device state:", status, id);
    con.query(updateDeviceStateQuery, [status, id])
    .then(err => {throw errr})
}

// MAIN FUNCTIONS
const startTest = (requestBody, res, userParam) => {
    testInProgress = true;
    usersTest = userParam.uid;
    var devices = requestBody.devices;
    var devicesCopy = [];
    trialTestData = generateTrialTestData(devices.length)
    con.query(trialTestsInsert, trialTestData)
    .then(result => {
        data = devices.map(d => ({trial_tests_id: result.insertId, lights_id: d.id}))
        return con.query(trialsTestsLightsInsert, data) 
    })
    .then(result => {
            const testId = result.insertId;
            const user = requestBody.user;
            devicesCopy = devices.map(d => generateDeviceStatus(d, user, testId))
            liveTest = generateLiveTestStatus(testId, user, devicesCopy)
            res.status(200).send("Devices ready, you can start the test")
    })
    .catch(() => res.sendStatus(500))
} 


// ROUTES

const start = (req, res) => {
    if (testInProgress) {
        res.status(400).send("Test in progress. Try again later.");
      }
      if (!testInProgress) {
        var requestBody = req.body; //receives devices data array
        startTest(requestBody, res, req.params); //then passes the devices data array to beforeTest() function
      }
}

const abort = (req, res) => {
    req.connection.setTimeout(1000 * 60 * 10);
    console.log(req.params.testid);

    let deviceId;
    var messages = [];
    liveTest.abort_clicked = 1;

    let counter = 0
    const usersDevices = liveTest.devices;
    const length = usersDevices.length;

    while (counter < length && testInProgress) {
        deviceId = usersDevices[counter].node_id;
        const topic = usersDevices[counter].mqtt_topic_out;
        let msgReceived = false;

        checkDeviceState(counter, topic, deviceId, user, "led")
        .then(msg => { 
                device.publish(topic, `${deviceId}10018202000196`, QOS_1)
                .then(() => {
                    console.log("published");
                    const noResponseTimeout = createNoResponseTimeout(usersDevices[counter]) 
                    device.handleMessage = (packet, callback) => {
                        clearInterval(noResponseTimeout);
                        const message = packet.payload.toString("utf8");
                        const arrayContainsMessage = messages.includes(message);
                        const msg_node_id = message.slice("13", "17");

                        if (!arrayContainsMessage && !msgReceived) {
                        if (!message.includes("hello")) {
                            messages.push(message);
                            console.log(message, msg_node_id);
                            msgReceived = true;
                            if (usersDevices.length > 0) {
                            usersDevices[counter].powercut = 2;
                            }
                            callback(packet);
                        }
                        } else {
                        console.log(message, arrayContainsMessage, msgReceived);
                        callback(packet);
                        }
                    }
                    })
            })
            counter ++
    }

    console.log("abort done", counter, length);
    counter = 0;
    const testId = req.params.testid
    con.query(updateAbortedTest, [testId])
    .then(() => {
        devicesLive.forEach((el) => await con.query(updateLightsResults, [el.userInput, testId, el.id]))
        res.status(200).send("Test cancelled");
        testInProgress = false;
        liveTest = null 
    })
}


// ROUTES
router.post("/trialteststart/:uid", auth, start)
router.post("/aborttest/:testid", auth, abort)

module.exports = router;
