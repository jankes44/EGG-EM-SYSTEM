const express = require("express");
const router = express.Router();
const con = require("../../database/db2");
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken");

//gets all tests
router.get("/", auth, (req, res) =>
  jwt.verify(req.token, process.env.SECRET_KEY, (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      con.query(
        "SELECT tests.id, tests.lights, tests.result, tests.set, tests.type, tests.created_at, FLOOR(SUM(errors.error != 'OK')/tests.lights) as errors, FLOOR(SUM(errors.error = 'OK')/tests.lights) as responseok, GROUP_CONCAT(DISTINCT tests_has_lights.lights_id SEPARATOR ', ') AS tests_lights, GROUP_CONCAT(DISTINCT lights.device_id SEPARATOR ', ') as device_id, GROUP_CONCAT(DISTINCT lights.lgt_groups_id SEPARATOR ', ') as group_id, group_concat(DISTINCT lgt_groups.group_name SEPARATOR ', ') as group_name, group_concat(DISTINCT levels.level separator ', ') as level FROM tests LEFT OUTER JOIN tests_has_lights ON tests_has_lights.tests_id = tests.id LEFT OUTER JOIN lights ON lights.id = tests_has_lights.lights_id LEFT OUTER JOIN lgt_groups ON lgt_groups.id = lights.lgt_groups_id LEFT OUTER JOIN errors ON errors.test_id = tests.id LEFT OUTER JOIN levels on levels.id = lgt_groups.levels_id GROUP BY tests.id",
        (err, rows) => res.json(rows)
      );
    }
  })
),
  //last test time
  router.get("/lasttest/:uid", auth, (req, res) =>
    jwt.verify(req.token, process.env.SECRET_KEY, (err, authData) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          `SELECT 
          tests.created_at, tests.id, buildings.building
      FROM
          tests
          LEFT OUTER JOIN
        tests_has_lights ON tests_has_lights.tests_id = tests.id
          LEFT OUTER JOIN
        lights ON lights.id = tests_has_lights.lights_id
          LEFT OUTER JOIN
              lgt_groups ON lights.lgt_groups_id = lgt_groups.id
                LEFT OUTER JOIN
              levels ON levels.id = lgt_groups.levels_id
                LEFT OUTER JOIN
              buildings ON buildings.id = levels.buildings_id
                LEFT OUTER JOIN
              sites ON sites.id = buildings.sites_id
                LEFT OUTER JOIN
              users_has_sites ON users_has_sites.sites_id = sites.id
                LEFT OUTER JOIN
              users ON users.id = users_has_sites.users_id
              where users_id=6
      ORDER BY id DESC
      LIMIT 1`,
          [req.params.uid],
          (err, rows) => res.json(rows[0])
        );
      }
    })
  ),
  //get report data by param: id
  router.get("/reportdata/:id", auth, (req, res) =>
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          "SELECT tests.*, a.error, a.device, lgt_groups.group_name AS location FROM tests JOIN errors AS a ON FIND_IN_SET(a.tests_id, tests.id) LEFT OUTER JOIN lgt_groups ON lgt_groups.id = tests.group_id where tests.id=?",
          [req.params.id],
          (err, rows) => {
            res.setHeader(
              "Content-Type",
              "application/json",
              "Access-Control-Allow-Headers",
              "Origin, X-Requested-With, Content-Type, Accept"
            );
            return res.send(rows[0]);
          }
        );
      }
    })
  ),
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
          lgt_groups.group_name AS location,
          levels.level,
          buildings.building,
          sites.name
      FROM
          trial_tests_has_lights
              LEFT OUTER JOIN
          lights ON lights.id = trial_tests_has_lights.lights_id
              LEFT OUTER JOIN
          lgt_groups ON lgt_groups.id = lights.lgt_groups_id
              LEFT OUTER JOIN
          levels ON levels.id = lgt_groups.levels_id
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
          trial_tests_has_lights.*, lights.id, lights.node_id, lights.device_id, lights.type, lgt_groups.group_name, levels.level, buildings.building as building
      FROM
          trial_tests_has_lights
      LEFT OUTER JOIN 
        lights ON lights.id = trial_tests_has_lights.lights_id
      LEFT OUTER JOIN
        lgt_groups ON lgt_groups.id = lights.lgt_groups_id
      LEFT OUTER JOIN
        levels ON levels.id = lgt_groups.levels_id
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
          trial_tests_has_lights.*, lights.id, lights.node_id, lights.device_id, lights.type, lgt_groups.group_name, levels.level, buildings.building as building
      FROM
          trial_tests_has_lights
      LEFT OUTER JOIN 
        lights ON lights.id = trial_tests_has_lights.lights_id
      LEFT OUTER JOIN
        lgt_groups ON lgt_groups.id = lights.lgt_groups_id
      LEFT OUTER JOIN
        levels ON levels.id = lgt_groups.levels_id
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
          FLOOR(SUM(errors.error != 'OK') / trial_tests.lights) AS errors,
          FLOOR(SUM(errors.error = 'OK') / trial_tests.lights) AS responseok,
          GROUP_CONCAT(DISTINCT lgt_groups.group_name
              SEPARATOR ', ') AS group_name,
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
          lgt_groups ON lgt_groups.id = lights.lgt_groups_id
              LEFT OUTER JOIN
          errors ON errors.test_id = trial_tests.id
              LEFT OUTER JOIN
          levels ON levels.id = lgt_groups.levels_id
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
          GROUP_CONCAT(DISTINCT lgt_groups.group_name
              SEPARATOR ', ') AS group_name,
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
          lgt_groups ON lgt_groups.id = lights.lgt_groups_id
              LEFT OUTER JOIN
          errors ON errors.test_id = trial_tests.id
              LEFT OUTER JOIN
          levels ON levels.id = lgt_groups.levels_id
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
