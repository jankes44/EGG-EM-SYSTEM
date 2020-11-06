const express = require("express");
const router = express.Router();
var awsIot = require("aws-iot-device-sdk");
var schedule = require("node-schedule");
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const mqttconnect = require("./mqttconnect");
const device = mqttconnect.device;
const con = require("../database/db2");
const _ = require("lodash");

const sendTopic2 = "DEVSPCOM";
const sendTopic = "irjghjhitj45645654";
var counter = 0;
var counterState = 0;
const testDelay = 3000;
const testLength = 3000;
var test_id;
let group;
let light;
var messages = [];

// device.on("message", (topic, message) => {
//   context = message.toString("utf8").toLowerCase();
//   var arrayContainsMessage = messages.includes(context);
//   callMsg = message.includes("1001", 4);

//   if (arrayContainsMessage || callMsg) {
//   } else {
//     var param_data = context.slice(21, 25);
//     var node_id = context.slice(13, 17);
//     let message_content = context.slice(13, 25);
//     if (test_id) {
//       var data = {
//         raw_message: context,
//         message_content: message_content,
//         node_id: node_id,
//         param_data: param_data,
//         test_id: test_id,
//       };
//     } else
//       var data = {
//         raw_message: context,
//         message_content: message_content,
//         param_data: param_data,
//         node_id: node_id,
//       };

//     con.query("INSERT INTO mqtt_messages SET ?", data, (err, results) => {
//       if (err) throw err;
//       console.log("inserted to db", context);
//     });
//     messages.push(context.toLowerCase());
//   }
//   console.log(context);
// });

//'{"message": "000G10031999"}'
var dates = [];

recurringFunctionTest = () => {
  con.query("SELECT * FROM lights", (err, rows) => {
    var requestMessage = rows;
    delay = requestMessage.length * testDelay;
    console.log(delay);
    if (rows.length > 1) {
      group = null;
    }
    stateDelay = delay + 5000;
    console.log(stateDelay);

    groupTestCall(requestMessage);
    setTimeout(insertTest, +2500, requestMessage, "Automatic");
    setTimeout(getState, testLength + stateDelay, requestMessage);
    setTimeout(
      errorCheck,
      delay + testLength + stateDelay + 5000,
      requestMessage
    );
  });
};

var rule = new schedule.RecurrenceRule();

rule.date = 16;
rule.hour = 12;
rule.minute = 15;
rule.second = 00;

console.log(
  `recurring test on ${rule.date} day every month at ${rule.hour}:${rule.minute}:${rule.second}`
);

var j = schedule.scheduleJob(rule, function () {
  recurringFunctionTest();
});

con.query("select * from schedule", (err, rows) => {
  rows.forEach((x) => {
    var requestObject = new Object();

    requestObject.id = x.schedule_id;
    requestObject.date = x.date;

    con.query(
      "select schedule.schedule_id, schedule.date, schedule_has_lgt_groups.lgt_groups_id from schedule left outer join schedule_has_lgt_groups on schedule_has_lgt_groups.schedule_schedule_id = schedule.schedule_id where schedule.schedule_id = ?",
      [x.schedule_id],
      (err, rows) => {
        var data = [];
        rows.forEach((a) => {
          if (a.schedule_id === x.schedule_id) {
            data.push(a.lgt_groups_id);
          }
        });
        requestObject.data = data;
        dates.push(requestObject);
      }
    );
  });
});

scheduleJobs = () => {
  console.log("Jobs to schedule:");
  if (dates.length) {
    dates.forEach((a) => {
      var date = new Date(a.date.toString());
      var name = `job${a.id}`;
      var dateNow = new Date();
      if (date >= dateNow) {
        console.log(name);
        console.log(a);

        schedule.scheduleJob(name, date, () => {
          messages = [];

          con.query(
            "SELECT lights.*, lgt_groups.group_name AS group_name FROM lights LEFT OUTER JOIN lgt_groups ON lgt_groups.id = lights.lgt_groups_id where lgt_groups_id in (?)",
            [a.data],
            (err, rows) => {
              var requestMessage = rows;
              delay = requestMessage.length * testDelay;
              console.log(delay);
              if (rows.length > 1) {
                group = null;
              }
              stateDelay = delay + 5000;
              console.log(stateDelay);

              groupTestCall(requestMessage);
              setTimeout(insertTest, +2500, requestMessage, "Scheduled");
              setTimeout(getState, testLength + stateDelay, requestMessage);
              setTimeout(
                errorCheck,
                delay + testLength + stateDelay + 5000,
                requestMessage
              );
            }
          );
        });
      }
    });
  } else console.log("Nothing to schedule");
};

setTimeout(() => {
  schedule.cancelJob("job9");
  const jobNames = _.keys(schedule.scheduledJobs);
  if (jobNames.length) {
    console.log("Scheduling completed");
  }
}, 2000);

