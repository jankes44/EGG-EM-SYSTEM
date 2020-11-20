const testTime = {
    Annual: 10800000,
    Monthly: 180000,
};

class LiveTest {
    constructor(testId, userId, devicesCopy, testType, inProgress) {
        this.testId = testId
        this.status = "In progress"
        this.userId = userId
        this.devices = devicesCopy
        this.cut_all_clicked = 0
        this.abort_clicked = 0
        this.finish_clicked = 0
        this.type = testType   
        this.inProgress = inProgress
    }

    durationCounterStart = (counter) => {
        const currentDevice = this.devices[counter]
        if (this.inProgress){
            currentDevice.testInterval = setInterval(() => currentDevice.testLoop(this.type))
        }
    } 
}

module.exports = LiveTest