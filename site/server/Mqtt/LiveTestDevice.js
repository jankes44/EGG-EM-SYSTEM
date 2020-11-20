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
        this.hasSensors = false 
    }

    addSensors = (sensorsList) => { 
        this.hasSensors = true 
        this.sensors = sensorsList.map(r => ({ sensor_id: r.node_id, type: r.type}))
    }
}

module.exports = LiveTestDevice