setTimeout(() => {
  scheduleJobs();
}, 1000);

//Functions
getState = (requestData) => {
  const length = Object.keys(requestData).length;
  if (counterState < length) {
    const deviceId = requestData[counterState].node_id;
    console.log(deviceId);
    device.publish(sendTopic, `${deviceId}10038201000095`);
    counterState++;
    setTimeout(getState, 3000, requestData);
  } else {
    counterState = 0;
  }
};

deviceTestCall = (requestData) => {
  group = null;
  const deviceId = requestData[0].node_id;
  console.log(deviceId);
  device.publish(sendTopic, `${deviceId}10018202000195`);
};

groupTestCall = (requestData) => {
  light = null;
  const length = requestData.length;
  if (counter < length) {
    const deviceId = requestData[counter].node_id;
    console.log(deviceId);
    device.publish(sendTopic, `${deviceId}10018202000195`);
    counter++;
    setTimeout(groupTestCall, testDelay, requestData);
  } else {
    counter = 0;
  }
};

//checks messages array for errors and inserts them into error table in DB
errorCheck = (requestData) => {
  con.query(
    "SELECT id FROM tests ORDER BY id DESC limit 1",
    (err, result, rows) => {
      if (err) throw err;
      test_id = JSON.stringify(result[0].id);

      requestData.forEach((item) => {
        var element = messages.find((a) =>
          a.includes(item.node_id.toLowerCase())
        );
        console.log(element);
        if (typeof element !== "undefined") {
          if (element.includes(item.node_id.toLowerCase())) {
            console.log("Response: True,", item.node_id, item.id);
            if (element.includes("1999")) {
              console.log("1999");
              con.query("INSERT INTO errors SET ?", {
                error: "OK",
                device: item.id,
                test_id: test_id,
              });
            }
            if (element.includes("2666")) {
              console.log("2666");
              con.query("INSERT INTO errors SET ?", {
                error: "Commissioning (Test again after 48 hours)",
                device: item.id,
                test_id: test_id,
              });
            }
            if (element.includes("3333")) {
              console.log("3333");
              con.query("INSERT INTO errors SET ?", {
                error: "Device error (Repeat Test)",
                device: item.id,
                test_id: test_id,
              });
            }
            if (element.includes("6666")) {
              console.log("6666");
              con.query("INSERT INTO errors SET ?", {
                error: "Battery Fault",
                device: item.id,
                test_id: test_id,
              });
            }
            if (element.includes("7332")) {
              con.query("INSERT INTO errors SET ?", {
                error: "Lamp Fault",
                device: item.id,
                test_id: test_id,
              });
            }
            if (element.includes("0CCD")) {
              con.query("INSERT INTO errors SET ?", {
                error: "No connection to driver",
                device: item.id,
                test_id: test_id,
              });
            }
          }
        } else {
          console.log("Response: False,", item.node_id, item.id);
          con.query("INSERT INTO errors SET ?", {
            error: "No response",
            device: item.id,
            test_id: test_id,
          });
        }
      });

      var messagesCut = [];

      messages.map((a) => {
        var cut = a.slice(21, 25);
        messagesCut.push(cut);
      });
      const allEqual = messagesCut.every((v) => v === "1999");
      if (
        messagesCut.length > 0 &&
        messages.length === requestData.length &&
        allEqual
      ) {
        con.query("UPDATE tests SET result='Successful' WHERE id=?", [test_id]);
      } else {
        con.query("UPDATE tests SET result='Failed' WHERE id=?", [test_id]);
      }

      console.log(messages);
      console.log(messages.length, requestData.length);
      messages = [];
    }
  );
};

insertTest = (requestData, set) => {
  if (group === "") {
    group = null;
  }
  if (light === "") {
    light = null;
  }
  con.query(
    "INSERT INTO tests SET ?",
    {
      lights: requestData.length,
      result: "In Progress",
      set: set,
    },
    (err) => {
      if (err) throw err;
      con.query(
        "SELECT id FROM tests ORDER BY id DESC limit 1",
        (err, result, rows) => {
          if (err) throw err;
          test_id = JSON.stringify(result[0].id);
          requestData.forEach((item) => {
            con.query("INSERT INTO tests_has_lights SET ?", {
              lights_id: item.id,
              tests_id: test_id,
            });
          });
        }
      );
    }
  );
};

