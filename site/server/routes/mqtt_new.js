const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
var schedule = require("node-schedule");
const clonedeep = require("lodash.clonedeep");
const nodemailer = require("nodemailer");
const { startTest, finishTest, getTestInfo, cutPowerAll, setDeviceResult, sendCommandToDevice} = require("../Mqtt/MqttCore");
const device = require("../Mqtt/Clients/test");

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
    const site = req.body.site;
    
    cutPowerAll(user, site)
    .then(() => res.sendStatus(200))
    .catch((err) => res.status(400).send(err))
  });

  router.post('/cutpowersingle', (req, res) => {
    const user = req.body.user;
    const site = req.body.site;
    const device = req.body.device;
    
    cutPowerSingle(user, site, device)
    .then(() => res.sendStatus(200))
    .catch((err) => res.status(400).send(err))
  })

  router.get("/testinfo/:uid/:sid", (req, res) => {
      const userId = req.params.uid
      const siteId = req.params.sid
      const testInfo = getTestInfo(userId, siteId)
    
      if (testInfo) res.status(200).send(testInfo)
      else res.sendStatus(400) 
  })

router.post("/aborttest/:uid/:sid", auth, (req, res) => {
    const user = req.params.uid
    const site = req.params.sid

    finishTest(user, site, 'Cancelled')
    .then(() => res.sendStatus(200))
    .catch(err => res.sendStatus(400))
})

router.post("/savetest/:uid/:sid", auth, (req, res) => {
    const user = req.params.uid
    const site = req.params.sid

    finishTest(user, site, 'Finished')
    .then(() => res.sendStatus(200))
    .catch(err => res.sendStatus(400))
})

router.post("/result/:id", (req, res) => {
    const user = req.body.user
    const site = req.body.site 
    const result = req.body.result
    const deviceId = req.params.id

    const updated = setDeviceResult(user, site, deviceId, result)
    res.status(200).json(updated)
})

router.post("/setchecked", (req, res) => {
    const user = req.body.user
    const site = req.body.site 
    const devices = req.body.devices;
    const result = req.body.value;

    devices.foreach(deviceId => {
        setDeviceResult(user, site, deviceId, result)
    })

    res.sendStatus(200)
})

// -------------------------------- APP ------------------------------------------

router.post("/app/relay/:cmd", (req, res) => {
    const nodeID = req.body.node_id;
    const siteId = req.body.site_id
    const cmd = req.params.cmd  
    
    sendCommandToDevice(nodeID, siteId, cmd)
    .then(result => res.status(200).send(result))
    .catch(err => res.status(400).send(err))
})

module.exports = router;