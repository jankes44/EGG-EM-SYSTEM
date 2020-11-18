const express = require("express");
const router = express.Router();
const con = require("../../database/db2");
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken");

//get devices responses for csv report
router.get("/lightsresponses/csv/:id", auth, (req, res) =>
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      con.query(
        `SELECT 
          GROUP_CONCAT(lights.device_id, ' - ', lights.type) AS device,
          CONCAT("\'", lights.node_id, "\'" ) AS 'BTMesh_Address',
          trial_tests_has_lights.result,
          levels.level,
          buildings.building,
          sites.name
      FROM
          trial_tests_has_lights
              LEFT OUTER JOIN
          lights ON lights.id = trial_tests_has_lights.lights_id
              LEFT OUTER JOIN
          levels ON levels.id = lights.levels_id
              LEFT OUTER JOIN
          buildings ON buildings.id = levels.buildings_id
              LEFT OUTER JOIN
          sites ON sites.id = buildings.sites_id
      WHERE
          trial_tests_id = ?
      GROUP BY trial_tests_has_lights.trial_tests_id , trial_tests_has_lights.lights_id
     `,
        [req.params.id],
        (err, rows) => {
          res.setHeader(
            "Content-Type",
            "application/json",
            "Access-Control-Allow-Headers",
            "Origin, X-Requested-With, Content-Type, Accept"
          );
          return res.send(rows);
        }
      );
    }
  })
),
  //get devices responses
  router.get("/lightsresponses/", auth, (req, res) =>
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          `SELECT 
          trial_tests_has_lights.*, lights.id, lights.node_id, lights.device_id, lights.type, levels.level, buildings.building as building
      FROM
          trial_tests_has_lights
      LEFT OUTER JOIN 
        lights ON lights.id = trial_tests_has_lights.lights_id
      LEFT OUTER JOIN
        levels ON levels.id = lights.levels_id
      LEFT OUTER JOIN
        buildings ON buildings.id = levels.buildings_id
      GROUP BY trial_tests_has_lights.trial_tests_id, trial_tests_has_lights.lights_id
      `,
          (err, rows) => {
            res.setHeader(
              "Content-Type",
              "application/json",
              "Access-Control-Allow-Headers",
              "Origin, X-Requested-With, Content-Type, Accept"
            );
            return res.send(rows);
          }
        );
      }
    })
  ),
  //get devices responses
  router.get("/lightsresponses/:id", auth, (req, res) =>
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          `SELECT 
          trial_tests_has_lights.*, lights.id, lights.node_id, lights.device_id, lights.type, levels.level, buildings.building as building
      FROM
          trial_tests_has_lights
      LEFT OUTER JOIN 
        lights ON lights.id = trial_tests_has_lights.lights_id
      LEFT OUTER JOIN
        levels ON levels.id = lights.levels_id
      LEFT OUTER JOIN
        buildings ON buildings.id = levels.buildings_id
      WHERE trial_tests_has_lights.trial_tests_id = ?
      GROUP BY trial_tests_has_lights.trial_tests_id, trial_tests_has_lights.lights_id
      `,
          [req.params.id],
          (err, rows) => {
            res.setHeader(
              "Content-Type",
              "application/json",
              "Access-Control-Allow-Headers",
              "Origin, X-Requested-With, Content-Type, Accept"
            );
            return res.send(rows);
          }
        );
      }
    })
  ),
  //get test by param: user id
  router.get("/usr/:id", auth, (req, res) =>
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          `SELECT 
          trial_tests.id,
          trial_tests.lights,
          trial_tests.result,
          trial_tests.type,
          trial_tests.set,
          trial_tests.created_at,
          FLOOR(SUM(trial_tests_has_lights.result LIKE '%OK%')) AS responseok,
          FLOOR(SUM(trial_tests_has_lights.result NOT LIKE '%OK%')) AS errors,
          GROUP_CONCAT(DISTINCT levels.level
              SEPARATOR ', ') AS level,
          GROUP_CONCAT(DISTINCT buildings.building
              SEPARATOR ', ') AS building,
          sites.name as site,
          users.id as users_id
      FROM
          trial_tests
              LEFT OUTER JOIN
          trial_tests_has_lights ON trial_tests_has_lights.trial_tests_id = trial_tests.id
              LEFT OUTER JOIN
          lights ON lights.id = trial_tests_has_lights.lights_id
              LEFT OUTER JOIN
          errors ON errors.test_id = trial_tests.id
              LEFT OUTER JOIN
          levels ON levels.id = lights.levels_id
          LEFT OUTER JOIN
        buildings ON buildings.id = levels.buildings_id
          LEFT OUTER JOIN
        sites ON sites.id = buildings.sites_id
          LEFT OUTER JOIN
        users_has_sites ON users_has_sites.sites_id = sites.id
          LEFT OUTER JOIN
        users ON users.id = users_has_sites.users_id
          WHERE users.id = ?
      GROUP BY trial_tests.id
      `,
          [req.params.id],
          (err, rows) => {
            if (err) throw err;
            res.send(rows);
          }
        );
      }
    })
  ),
  router.get("/usr/:id/:limit", auth, (req, res) =>
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          `SELECT 
          trial_tests.id,
          trial_tests.lights,
          trial_tests.result,
          trial_tests.set,
          trial_tests.created_at,
          FLOOR(SUM(errors.error != 'OK') / trial_tests.lights) AS errors,
          FLOOR(SUM(errors.error = 'OK') / trial_tests.lights) AS responseok,
          GROUP_CONCAT(DISTINCT levels.level
              SEPARATOR ', ') AS level,
          GROUP_CONCAT(DISTINCT buildings.building
              SEPARATOR ', ') AS building,
          sites.name as site,
          users.id as users_id
      FROM
          trial_tests
              LEFT OUTER JOIN
          trial_tests_has_lights ON trial_tests_has_lights.trial_tests_id = trial_tests.id
              LEFT OUTER JOIN
          lights ON lights.id = trial_tests_has_lights.lights_id
              LEFT OUTER JOIN
          errors ON errors.test_id = trial_tests.id
              LEFT OUTER JOIN
          levels ON levels.id = lights.levels_id
          LEFT OUTER JOIN
        buildings ON buildings.id = levels.buildings_id
          LEFT OUTER JOIN
        sites ON sites.id = buildings.sites_id
          LEFT OUTER JOIN
        users_has_sites ON users_has_sites.sites_id = sites.id
          LEFT OUTER JOIN
        users ON users.id = users_has_sites.users_id
          WHERE users.id = ?
      GROUP BY trial_tests.id
      ORDER BY trial_tests.id DESC
      LIMIT ?
      `,
          [req.params.id, parseInt(req.params.limit)],
          (err, rows) => {
            if (err) throw err;
            res.send(rows);
          }
        );
      }
    })
  ),
  (module.exports = router);
