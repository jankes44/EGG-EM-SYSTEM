const con = require("../database/db_promise");
const Promise = require("bluebird")

const {insertMsg, insertVoltLdrReading} = require("./MqttHelpers");
const { reject } = require("lodash");
const MqttDevice = require("./Clients/MqttDevice");

const updateStatusQuery = `UPDATE lights SET status = ? WHERE id = ?`

const errorMessages = {
    "0CCD": "",
    "6666": "No connection to driver",
    "7FFF": "Battery powered",
};

const testTime = {
    Annual: 10800000,
    Monthly: 180000,
};

const testCheckpointsTime = {
    "Annual": new Set([9900000, 3600000, 300000]),
    "Monthly": new Set([150000, 120000, 60000]),
};

class LiveTestDevice {
    /**
     * @constructor
     * @param {*} device 
     * @param {String} testType 
     * @param {Number} userId 
     * @param {Number} testId 
     * @param {MqttDevice} messenger 
     */
    constructor(device, testType, userId, testId, messenger){
        this.deviceId = device.id 
        this.nodeId = device.node_id
        this.powercut = 0
        this.clicked = 0;
        this.duration = testTime[testType];
        this.durationStart =  testTime[testType];
        this.user = userId;
        this.result = new Set();
        this.testid = testId;
        this.messenger = messenger
    }

    /**
     * 
     * @param {Array<*>} sensorsList
     * 
     */
    addSensors = (sensorsList) => { 
        if (sensorsList.length > 0){
            this.hasSensors = true 
            this.sensors = sensorsList.map(r => ({ sensorId: r.node_id, type: r.type}))
        }
        else this.hasSensors = false
    }

    setNoResponse = () => {
        this.powercut = 3
        this.addResult("Weak connection to mesh")
    }

    setTestFinished = () => {
        this.powercut = 2 
        this.result.delete("Battery powered") 
        this.updateDeviceState() 
    }
    
    addResult = (r) => {
        this.result.add(r)
        this.updateDeviceState()
    }

    /**
     * 
     * @param {String} r 
     */
    removeResult = (r) => {
        this.result.remove(r)
        this.updateDeviceState()
    }

    getDeviceStatus = () => {
        const status_ = Array.from(this.result).join(", ");
        if (this.result.size === 0) 
            return "OK"
        else if (this.result.size === 1 && this.result.has("Battery powered")) 
            return [status_, "OK"].join(", ")
        else
            return status_;
    }

    updateDeviceState = () => {
        const status = this.getDeviceStatus()
        console.log("update device state:", status, this.result)

        con.query(updateStatusQuery, [status, this.id])
        .catch(err => {throw err})
    }

    
    checkMessageState = (msg) => {
        const msgCut = msg.slice(21, 25).toUpperCase()
        const error = errorMessages[msgCut]
        if (error.length > 0) this.addResult(error) 
    }

    testLoop = async (testType) => {
        console.log(this.nodeId, this.duration)
        this.duration = this.duration - 1000
        if (testCheckpointsTime[testType].has(this.duration)) {
            const firstCheckpoint = this.duration === testCheckpointsTime[testType][0]
            let messages = new Set();
            if (this.hasSensors){
                Promise.each(this.sensors, s => this.testSensor(s, messages, firstCheckpoint), {concurrency: 1})
                .then(() => console.log("OK"))
                .catch(err => console.log(err))
            }
        }

        if (this.duration === 0){
            clearInterval(this.testInterval)
            let messages = new Set();
            const deviceId = this.nodeId
            this.checkDeviceState("led")
            .then(msg => this.messenger.publish(deviceId, "10018202000196"))
            .then(message => {
                console.log(`${deviceId}: MAIN ON`)
                if (!messages.has(message) && !message.includes("hello")){
                    const msg_node_id = message.slice("13", "17")
                    console.log(message, msg_node_id, "test");
                    messages.add(message);
                    setTestFinished()
                    }
                    else console.log(message, arrayContainsMessage)
                })
            .catch(() => this.setNoResponse())
            }
          }

