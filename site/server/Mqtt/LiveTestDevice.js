const errorMessages = {
    "0CCD": "",
    "6666": "No connection to driver",
    "7FFF": "Battery powered",
    };

class LiveTestDevice {
    constructor(device, duration, userId, testId){
        this.deviceId = device.id 
        this.nodeId = device.node_id
        this.powercut = 0
        this.clicked = 0;
        this.duration = duration;
        this.durationStart = this.duration;
        this.user = userId;
        this.result = new Set();
        this.testid = testId;
    }

    addSensors = (sensorsList) => { 
        if (sensorsList.length > 0){
            this.hasSensors = true 
            this.sensors = sensorsList.map(r => ({ sensor_id: r.node_id, type: r.type}))
        }
        else this.hasSensors = false
    }

    setNoResponse = () => this.powercut = 3
    
    addResult = (r) => {
        this.result.add(r)
        this.updateDeviceState()
    }

    updateDeviceState = () => {} //STUB

    checkMessageState = (msg) => {
        const msgCut = msg.slice(21, 25).toUpperCase()
        const error = errorMessages[msgCut]
        if (error.length > 0) this.addResult(error) 
    }
}

module.exports = LiveTestDevice