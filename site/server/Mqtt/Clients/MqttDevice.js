const awsIot = require("aws-iot-device-sdk");
const path = require("path");
const mqtt = require("mqtt");

const QOS_1 = { qos: 1 };

const testTime = {
    Annual: 10800000,
    Monthly: 180000,
};

const defaults = {
    host: "a2vs8z4dhndn7y-ats.iot.eu-west-1.amazonaws.com",
    protocol: "mqtts",
    keepAlive: 0
}

const getPath = (file) =>  path.join(__dirname, "../certs", file)

class MqttDevice {
    constructor(config_) {
        var config = Object.assign(config_, defaults)
        config.keyPath = getPath(config.keyPath)
        config.certPath = getPath(config.certPath)
        config.caPath = getPath(config.caPath)

        const mqtt = awsIot.device(config)

        mqtt.on("connect", () => {
            console.log(config.name, "connected");
            mqtt.subscribe(config.topic);
            });
            
            mqtt.on("reset", () => {
            console.log(config.name,"Mqtt reset");
            });
            
            mqtt.on("close", () => {
            console.log(config.name, "Connection to MQTT closed");
            });
            
            mqtt.on("reconnect", () => {
            console.log(config.name, "Mqtt reconnect");
            });
            
            mqtt.on("offline", function () {
            console.log(config.name, "Mqtt offline");
            });
            
            mqtt.on("error", (error) => {
            console.log(config.name, error);
            });

            this.mqtt = mqtt 
            this.topic_send = config.topic_send
            this.topic = config.topic
            this.name = config.name
            this.testInProgress = false

        }

        publish = async (deviceId, command) => {
            let promise = new Promise((resolve, reject) => {
                this.mqtt.publish(this.topic_send, `${deviceId}${command}`, QOS_1, err => {
                    if (err) reject(err)
                    resolve(deviceId)
                })
            })
            let result = await promise;
            return result
        }

        setMessageHandler = (t, success) => {
            this.mqtt.handleMessage = (packet, callback) => {
                clearTimeout(t)
                success(packet.payload.toString("utf8"))
                callback()
        }
    }   

        timeout = (deviceId, error) => setTimeout(() => {
                    console.log(`${this.name}: ${deviceId} NO RES`)
                    error()
                }, 5000)
}

module.exports = MqttDevice