    testSensor = async (sensor, messages, firstCheckpoint) => {
        return new Promise((resolve, reject) => {
            const type = sensor.type.toLowerCase()
            console.log(sensor, "W")
            this.messenger.publish(sensor.sensorId, "10038205000096")
            .then(message => {
                const msgSliced = parseInt(`0x${message.slice(21, 25)}`)
                const msg_node_id = message.slice("13", "17")
                const messageIsNew = !setFind(messages, (a) => a.includes(msg_node_id));
                if (messageIsNew){
                    sensor.sensor_responded = true;
                    switch(type){
                        case "vbat": resolve(this.readFromVbat(sensor, msgSliced, messages)) 
                        break
                        case "ldr": resolve(this.readFromLdr(sensor, msgSliced, messages, firstCheckpoint))
                        break
                    }
                }
            })
            .catch(err => {
                // this.addResult("Weak connection to mesh");
                resolve("No response")
            }) 
        })
    }

    checkDeviceState = async (type) => {
        const promise = new Promise((resolve, reject) => {
        const deviceId = this.nodeId
        let messages = new Set()
        let received = false
        const command = type === "led" ? "10038205000096" : "10018201000096"
        this.messenger.publish(deviceId, command)
        .then(message => {
            console.log("state check: " + deviceId);
            if (!messages.has(message) && !received) {
                received = true;
                messages.add(message);
                insertMsg(message)
                this.checkMessageState(message)
                resolve(message)
              }
            })
        .catch(err => {
            this.setNoResponse()
            reject("No response")
        })
    })
           
    let result = await promise;
    return result;  
    }

    readFromVbat = (sensor, msgSliced, messages) => {
        const voltage = (msgSliced / 1241.212121 / 0.3).toFixed(4)
        messages.add(`${message} voltage: ${voltage}v`)
        sensor.voltage = voltage
        if (voltage > 3 || voltage < 2) this.addResult("Battery fault") 
        resolve(voltage)
    }

    readFromLdr = (sensor, msgSliced, messages, firstCheckpoint) => {
        sleep(2000).then(() => {
            const ldrReading = msgSliced.toFixed(2)
            let onOff
            if (ldrReading > 3000) onOff = "EM Lamp ON"
            else {
                onOff = "EM Lamp OFF";
                if (firstCheckpoint) {
                  this.addResult("Lamp Fault");
                }
                this.addResult("Battery Fault");
              }
            insertMsg(message, type, "", ldrReading);
            messages.add(`${message} ldr: ${ldrReading} ${onOff}`)
            sensor.reading = onOff;
            resolve(onOff)
        })
    }

    // NB 
    // 1. When using Promise.map/each/all the function should just return the promise 
    // 2. When using Promise.map/each/all if the callback rejects it exits the loop
    cutPower = async (testType) => {
        return new Promise((resolve, reject) => {
            console.log(this.nodeId)
            let messages = new Set()
            let received = false 
            if (this.powercut === 0){
                this.messenger.publish(this.nodeId, "10018202000096")
                .then(message => {
 //                   let msg_node_id = message.slice("13", "17");
                        if (!messages.has(message) && !message.includes("hello") && !received) {
                            messages.add(message);
                            this.addResult("Battery powered");
                            this.powercut = 1
                            received = true;
                            this.durationCounterStart(testType)
                            resolve(this.deviceId)
                        }
                        else resolve(false)
                })
                .catch(err => {
                    console.log(this.nodeId, "NO Response")
                    this.setNoResponse()
                    resolve(err)
                })
            }
            else reject("Power already cut " + this.nodeId)
        })
    }

    abort = (messages) => {
        return new Promise((resolve, reject) => {
            this.checkDeviceState("relay")
            .then(msg => {
                let msgReceived = false
                this.messenger.publish(this.nodeId, "10018202000196")
                .then(message => {
                    if (!messages.has(message) && !msgReceived && !message.includes("hello")){
                        messages.add(message)
                        console.log(message, msg_node_id, counter);
                        msgReceived = true;
                        this.powercut = 2
                        this.removeResult("Battery powered")
                        resolve(this.nodeId)   
                    }
                })
                .catch(err => {
                    console.log(this.nodeId, "NO Response")
                    this.setNoResponse()
                    resolve(err)
                })
            })
            .catch(err => {
                console.log(this.nodeId, "NO Response")
                this.setNoResponse()
                resolve(err)
            })
            this.messenger.publish()
        })
    }

    durationCounterStart = (testType) => {
        this.testInterval = setInterval(() => this.testLoop(testType), 1000)
    }   
}


async function sleep(ms) {
    let promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve("");
      }, ms);
    });
    let result = await promise;
    return result;
  }

const setFind = (set, cb) => {
for (const e of set) {
    if (cb(e)) return e;
    }
};  

module.exports = LiveTestDevice