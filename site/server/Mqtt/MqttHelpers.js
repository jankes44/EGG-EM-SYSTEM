const con = require("../database/db_promise");

const insertVoltLdrReading = (sensor_id, bat = "", ldr = "") => {
    const data = { battery: bat, ldr: ldr, sensor_node_id: sensor_id };
    con.query("INSERT INTO device_battery_ldr SET ?", data)
    .catch(err => {throw err})
}
  
const insertMsg = (msg, type = "cmd", voltage = "", ldr = "") => {
    const paramData = msg.slice(21, 25);
    const nodeId = msg.slice(13, 17);
    const messageContent = msg.slice(13, 25);
    if (voltage.length) messageContent = voltage;
    else if (ldr.length) messageContent = ldr;
    const data = {
        raw_message: msg,
        message_content: message_content,
        node_id: node_id,
        param_data: param_data,
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