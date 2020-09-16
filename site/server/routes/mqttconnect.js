var awsIot = require("aws-iot-device-sdk");
var path = require("path");
var mqtt = require("mqtt");

//LIVE CONFIG
var device = awsIot.device({
  keyPath: path.join(__dirname, "/certs/livespprivate.pem.key"),
  certPath: path.join(__dirname, "/certs/livespcertificate.pem.crt"),
  caPath: path.join(__dirname, "/certs/livespca1.pem"),
  clientId: process.env.MQTT_UNAME,
  host: "a2vs8z4dhndn7y-ats.iot.eu-west-1.amazonaws.com",
  protocol: "mqtts",
  keepAlive: 0,
});
var topic = "LIVESPRSP";

//DEV CONFIG
// var device = awsIot.device({
//   keyPath: path.join(__dirname, "/certs/SPBMDEVUI.private.key"),
//   certPath: path.join(__dirname, "/certs/SPBMDEVUI.cert.pem"),
//   caPath: path.join(__dirname, "/certs/AmazonRootCA1.pem"),
//   clientId: process.env.MQTT_UNAME,
//   host: "a2vs8z4dhndn7y-ats.iot.eu-west-1.amazonaws.com",
//   protocol: "mqtts",
//   keepAlive: 0,
// });
// var topic = "DEVRSPSP";

// var device = mqtt.connect("mqtt://broker.mqttdashboard.com");
// device.on("connect", function () {
//   device.subscribe("uhj45th4eui5j43");
//   device.publish("irjghjhitj45645654", "Express server connected");
// });

device.on("connect", () => {
  console.log("Mqtt connected");
  device.subscribe(topic);
});

device.on("reset", () => {
  console.log("Mqtt reset");
});

device.on("close", () => {
  console.log("Connection to MQTT closed");
});

device.on("reconnect", () => {
  console.log("Mqtt reconnect");
});

device.on("offline", function () {
  console.log("Mqtt offline");
});

device.on("error", (error) => {
  console.log(error);
});

module.exports = {
  device: device,
};
