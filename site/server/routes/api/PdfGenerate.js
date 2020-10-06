const express = require("express");
const router = express.Router();
var moment = require("moment");
const uuid = require("uuid");
const mysql = require("mysql");
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken");
const con = require("../../database/db2");
let ejs = require("ejs");
let pdf = require("html-pdf");
let path = require("path");

let students = [
  { name: "Joy", email: "joy@example.com", city: "New York", country: "USA" },
  {
    name: "John",
    email: "John@example.com",
    city: "San Francisco",
    country: "USA",
  },
  {
    name: "Clark",
    email: "Clark@example.com",
    city: "Seattle",
    country: "USA",
  },
  {
    name: "Watson",
    email: "Watson@example.com",
    city: "Boston",
    country: "USA",
  },
  {
    name: "Tony",
    email: "Tony@example.com",
    city: "Los Angels",
    country: "USA",
  },
];

router.get("/generateReport/:test_id", auth, (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      con.query(
        `SELECT 
            trial_tests_has_lights.trial_tests_id AS test_id,
            trial_tests_has_lights.result AS device_response,
            trial_tests.result AS test_result,
            trial_tests.lights AS tested_devices_count,
            lights.id AS light_id,
            lights.node_id,
            lights.device_id,
            lights.type,
            lgt_groups.group_name,
            levels.level,
            buildings.building AS building
        FROM
            trial_tests_has_lights
                LEFT OUTER JOIN
            trial_tests ON trial_tests.id = trial_tests_has_lights.trial_tests_id
                LEFT OUTER JOIN
            lights ON lights.id = trial_tests_has_lights.lights_id
                LEFT OUTER JOIN
            lgt_groups ON lgt_groups.id = lights.lgt_groups_id
                LEFT OUTER JOIN
            levels ON levels.id = lgt_groups.levels_id
                LEFT OUTER JOIN
            buildings ON buildings.id = levels.buildings_id
        WHERE
            trial_tests_has_lights.trial_tests_id = ?
        GROUP BY trial_tests_has_lights.trial_tests_id , trial_tests_has_lights.lights_id
        `,
        [req.params.test_id],
        (err, rows) => {
          let data = rows;
          let lampFault = 0;
          let battFault = 0;
          let noConnection = 0;
          let noFault = 0;
          console.log(data);
          data.forEach((el) => {
            switch (el.device_response) {
              case "Device OK":
                noFault++;
                break;
              case "Lamp Fault":
                lampFault++;
                break;
              case "Battery Fault":
                battFault++;
                break;
              case "No response from BT module" || "No connection to Mesh":
                noConnection++;
                break;
            }
          });
          let responsesData = {
            lampFault: lampFault,
            battFault: battFault,
            noConnection: noConnection,
            noFault: noFault,
          };
          ejs.renderFile(
            path.join(__dirname, "../../pdfTemplates/PdfTemplateSimple.ejs"),
            { data: data, resData: responsesData },
            (err, data) => {
              if (err) {
                res.send(err);
              } else {
                let options = {
                  height: "11.25in",
                  width: "8.5in",
                  header: {
                    height: "20mm",
                  },
                  footer: {
                    height: "20mm",
                  },
                };
                pdf.create(data, options).toStream(function (err, stream) {
                  if (err) {
                    res.send(err);
                  } else {
                    res.writeHead(200, {
                      "Content-Type": "application/force-download",
                      "Content-disposition": "attachment; filename=file.pdf",
                    });
                    stream.pipe(res);
                  }
                });
              }
            }
          );
        }
      );
    }
  });
});

module.exports = router;
