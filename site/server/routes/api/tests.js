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
        `SELECT 
        tests.id,
        tests.lights,
        tests.result,
        tests.set,
        tests.created_at,
        FLOOR(SUM(errors.error != 'OK') / tests.lights) AS errors,
        FLOOR(SUM(errors.error = 'OK') / tests.lights) AS responseok,
        GROUP_CONCAT(DISTINCT tests_has_lights.lights_id
            SEPARATOR ', ') AS tests_lights,
        GROUP_CONCAT(DISTINCT lights.device_id
            SEPARATOR ', ') AS device_id,
        GROUP_CONCAT(DISTINCT levels.level
            SEPARATOR ', ') AS level
    FROM
        tests
            LEFT OUTER JOIN
        tests_has_lights ON tests_has_lights.tests_id = tests.id
            LEFT OUTER JOIN
        lights ON lights.id = tests_has_lights.lights_id
            LEFT OUTER JOIN
        errors ON errors.test_id = tests.id
            LEFT OUTER JOIN
        levels ON levels.id = lights.levels_id
    GROUP BY tests.id`,
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
          trial_tests.created_at, trial_tests.id, buildings.building
      FROM
          trial_tests
          LEFT OUTER JOIN
        trial_tests_has_lights ON trial_tests_has_lights.trial_tests_id = trial_tests.id
          LEFT OUTER JOIN
        lights ON lights.id = trial_tests_has_lights.lights_id
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
              where users_id=?
      ORDER BY id DESC
      LIMIT 1`,
          [req.params.uid],
          (err, rows) => res.json(rows[0])
        );
      }
    })
  ),
  //get test by param: id
  router.get("/:id", auth, (req, res) =>
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          "SELECT tests.id, tests.lights, tests.result, tests.set, tests.created_at, FLOOR(SUM(errors.error != 'OK') / tests.lights) AS errors, FLOOR(SUM(errors.error = 'OK')/tests.lights) as responseok, GROUP_CONCAT(DISTINCT tests_has_lights.lights_id SEPARATOR ', ') AS tests_lights, GROUP_CONCAT(DISTINCT lights.device_id SEPARATOR ', ') as device_id, GROUP_CONCAT(DISTINCT lights.lgt_groups_id SEPARATOR ', ') as group_id, group_concat(DISTINCT lgt_groups.group_name SEPARATOR ', ') as group_name, group_concat(DISTINCT levels.level separator ', ') as level, group_concat(DISTINCT levels.id separator ', ') as level_id FROM tests LEFT OUTER JOIN tests_has_lights ON tests_has_lights.tests_id = tests.id LEFT OUTER JOIN lights ON lights.id = tests_has_lights.lights_id LEFT OUTER JOIN lgt_groups ON lgt_groups.id = lights.lgt_groups_id LEFT OUTER JOIN errors ON errors.test_id = tests.id LEFT OUTER JOIN levels on levels.id = lights.levels_id WHERE tests.id=? GROUP BY tests.id",
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
  //get test by param: groups_id
  router.get("/usr/:id", auth, (req, res) =>
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          `SELECT 
          tests.id,
          tests.lights,
          tests.result,
          tests.set,
          tests.created_at,
          FLOOR(SUM(errors.error != 'OK') / tests.lights) AS errors,
          FLOOR(SUM(errors.error = 'OK') / tests.lights) AS responseok,
          GROUP_CONCAT(DISTINCT lgt_groups.group_name
              SEPARATOR ', ') AS group_name,
          GROUP_CONCAT(DISTINCT levels.level
              SEPARATOR ', ') AS level,
          GROUP_CONCAT(DISTINCT buildings.building
              SEPARATOR ', ') AS building,
          sites.name as site,
          users.id as users_id
      FROM
          tests
              LEFT OUTER JOIN
          tests_has_lights ON tests_has_lights.tests_id = tests.id
              LEFT OUTER JOIN
          lights ON lights.id = tests_has_lights.lights_id
              LEFT OUTER JOIN
          lgt_groups ON lgt_groups.id = lights.lgt_groups_id
              LEFT OUTER JOIN
          errors ON errors.test_id = tests.id
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
      GROUP BY tests.id
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
          tests.id,
          tests.lights,
          tests.result,
          tests.set,
          tests.created_at,
          FLOOR(SUM(errors.error != 'OK') / tests.lights) AS errors,
          FLOOR(SUM(errors.error = 'OK') / tests.lights) AS responseok,
          GROUP_CONCAT(DISTINCT lgt_groups.group_name
              SEPARATOR ', ') AS group_name,
          GROUP_CONCAT(DISTINCT levels.level
              SEPARATOR ', ') AS level,
          GROUP_CONCAT(DISTINCT buildings.building
              SEPARATOR ', ') AS building,
          sites.name as site,
          users.id as users_id
      FROM
          tests
              LEFT OUTER JOIN
          tests_has_lights ON tests_has_lights.tests_id = tests.id
              LEFT OUTER JOIN
          lights ON lights.id = tests_has_lights.lights_id
              LEFT OUTER JOIN
          lgt_groups ON lgt_groups.id = lights.lgt_groups_id
              LEFT OUTER JOIN
          errors ON errors.test_id = tests.id
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
      GROUP BY tests.id
      LIMIT ?
      `,
          [req.params.id, req.params.limit],
          (err, rows) => {
            if (err) throw err;
            res.send(rows);
          }
        );
      }
    })
  ),
  // Create new test
  router.post("/", auth, function (req, res) {
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        var postData = [
          req.body.light_id,
          req.body.group_id,
          req.body.lights,
          req.body.result,
          req.body.warning,
          req.body.failed,
          req.body.info,
        ];
        con.query(
          "INSERT INTO tests SET `light_id`=?,`group_id`=?,`lights`=?,`result`=?,`warning`=?,`failed`=?,`info`=?",
          postData,
          function (error, results, fields) {
            if (error) throw error;
            res.end(JSON.stringify(results));
          }
        );
      }
    });
  });

// Update chosen test
router.put("/:id", auth, function (req, res) {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      con.query(
        "UPDATE `tests` SET `groups_id`=?,`name`=?,`location`=?, `description`=? where `id`=?",
        [
          req.body.groups_id,
          req.body.name,
          req.body.location,
          req.body.description,
          req.params.id,
        ],
        function (error, results, fields) {
          if (error) throw error;
          res.end(JSON.stringify(results));
        }
      );
    }
  });
});

// Delete chosen test
router.delete("/:id", auth, function (req, res) {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      console.log(req.body);
      con.query("DELETE FROM `tests` WHERE `id`=?", [req.params.id], function (
        error,
        results,
        fields,
        rows,
        id
      ) {
        if (error) throw error;
        res.end(`Record deleted succesfully`);
      });
    }
  });
});
module.exports = router;
