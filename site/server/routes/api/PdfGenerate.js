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

const pdfPaths = {
  official: path.join(__dirname, "../../pdfTemplates/PdfTemplateOfficial.ejs"),
  simple: path.join(__dirname, "../../pdfTemplates/PdfTemplateSimple.ejs"),
};

const pdfOptions = {
  height: "11.25in",
  width: "8.5in",
  header: {
    height: "20mm",
  },
  footer: {
    height: "20mm",
  },
};

const pdfResponseHeader = {
  "Content-Type": "application/force-download",
  "Content-disposition": "attachment; filename=file.pdf",
};

const reportDataQuery = `SELECT 
                    trial_tests_has_lights.trial_tests_id AS test_id,
                    trial_tests_has_lights.result AS device_response,
                    trial_tests.result AS test_result,
                    trial_tests.lights AS tested_devices_count,
                    lights.id AS light_id,
                    lights.node_id,
                    lights.device_id,
                    lights.type,
                    levels.level,
                    buildings.building AS building,
                    sites.name AS site_name
                    FROM
                    trial_tests_has_lights
                        LEFT OUTER JOIN
                    trial_tests ON trial_tests.id = trial_tests_has_lights.trial_tests_id
                        LEFT OUTER JOIN
                    lights ON lights.id = trial_tests_has_lights.lights_id
                        LEFT OUTER JOIN
                    levels ON levels.id = lights.levels_id
                        LEFT OUTER JOIN
                    buildings ON buildings.id = levels.buildings_id
                        LEFT OUTER JOIN
                    sites ON sites.id = buildings.sites_id
                    WHERE
                    trial_tests_has_lights.trial_tests_id = ?
                    GROUP BY trial_tests_has_lights.trial_tests_id , trial_tests_has_lights.lights_id`;

const sortCompare = (a, b) => {
  if (a.device_response < b.device_response) {
    return -1;
  }
  if (a.device_response > b.device_response) {
    return 1;
  }
  return 0;
};

const generateReport = (rows, res, reportType = "official") => {
  let data_ = rows;
  let faults = {
    OK: 0,
    "Lamp Fault": 0,
    "Battery Fault": 0,
    "Weak connection to mesh": 0,
  };

  console.log(data_);
  data_.forEach((el) => {
    const response = el.device_response;
    faults[response] = faults[response] + 1;
  });
  const responsesData = {
    lampFault: faults["Lamp Fault"],
    battFault: faults["Battery Fault"],
    noConnection: faults["Weak connection to mesh"],
    noFault: faults["OK"],
  };

  data_.sort(sortCompare);
  const pdfData = { data: data_, resData: responsesData };

  ejs.renderFile(pdfPaths[reportType], pdfData, (err, data) => {
    if (err) res.sendStatus(400);
    pdf.create(data, options).toStream((err, stream) => {
      if (err) res.sendStatus(400);
      res.writeHead(200, pdfResponseHeader);
      stream.pipe(res);
    });
  });
};

router.get("/generateReport/:test_id", auth, (req, res) => {
  con.query(reportDataQuery, req.params.test_id, (err, rows) => {
    if (err) res.sendStatus(400);
    generateReport(rows, res, "simple");
  });
});

router.get("/generateOfficialReport/:test_id", auth, (req, res) => {
  con.query(reportDataQuery, [req.params.test_id], (err, rows) => {
    if (err) res.sendStatus(400);
    generateReport(rows, res, "official");
  });
});

module.exports = router;
