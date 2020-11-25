const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
var schedule = require("node-schedule");
const clonedeep = require("lodash.clonedeep");
const nodemailer = require("nodemailer");
const {
  startTest,
  finishTest,
  getTestInfo,
  cutPowerAll,
  setDeviceResult,
  sendCommandToDevice,
  findUserSiteTest,
  checkGatewayState,
} = require("../Mqtt/MqttCore");
const device = require("../Mqtt/Clients/test");

router.post("/trialteststart/:uid/:sid", (req, res) => {
  const userId = req.params.uid;
  const deviceIds = req.body.devices;
  const testType = req.body.test_type;
  const siteId = req.params.sid;

  startTest(userId, deviceIds, testType, siteId)
    .then(() => res.sendStatus(200))
    .catch((err) => res.status(400).send(err));
});

router.post("/cutpowerall", (req, res) => {
  const user = parseInt(req.body.user);
  const site = parseInt(req.body.site);

  cutPowerAll(user, site)
    .then(() => res.sendStatus(200))
    .catch((err) => res.status(400).send(err));
});

router.post("/cutpowersingle", (req, res) => {
  const user = parseInt(req.body.user);
  const site = parseInt(req.body.site);
  const device = req.body.device;

  cutPowerSingle(user, site, device)
    .then(() => res.sendStatus(200))
    .catch((err) => res.status(400).send(err));
});

router.get("/testinfo/:uid/:sid", auth, (req, res) => {
  const userId = parseInt(req.params.uid);
  const siteId = parseInt(req.params.sid);
  const testInfo = getTestInfo(userId, siteId);

  if (testInfo) res.status(200).send(testInfo);
  else res.sendStatus(400);
});

router.post("/aborttest/:uid/:sid", auth, (req, res) => {
  const user = parseInt(req.params.uid);
  const site = parseInt(req.params.sid);

  finishTest(user, site, "Cancelled")
    .then(() => res.sendStatus(200))
    .catch((err) => res.status(400).send(err));
});

router.post("/savetest/:uid/:sid", auth, (req, res) => {
  const user = parseInt(req.params.uid);
  const site = parseInt(req.params.sid);

  finishTest(user, site, "Finished")
    .then(() => res.sendStatus(200))
    .catch((err) => res.status(400).send(err));
});

/* router.post("/result/:id", (req, res) => {
    const user = parseInt(req.body.user)
    const site = parseInt(req.body.site) 
    const result = req.body.result
    const deviceId = req.params.id

    const updated = setDeviceResult(user, site, deviceId, result)
    res.status(200).json(updated)
})
*/

router.post("/setchecked", (req, res) => {
  const user = parseInt(req.body.user);
  const site = parseInt(req.body.site);
  const devices = req.body.devices;
  const result = req.body.value;

  devices.foreach((deviceId) => {
    setDeviceResult(user, site, deviceId, result);
  });

  res.sendStatus(200);
});

router.post("/manualset/", (req, res) => {
  const {user, device, result, site} = req.body;
  const liveTestDevice = findUserSiteTest(user, site).getDeviceById(device);
  liveTestDevice.addResult(result);
  res.sendStatus(200);
});

// -------------------------------- APP / DEV ------------------------------------------

router.post("/app/relay/:cmd", (req, res) => {
  const nodeID = req.body.node_id;
  const siteId = parseInt(req.body.site);
  const cmd = req.params.cmd;

  sendCommandToDevice(nodeID, siteId, cmd)
    .then((result) => res.status(200).json(result))
    .catch((err) => res.status(400).send(err));
});

router.post("/dev/relay/:cmd", (req, res) => {
  const devices = req.body.devices;
  const siteId = parseInt(req.body.site);
  const cmd = req.params.cmd;

  Promise.each(devices, (d) => sendCommandToDevice(d.node_id, siteId, cmd))
    .then((result) => res.status(200).json(result))
    .catch((err) => res.status(400).send(err));
});

router.post("/dev/led/state", (req, res) => {
  const devices = req.body.devices;
  const siteId = parseInt(req.body.site);

  Promise.each(devices, (d) =>
    sendCommandToDevice(d.node_id, siteId, "led_state")
  )
    .then((result) => res.status(200).json(result))
    .catch((err) => res.status(400).send(err));
});

router.post("/dev/light/:cmd", (req, res) => {
  const devices = req.body.devices;
  const siteId = parseInt(req.body.site);
  const cmd = "light_" + req.params.cmd;

  Promise.each(devices, (d) =>
    sendCommandToDevice(d.light_node_id, siteId, cmd)
  )
    .then((result) => res.status(200).json(result))
    .catch((err) => res.status(400).send(err));
});

router.post("/dev/gateway/state", auth, (req, res) => {
  const siteId = parseInt(req.body.site);

  checkGatewayState(siteId)
    .then((result) => res.status(200).json(result))
    .catch((err) => res.status(400).send(err));
});

router.post("/dev/manual/cmd", auth, (req, res) => {
  const command = req.body.command;
  const siteId = parseInt(req.body.site);

  sendCommandToDevice("", siteId, "", command)
    .then((result) => res.status(200).json(result))
    .catch((err) => res.status(400).send(err));
});

router.post("/scheduletest/:uid", auth, (req, res) => {
  //STUB
});

module.exports = router;
