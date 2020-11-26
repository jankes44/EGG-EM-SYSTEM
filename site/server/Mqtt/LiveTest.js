const Promise = require("bluebird");
const con = require("../database/db_promise");
const LiveTestDevice = require("./LiveTestDevice");

const updateTestResultsQuery = "UPDATE trial_tests SET result=? WHERE id=?";
const updateDeviceResultsQuery = "update trial_tests_has_lights set result=? where trial_tests_id=? and lights_id=?";

class LiveTest {
  constructor(testId, userId, devicesCopy, testType, inProgress, siteId) {
    this.testId = parseInt(testId);
    this.status = "In progress";
    this.userId = parseInt(userId);
    this.devices = devicesCopy;
    this.cut_all_clicked = false;
    this.abort_clicked = false;
    this.finish_clicked = false;
    this.type = testType;
    this.inProgress = inProgress;
    this.siteId = parseInt(siteId);
  }

  /**
   * Allows to Jsonify the object ignoring the functions
   * 
  toJSON() {
    return {
      testId: this.siteId,
      status: this.status,
      userId: this.userId,
      devices: this.devices,
      cut_all_clicked: this.cut_all_clicked,
      abort_clicked: this.abort_clicked,
      finish_clicked: this.finish_clicked,
      type: this.type,
      inProgress: this.inProgress,
      siteId: this.siteId,
    };
  }

  */

  /**
   *  Cut power of all the devices in the Test aka start the test
   */
  cutPowerAll() {
    let promise = new Promise((resolve, reject) => {
      this.cut_all_clicked = true;
      if (this.inProgress) {
        Promise.each(this.devices, async (d, index, len) => {
          await sleep(1000);
          console.log("CUT POWER: " + d.nodeId);
          return d.cutPower(this.type);
        })
          .then((devices) => {
            //console.log(devices, "OK")
            resolve();
          })
          .catch((err) => {
            console.log(err, "Error");
            reject(err);
          });
      } else {
        reject("ERROR");
      }
    });

    return promise
    // const result = await promise;
    // return result;
  };

  finish(state){
    let promise = new Promise((resolve, reject) => {
      //TODO PROTECTION FOR CANCELLING AND FINISHING AND CUTPOWERALL
      if (state === "Cancelled") {
        this.abort_clicked = true;
      } else if (state === "Finished") {
        this.finish_clicked = true;
      }
      let messages = new Set();
      Promise.each(
        this.devices,
        async (d) => {
          await sleep(1000);
          console.log("ABORT DEVICE: " + d.nodeId);
          return d.finishDevice(messages);
        },
        {concurrency: 1}
      )
        .then(() => {
          console.log("Finish done", state);
          this.updateTestResults(state)
            .then((result) => resolve())
            .catch((err) => reject(err));
        })
        .catch((err) => reject(err));
    });

    return promise
    // const result = await promise;
    // return result;
  };

  updateTestResults(state){
    let promise = new Promise((resolve, reject) => {
      con
        .query(updateTestResultsQuery, [state, this.testId])
        .then(() => {
          Promise.each(this.devices, (d) => {
            const params = [d.getDeviceStatus(), this.testId, d.deviceId];
            return con.query(updateDeviceResultsQuery, params);
          })
            .then(() => resolve())
            .catch((err) => reject(err));
        })
        .catch((err) => {
          throw err;
        });
    });

    return promise
    // const result = await promise;
    // return result;
  };

  /**
   *
   * @param {Number} id deviceId
   * @returns {LiveTestDevice} device
   */
  getDeviceById(id){
    const index = this.devices.findIndex((el) => el.deviceId === id);
    return this.devices[index];
  };
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

module.exports = LiveTest;
