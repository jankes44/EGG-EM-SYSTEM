const con = require("../database/db_promise");
  
const insertMsg = (msg, type = "cmd", value="") => {
    const paramData = msg.slice(21, 25);
    const nodeId = msg.slice(13, 17);
    let messageContent = msg.slice(13, 25);
    if (type==="voltage" || type === "ldr") messageContent = value;
    const data = {
        raw_message: msg,
        message_content: messageContent,
        node_id: nodeId,
        param_data: paramData,
        type: type,
    }
    con.query("INSERT INTO mqtt_messages SET ?", data)
    .then(() => console.log("Message inserted"))
    .catch(err => {throw err})
}

module.exports = {insertMsg: insertMsg}