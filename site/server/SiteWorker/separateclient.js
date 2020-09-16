const express = require("express");
require("dotenv").config();
const PORT = 5001;
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const devices = require("./devices.json");
const { device } = require("../routes/mqttconnect");
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");

// Body parser middleware
app.use(bodyParser.json());
// Cors middleware, allow all requests
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

const items = [
  { id: 1, name: "sword" },
  { id: 2, name: "wand" },
  { id: 3, name: "spear" },
];

const test = {
  id: 1,
  status: "",
  devices: [
    { id: "9131", status: "OK" },
    { id: "3214", status: "OK" },
    { id: "1523", status: "OK" },
  ],
};

let deviceDetails = [];

app.get("/items", (req, res) => {
  console.log("returning items list");
  res.send(items);
});

app.get("/test-info", (req, res) => {
  res.send(test);
});

app.get("/test", (req, res) => {
  console.log("starting test");

  setTimeout(() => {
    test.status = "Success";
  }, 4000);

  res.send("Starting test...");
});

app.get("/devices", (req, res) => {
  var deviceData = [];
  devices.nodes.forEach((el) => {
    let device = { address: el.unicastAddress, name: el.name };
    deviceData.push(device);
  });
  deviceDetails = deviceData;
  res.send(deviceData);
});

app.get("/devices/:id", (req, res) => {
  let device = deviceDetails.filter((el) => el.address === req.params.id);
  res.send(device);
});

devices.nodes.forEach((el) => {
  console.log(el.unicastAddress, el.name);
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.listen(PORT, () => console.log("Server started on port", PORT, Date()));
