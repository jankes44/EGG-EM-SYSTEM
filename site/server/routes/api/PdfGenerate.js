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
const {uniq} = require("lodash");

const pdfPaths = {
  official: path.join(__dirname, "../../pdfTemplates/PdfTemplateOfficial.ejs"),
  simple: path.join(__dirname, "../../pdfTemplates/PdfTemplateSimple.ejs"),
  test: path.join(__dirname, "../../pdfTemplates/PdfTemplateTest.ejs"),
};

let assetsPath = path.join(__dirname + "/../../public/");
assetsPath = assetsPath.replace(new RegExp(/\\/g), "/");

console.log(assetsPath);
const pdfOptions = {
  height: "12.25in",
  width: "8.5in",
  base: "file:///" + assetsPath,
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
                    trial_tests.created_at as datetime,
                    trial_tests.type as testtype,
                    lights.id AS light_id,
                    lights.node_id,
                    lights.device_id,
                    lights.type,
                    levels.level,
                    buildings.building AS building,
                    buildings.address as site_address,
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

function onlyUnique(value, index, self) {
  if (value !== null) return self.indexOf(value) === index;
}

const generateReport = (rows, res, userinput, reportType = "official") => {
  let data_ = rows;
  let faults = {
    OK: 0,
    "Lamp Fault": 0,
    "Battery Fault": 0,
    "Weak connection to mesh": 0,
  };
  console.log(userinput);
  data_.forEach((el) => {
    const response = el.device_response;
    faults[response] = faults[response] + 1;
    el.datetime = moment(el.datetime).format("MM-DD-YYYY HH:mm");
  });

  const responsesData = {
    lampFault: faults["Lamp Fault"],
    battFault: faults["Battery Fault"],
    noConnection: faults["Weak connection to mesh"],
    noFault: faults["OK"],
  };

  const test_result =
    data_.length === responsesData.noFault ? "Successful" : "Failed";
  const levels = data_.map((el) => el.level);

  const uniqueLvls = levels.filter(onlyUnique);
  const faultsArr = [];
  data_.forEach((el) => {
    if (!el.device_response.includes("OK")) {
      const err = `${el.device_id} - ${el.type}: ${el.device_response}`;
      faultsArr.push(err);
    }
  });

  const faultsStr = faultsArr.join(", ");

  data_.sort(sortCompare);
  const pdfData = {
    data: data_,
    resData: responsesData,
    test_result: test_result,
    levels: uniqueLvls,
    faults: userinput.defects ? userinput.defects : faultsStr,
    userinput: userinput.length > 0 ? userinput : {},
  };

  console.log(faultsArr, faultsStr, userinput.length > 0 ? true : false);

  ejs.renderFile(pdfPaths[reportType], pdfData, (err, data) => {
    if (err) res.sendStatus(400);
    pdf.create(data, pdfOptions).toStream((err, stream) => {
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

router.post("/generateOfficialReport/:test_id", auth, (req, res) => {
  con.query(reportDataQuery, [req.params.test_id], (err, rows) => {
    if (err) res.sendStatus(400);
    console.log(req.body.userinput);
    generateReport(rows, res, req.body.userinput, "test");
  });
});

module.exports = router;