router.post("/scheduleentry", auth, (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      var dateEntry = [];
      setTimeout(() => {
        con.query(
          "SELECT * FROM schedule ORDER BY schedule_id DESC limit 1",
          (err, rows) => {
            rows.forEach((x) => {
              var requestObject = new Object();

              requestObject.id = x.schedule_id;
              requestObject.date = x.date;

              dateEntry.push(requestObject);
              con.query(
                "select schedule.schedule_id, schedule.date, schedule_has_lgt_groups.lgt_groups_id from schedule left outer join schedule_has_lgt_groups on schedule_has_lgt_groups.schedule_schedule_id = schedule.schedule_id where schedule.schedule_id = ?",
                [x.schedule_id],
                (err, rows) => {
                  var data = [];

                  if (rows.length > 1) {
                    group = null;
                  }

                  rows.forEach((a) => {
                    if (a.schedule_id === x.schedule_id) {
                      data.push(a.lgt_groups_id);
                    }
                  });
                  requestObject.data = data;
                  console.log("New entry:", dateEntry);
                }
              );
            });
            dateEntry.forEach((a) => {
              var date = new Date(a.date.toString());
              var name = `job${a.id}`;
              var dateNow = new Date();
              console.log(a);
              if (date >= dateNow) {
                console.log(`Job ${a.id}`, "scheduled");
              }
              schedule.scheduleJob(name, date, () => {
                messages = [];

                con.query(
                  "SELECT lights.*, lgt_groups.group_name AS group_name FROM lights LEFT OUTER JOIN lgt_groups ON lgt_groups.id = lights.lgt_groups_id where lgt_groups_id in (?)",
                  [a.data],
                  (err, rows) => {
                    console.log("SCHEDULED TEST INIT", new Date(), date);

                    var requestMessage = rows;

                    delay = requestMessage.length * testDelay;
                    stateDelay = delay + 5000;
                    console.log(delay);
                    console.log(stateDelay);

                    groupTestCall(requestMessage);
                    setTimeout(insertTest, +2500, requestMessage, "Scheduled");
                    setTimeout(
                      getState,
                      testLength + stateDelay,
                      requestMessage
                    );
                    setTimeout(
                      errorCheck,
                      delay + testLength + stateDelay + 5000,
                      requestMessage
                    );
                  }
                );
              });
            });
          }
        );
      }, 1000);

      res.end(JSON.stringify(""));
    }
  });
});

router.post("/canceljob/:id", auth, (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      con.query(
        "DELETE FROM schedule where schedule_id=?",
        [req.params.id],
        (err, rows) => {
          if (err) {
            res.send(err);
            throw err;
          } else {
            var myJob = schedule.scheduledJobs[`job${req.params.id}`];
            console.log(myJob);
            if (myJob) {
              myJob.cancel();
            }
            console.log(`Job ${req.params.id} deleted`);
            res.send(`Job ${req.params.id} deleted`);
          }
        }
      );
    }
  });
});

//Routes
router.post("/dev", auth, (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      var requestData = req.body.message;
      console.log(requestData);
      device.publish(sendTopic, req.body.message);
      res.status(200).send("Message sent to mqtt");
    }
  });
});

//Function test - single
router.post("/test", auth, (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      messages = [];
      var requestMessage = req.body.message;
      light = req.body.light;

      console.log("MANUAL DEVICE TEST INIT", new Date());

      delay = requestMessage.length * testDelay;
      console.log(delay);

      stateDelay = delay + 5000;
      console.log(stateDelay);

      deviceTestCall(requestMessage);
      setTimeout(insertTest, +2500, requestMessage, "Manual");
      setTimeout(getState, stateDelay, requestMessage);
      setTimeout(errorCheck, delay + stateDelay + 10000, requestMessage);
      res.status(200).send("Message sent to mqtt");
    }
  });
});

//Function test - group
router.post("/grouptest", auth, (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      messages = [];

      // '{"message": "000g10031999"}', '{"message": "000g10031999"}'
      var requestMessage = req.body.message;
      if (req.body.group.length < 2) {
        group = req.body.group;
      } else group = null;

      console.log("MANUAL GROUP TEST INIT", new Date());

      delay = requestMessage.length * testDelay;
      console.log(delay);

      stateDelay = delay + 5000;
      console.log(stateDelay);

      groupTestCall(requestMessage);
      setTimeout(insertTest, +2500, requestMessage, "Manual");
      setTimeout(getState, testLength + stateDelay, requestMessage);
      setTimeout(
        errorCheck,
        delay + testLength + stateDelay + 5000,
        requestMessage
      );
      res.status(200).send("Message sent to mqtt");
    }
  });
});

//get status of devices
router.post("/status", auth, (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      var requestData = req.body.message;

      getState(requestData);
      res.status(200).send("Message sent to mqtt");
    }
  });
});

//live message listener
router.get("/live", auth, (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      device.on("message", (topic, payload) => {
        res.end(payload.toString("utf8"));
      });
    }
  });
});

//Send an MQTT Message taking two parameters in scope: topic and message.
router.post("/send", auth, (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      device.publish(req.body.topic, req.body.message);
      console.log(req.body.message);
      res.status(200).send("Message sent to mqtt");
    }
  });
});

//error handler
device.on("error", (error) => {
  console.log(error);
});

module.exports = router;
