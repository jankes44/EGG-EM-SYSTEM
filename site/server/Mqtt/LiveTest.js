class LiveTest {
    constructor(testId, userId, devicesCopy, testType, inProgress, siteId) {
        this.testId = testId
        this.status = "In progress"
        this.userId = userId
        this.devices = devicesCopy
        this.cut_all_clicked = 0
        this.abort_clicked = 0
        this.finish_clicked = 0
        this.type = testType   
        this.inProgress = inProgress
        this.siteId = siteId
    }
    
    cutPowerAll = () => {
        if (this.inProgress){
            console.log(this.devices)
            let promises = this.devices.map((device) => {
                return device.cutPower(this.type)})
            return Promise.all(promises)
        }
    }
}

module.exports = LiveTest