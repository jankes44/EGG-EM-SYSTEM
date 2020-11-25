const awsIot = require("aws-iot-device-sdk");
const path = require("path");

const QOS_1 = { qos: 1 };

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

        /**
         * 
         * @param {String} deviceId 
         * @param {String} command 
         * @param {Boolean} isPromise indicates if we want to get the promise or the await
         */
        publish = async (deviceId, command) => {
            let promise = new Promise((resolve, reject) => {
                const msgTimeout = this.timeout(deviceId, reject)
                console.error("Publish message ", `${deviceId}${command}`)
                this.mqtt.publish(this.topic_send, `${deviceId}${command}`, QOS_1, err => {
                    if (err) reject(err)
                    this.mqtt.handleMessage = (packet, callback) => {
                        clearTimeout(msgTimeout)
                        resolve(packet.payload.toString("utf8"))
                        callback()
                    }
                })
            })
            return promise
        }   

    timeout = (deviceId, reject) => setTimeout(() => {
                console.log(`${this.name}: ${deviceId} NO RES`)
                reject(deviceId)
            }, 5000)
}

module.exports = MqttDevice