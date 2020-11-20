const express = require("express");
const router = express.Router();
const { device } = require("../Mqtt/mqttconnect");
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const con = require("../database/db2");
var mqtt = require("mqtt");
var schedule = require("node-schedule");
const { on } = require("../database/db2");
const clonedeep = require("lodash.clonedeep");
const nodemailer = require("nodemailer");

const sendTopic2 = "DEVCOMSP";

const testTime = {
  Annual: 10800000,
  Monthly: 180000,
};

const testCheckpointsTime = {
  Annual: [9900000, 3600000, 300000],
  Monthly: [150000, 120000, 60000],
};

const cutInterval = 1000;
const relayBackOn = 360000;
const noResponseTimeout = 10000;
const QOS_1 = { qos: 1 };

const errorMessages = {
  "0CCD": "",
  "6666": "No connection to driver",
  "7FFF": "Battery powered",
};
