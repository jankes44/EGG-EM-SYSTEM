var awsIot = require("aws-iot-device-sdk");
var path = require("path");
var mqtt = require("mqtt");

`    {
  "keyPath": "SPBMDEVUI.private.key",
  "certPath": "SPBMDEVUI.cert.pem",
  "caPath": "AmazonRootCA1.pem",
  "clientId": "OFFICEUIDEV2",
  "topic": "DEVRSPSP",
  "topic_send": "DEVCOMSP",
  "name": "EGG",
  "id": 3
}`

// LIVE CONFIG
var device = awsIot.device({
  keyPath: path.join(__dirname, "../certs/SPBMDEVUI.private.key"),
  certPath: path.join(__dirname, "../certs/SPBMDEVUI.cert.pem"),
  caPath: path.join(__dirname, "../certs/AmazonRootCA1.pem"),
  clientId: "test",
  host: "a2vs8z4dhndn7y-ats.iot.eu-west-1.amazonaws.com",
  protocol: "mqtts",
  keepAlive: 0,
});
var topic = "DEVRSPSP";

 function getFileName(path=__filename) {
  return path.replace(/^.*[\\\/]/, '').replace(".js", "");
}

device.on("connect", () => {
    console.log(getFileName(), "connected");
    device.subscribe(topic);
  });
  
  device.on("reset", () => {
    console.log(getFileName(),"Mqtt reset");
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
  
  module.exports = {device: device}
