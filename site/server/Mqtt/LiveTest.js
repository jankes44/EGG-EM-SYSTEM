const Promise = require("bluebird");
const con = require("../database/db_promise");
const LiveTestDevice = require("./LiveTestDevice");

const updateTestResultsQuery = "UPDATE trial_tests SET result=? WHERE id=?"
const updateDeviceResultsQuery = "update trial_tests_has_lights set result=? where trial_tests_id=? and lights_id=?"

class LiveTest {
    constructor(testId, userId, devicesCopy, testType, inProgress, siteId) {
        this.testId = testId
        this.status = "In progress"
        this.userId = parseInt(userId)
        this.devices = devicesCopy
        this.cut_all_clicked = false
        this.abort_clicked = false
        this.finish_clicked = false
        this.type = testType   
        this.inProgress = inProgress
        this.siteId = siteId
    }
    
    cutPowerAll = async () => {
        let promise = new Promise((resolve, reject) => {
            this.cut_all_clicked = true
            if (this.inProgress){
                Promise.each(this.devices, async (d, index, len) => {
                    await sleep(1000)
                    console.log("CUT POWER: " + d.nodeId)
                    return d.cutPower(this.type)
                })
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

    finish = async (state) => {
        let promise = new Promise((resolve, reject) => {
            if (state === 'Cancelled') {
                this.abort_clicked = true
            }
            else if (state === 'Finished'){
                this.finish_clicked = true
            }
            let messages = new Set()
            Promise.each(this.devices, async d => {
                await sleep(1000)
                console.log("ABORT DEVICE: " + d.nodeId)
                return d.abort(messages)
            }, {concurrency: 1})
            .then(() => {
                console.log("Finish done", state)
                this.updateTestResults(state)
                .then(result => resolve())
                .catch(err => reject(err))
            })
            .catch(err => reject(err))
        })


        const result = await promise 
        return result 
    }

    updateTestResults = async (state) => {
        let promise = new Promise((reject, resolve) => {
            con.query(updateTestResultsQuery, [state, this.testId])
            .then(() =>{
                Promise.each(this.devices, d => {
                    const params = [d.getDeviceStatus(), this.testId, d.deviceId]
                    return con.query(updateDeviceResultsQuery, params)
                }).then(() => resolve()).catch(err => reject(err))
            })
            .catch(err => {throw err})
        })

        const result = await promise
        return result
    }

    /**
     * 
     * @param {Number} id deviceId
     * @returns {LiveTestDevice} device 
     */
    getDeviceById = (id) => {
        const index = this.devices.findIndex((el) => el.id === id);
        return this.devices[index]
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