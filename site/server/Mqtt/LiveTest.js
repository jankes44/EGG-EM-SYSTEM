class LiveTest {
    constructor(testId, userId, devicesCopy, testType) {
        this.testId = testId
        this.status = "In progress"
        this.userId = userId
        this.devices = devicesCopy
        this.cut_all_clicked = 0
        this.abort_clicked = 0
        this.finish_clicked = 0
        this.type = testType
    }
}

module.exports = LiveTest