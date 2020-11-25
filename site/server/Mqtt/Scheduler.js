const con = require("../database/db_promise");
const schedule = require("node-schedule");
const {startTest, cutPowerAll, finishTest} = require("./MqttCore")

const scheduleQuery = `select s.user_id, s.schedule_id, s.test_type, s.date, GROUP_CONCAT(l.id) as device_id, 
GROUP_CONCAT(l.node_id) as node_id, GROUP_CONCAT(DISTINCT s2.mqtt_topic_in) as topic_in,
GROUP_CONCAT(DISTINCT s2.mqtt_topic_out) as topic_out 
from schedule s 
join schedule_has_devices shd on s.schedule_id = shd.schedule_id 
join lights l on l.id = shd.device_id 
join levels l2 on l.levels_id = l2.id 
join buildings b on l2.buildings_id = b.id 
join sites s2 on b.sites_id = s2.id`;

const singleScheduleQuery = `select s.user_id, s.schedule_id, s.test_type, s.date, GROUP_CONCAT(l.id) as device_id, 
GROUP_CONCAT(l.node_id) as node_id, GROUP_CONCAT(DISTINCT s2.mqtt_topic_in) as topic_in,
GROUP_CONCAT(DISTINCT s2.mqtt_topic_out) as topic_out 
from schedule s 
join schedule_has_devices shd on s.schedule_id = shd.schedule_id 
join lights l on l.id = shd.device_id 
join levels l2 on l.levels_id = l2.id 
join buildings b on l2.buildings_id = b.id 
join sites s2 on b.sites_id = s2.id
where s.schedule_id = ?`;


class Scheduler {
    
}




const event = schedule.scheduleJob("*/1 * * * *", () => {
    const scheduledCheck = () => {
      if (testInProgress) {
        const time = 30000;
        console.log(
          "MQTT BUSY:",
          testInProgress,
          "RETRYING IN:",
          time / 1000,
          "seconds"
        );
        const timeout = setTimeout(() => {
          clearTimeout(timeout);
          scheduledCheck();
        }, time);
      } else {
        testInProgress = true;
        checkSiteState(1);
      }
    };
  });