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
                // let i = 100
                // Run promises in sequence
                // const starterPromise = Promise.resolve(null);
                // this.devices.reduce((p,d) => p.then(() => d.cutPower(this.type)
                //     .then(console.log(i++))
                //     .catch(err => console.error(err)))
                //     .catch(err => console.error(err)),
                // starterPromise)
                Promise.map(this.devices, async d => {
                    await sleep(2000);
                    return await d.cutPower(this.type)
                }, {concurrency: 1})
                .then(() => resolve("OK"))
                .catch(err => reject(err))
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