const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
var schedule = require("node-schedule");
const clonedeep = require("lodash.clonedeep");
const nodemailer = require("nodemailer");
const { startTest, findUsersSiteTest, getTestInfo} = require("../Mqtt/MqttCore")

router.post("/trialteststart/:uid", (req, res) => {
    const userId = req.params.uid
    const deviceIds = req.body.devices
    const testType = req.body.test_type 
    const siteId = req.body.site_id 

    startTest(userId, deviceIds, testType, siteId)
    .then(() => res.sendStatus(200))
    .catch((err) => res.status(400).send(err))
})

router.post("/cutpowerall", (req, res) => {
    const user = req.body.user;
    const site = req.body.site
    
    const liveTest = findUsersSiteTest(user, site)
    console.log(1, liveTest)
    liveTest.cutPowerAll()
    .then(() => res.sendStatus(200))
    .catch((err) => res.status(400).send(err))
  });

  router.get("/testinfo/:uid/:sid", (req, res) => {
      const userId = req.params.uid
      const siteId = req.params.sid
      const testInfo = getTestInfo()
    
      if (testInfo) res.status(200).send(testInfo)
      else res.sendStatus(400) 
  })

module.exports = router;