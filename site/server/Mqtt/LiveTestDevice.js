class LiveTestDevice {
    constructor(device, duration, userId, testId, hasSensors, sensors){
        this.deviceId = el.id 
        this.nodeId = el.node_id
        this.powercut = 0
        this.clicked = 0;
        this.duration = duration;
        this.durationStart = this.duration;
        this.user = userId;
        this.result = new Set();
        this.testid = testId;
        this.hasSensors = hasSensors
        this.sensors = sensors
    }
}