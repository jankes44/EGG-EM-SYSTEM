const con = require("../database/db_promise");

const updateStatusQuery = `UPDATE lights SET status = ? WHERE id = ?`

const errorMessages = {
    "0CCD": "",
    "6666": "No connection to driver",
    "7FFF": "Battery powered",
};

const testCheckpointsTime = {
    Annual: new Set([9900000, 3600000, 300000]),
    Monthly: new Set([150000, 120000, 60000]),
};

class LiveTestDevice {
    constructor(device, duration, userId, testId, messenger){
        this.deviceId = device.id 
        this.nodeId = device.node_id
        this.powercut = 0
        this.clicked = 0;
        this.duration = duration;
        this.durationStart = this.duration;
        this.user = userId;
        this.result = new Set();
        this.testid = testId;
        this.messenger = messenger
    }

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

    testLoop = (testType) => {
        this.duration = this.duration - 1000
        if (testCheckpointsTime[testType].has(this.duration)) {
            let messages = new Set();
            if (this.hasSensors){
                this.sensors.forEach(s => this.testSensor(s, messages).then(() => "OK"))
            }
        }

        if (this.duration === 0){
            clearInterval(this.testInterval)
            let messages = new Set();
            const deviceId = this.nodeId
            checkDeviceState(counter, topic, deviceId, user, "led")
            .then(msg => this.messenger.publish(deviceId, "10018202000196"))
            .then(deviceId => {
                console.log(`${deviceId}: MAIN ON`)
                const msgTimeout = mqttMessager.timeout(deviceId, () => this.setNoResponse())
            
                this.messenger.setMessageHandler(msgTimeout, (message) => {
                    if (!messages.has(message) && !message.includes("hello")){
                        const msg_node_id = message.slice("13", "17")
                        console.log(message, msg_node_id, "test");
                        messages.add(message);
                        setTestFinished()
                    }
                    else console.log(message, arrayContainsMessage)
                })
              })
            }
          }

    testSensor = async (sensor, messages) => {
        let promise = new Promise((resolve, reject) => {
            let error = false 
            const type = sensor.type.toLowerCase()
            do {
                this.messenger.publish(sensor.sensorId, "10038205000096")
                .catch(() => sleep(5000).then(() => error = true))
            } while (error)

            const msgTimeout = mqttMessager.timeout(sensor.sensorId, () => {
                // currentDevice.setNoResponse() powercut = 3?
                currentDevice.addResult("Weak connection to mesh");
                reject("No response")
            })

            this.messenger.setMessageHandler(msgTimeout, (message) => {
                const msgSliced = parseInt(`0x${message.slice(21, 25)}`)
                const msg_node_id = message.slice("13", "17")
                const messageIsNew = !setFind(messages, (a) => a.includes(msg_node_id));
                if (messageIsNew){
                    sensor.sensor_responded = true;
                    switch(type){
                        case "vbat": this.readFromVbat(sensor, msgSliced, messages)
                        case "ldr": this.readFromLdr(sensor, msgSliced, messages)
                    }
                }
            })
        })
        let result = await promise;
        return result;
    }

    checkDeviceState = async () => {
        const promise = new Promise((resolve, reject) => {
        const deviceId = this.nodeId
        let messages = new Set()
        let received = false
        const command = type === "led" ? "10038205000096" : "10018201000096"
        this.messenger.publish(deviceId, command)
        .then(deviceId => {
            console.log("state check: " + deviceId);
            const msgTimeout = mqttMessager.timeout(deviceId, () => {
              this.setNoResponse()
              reject("No response")
            })
            mqttMessager.setMessageHandler(msgTimeout, (message) => {
              if (!messages.has(message) && !received) {
                received = true;
                messages.add(message);
                insertMsg(message)
                this.checkMessageState(message)
                resolve(message)
              }
            })
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
    }

    readFromLdr = (sensor, msgSliced, messages) => {
        sleep(2000).then(() => {
            const ldrReading = msgSliced.toFixed(2)
            if (ldrReading > 3000) onOff = "EM Lamp ON"
            else {
                onOff = "EM Lamp OFF";
                if (testedDevice.duration === testCheckpointsTime[testType][0]) {
                  this.addResult("Lamp Fault");
                }
                this.addResult("Battery Fault");
              }
            insertMsg(message, type, "", ldrReading);
            messages.add(`${message} ldr: ${ldrReading} ${onOff}`)
            sensor.reading = onOff;
        })
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

module.exports = LiveTestDevice