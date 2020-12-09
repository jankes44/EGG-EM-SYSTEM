const { device } = require("../routes/mqttconnect");
var schedule = require("node-schedule");
const con = require("../database/dbSiteWorker");
var nodemailer = require("nodemailer");

module.exports.sendEmailNotification = (topic) => {
  return new Promise((resolve, reject) => {
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "platform.notifications2020@gmail.com",
        pass: "Jarek543",
      },
    });

    var mailOptions = {
      from: "platform.notifications2020@gmail.com",
      to: "notifications@egglighting.com",
      subject: `No response from ${topic}`,
      text: `No response from ${topic}, check state of the gateway immediately.`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
        resolve();
      }
    });
  });
};

checkSitesHealth = () => {
  let sitesArray = [];

  con.query("SELECT * FROM sites", (err, rows) => {
    //get list of sites from db
    console.log(JSON.stringify(rows));
    rows.forEach((element) => {
      if (element.mqtt_topic_out !== null) {
        sitesArray.push(element);
        console.log(element.mqtt_topic_out);
      } else {
        console.warn(
          `WARNING: '${element.name}' doesn't have a topic assigned.`
        );
      }
    });
    let counter = 0;
    const length = sitesArray.length;

    loop = () => {
      if (counter < length) {
        let mqtt_topic = sitesArray[counter].mqtt_topic_out;
        device.publish(mqtt_topic, "XchkX", (err) => {
          if (err) {
            console.error(err);
            counter++;
            loop();
          } else {
            console.log(`'${mqtt_topic}' state check...`);
            var msgTimeout = setTimeout(() => {
              //if no response from device in X seconds, continue the loop
              console.log(`No response from '${mqtt_topic}'`);
              sendEmailNotification(mqtt_topic).then(() => {
                counter++;
                loop();
              });
            }, 6000);
            device.handleMessage = (packet, callback) => {
              clearTimeout(msgTimeout);
              var message = packet.payload.toString("utf8").toLowerCase();
              console.log(message);
              counter++;
              loop();
              callback();
            };
          }
        });
      } else {
        console.log("Done", counter, length);
        counter = 0;
      }
    };
    loop();
  });
};

// checkSitesHealth();

// var j = schedule.scheduleJob("*/1 * * * *", function () {
//   device.publish("LIVESPCOM", "XchkX", () => {
//     console.log("published");
//     var msgTimeout = setTimeout(() => {
//       //if no response from device in X seconds, continue the loop
//       console.log("No response");
//     }, 6000);
//     device.handleMessage = (packet, callback) => {
//       clearTimeout(msgTimeout);
//       var message = packet.payload.toString("utf8").toLowerCase();
//       console.log(message);
//       callback();
//     };
//   });
// });
