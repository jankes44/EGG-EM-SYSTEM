const { reject } = require("lodash");
const con = require("../database/db_promise");
const MqttDevice = require("./Clients/MqttDevice");

const insertVoltLdrReading = (sensor_id, bat = "", ldr = "") => {
    const data = { battery: bat, ldr: ldr, sensor_node_id: sensor_id };
    con.query("INSERT INTO device_battery_ldr SET ?", data)
    .catch(err => {throw err})
}
  
const insertMsg = (msg, type = "cmd", value="") => {
    const paramData = msg.slice(21, 25);
    const nodeId = msg.slice(13, 17);
    let messageContent = msg.slice(13, 25);
    if (type==="voltage") messageContent = value;
    else if (type==="ldr") messageContent = value;
    const data = {
        raw_message: msg,
        message_content: messageContent,
        node_id: nodeId,
        param_data: paramData,
        type: type,
    }
    con.query("INSERT INTO mqtt_messages SET ?", data)
    .then(() => insertVoltLdrReading(nodeId, voltage, ldr))
    .catch(err => {throw err})
}

module.exports = {
    insertVoltLdrReading: insertVoltLdrReading,
    insertMsg: insertMsg
}