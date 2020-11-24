const Promise = require("bluebird");

class LiveTest {
    constructor(testId, userId, devicesCopy, testType, inProgress, siteId) {
        this.testId = testId
        this.status = "In progress"
        this.userId = parseInt(userId)
        this.devices = devicesCopy
        this.cut_all_clicked = 0
        this.abort_clicked = 0
        this.finish_clicked = 0
        this.type = testType   
        this.inProgress = inProgress
        this.siteId = siteId
    }
    
    cutPowerAll = async () => {
        let promise = new Promise((resolve, reject) => {
            if (this.inProgress){
                Promise.each(this.devices, async (d, index, len) => {
                    await sleep(1000)
                    console.log("CUT POWER: " + d.nodeId)
                    return d.cutPower(this.type)
                }, {concurrency: 1})
                .then(devices => {
                    //console.log(devices, "OK")
                    resolve()
                })
                .catch(err => {
                    console.log(err, "Error")
                    reject(err)
                })
            }
            else {
                reject("ERROR")
            }
        })

        const result = await promise 
        return result 
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

module.exports = LiveTest