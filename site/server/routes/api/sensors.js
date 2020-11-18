const express = require("express");
const router = express.Router();
var moment = require("moment");
const uuid = require("uuid");
const mysql = require("mysql");
const cors = require("cors");
const con = require("../../database/db2");
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken");

//gets all lights
router.get("/level/:level_id", auth, (req, res) =>
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      con.query(
        `SELECT 
        sensors.id,
        sensors.parent_id,
        sensors.node_id,
        sensors.levels_id,
        sensors.is_assigned as sensor_is_assigned,
        sensors.fp_coordinates_left,
        sensors.fp_coordinates_bot, 
        sensors.type as sensor_type,
        lights.device_id,
        lights.type,
        lights.status,
        lights.levels_id,
        lights.node_id as light_node_id,
        Bm.battery,
        Bm.ldr
            FROM
        sensors
            LEFT OUTER JOIN
        lights ON lights.id = sensors.parent_id
		LEFT OUTER JOIN ( SELECT MAX(id), battery, ldr, sensor_node_id
           FROM device_battery_ldr
         GROUP
             BY id ) AS Bm
		ON Bm.sensor_node_id = sensors.node_id
    WHERE sensors.levels_id = ? AND sensors.is_assigned = 1
    GROUP BY sensors.id, lights.id`,
        [req.params.level_id],
        (err, rows) => {
          if (err) res.send({ err: err.stack }).status(400);
          else res.json(rows);
        }
      );
    }
  })
),
  //gets all lights
  router.get("/unassigned/:uid", auth, (req, res) =>
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          `SELECT
          sensors.id,
          sensors.type as sensor_type,
          sensors.parent_id,
          sensors.node_id,
          sensors.levels_id,
          sensors.is_assigned as sensor_is_assigned,
          sensors.fp_coordinates_left,
          sensors.fp_coordinates_bot,       
        lights.device_id,
        lights.type,
        lights.status,
        lights.levels_id,
        lights.node_id as light_node_id
    FROM
        sensors
            LEFT OUTER JOIN
        lights ON lights.id = sensors.parent_id  
            LEFT OUTER JOIN
        levels ON levels.id = sensors.levels_id
          LEFT OUTER JOIN
        buildings ON buildings.id = levels.buildings_id
          LEFT OUTER JOIN
        sites ON sites.id = buildings.sites_id
          LEFT OUTER JOIN
        users_has_sites ON users_has_sites.sites_id = sites.id
          LEFT OUTER JOIN
        users ON users.id = users_has_sites.users_id    
    WHERE users.id = ? AND sensors.is_assigned = 0`,
          [req.params.uid],
          (err, rows) => {
            if (err) res.send({ err: err.stack }).status(400);
            else res.json(rows);
          }
        );
      }
    })
  ),
  router.post("/add", auth, function (req, res) {
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          "INSERT INTO sensors SET ?",
          [
            {
              type: req.body.type,
              parent_id: req.body.parent_id,
              node_id: req.body.node_id,
              levels_id: req.body.levels_id,
            },
          ],
          (err, results) => {
            if (err) res.send(err).status(400);
            else res.sendStatus(200);
          }
        );
      }
    });
  });

router.post("/edit/:id", auth, function (req, res) {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      con.query(
        "UPDATE sensors SET ? WHERE id=?",
        [
          {
            type: req.body.type,
            parent_id: req.body.parent_id,
            node_id: req.body.node_id,
          },
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

router.post("/edit-position", auth, function (req, res) {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      req.body.devices.forEach((el) => {
        con.query(
          `UPDATE sensors
          SET fp_coordinates_left = ?,
          fp_coordinates_bot = ?
          WHERE id = ?
          `,
          [el.fp_coordinates_left, el.fp_coordinates_bot, el.id],
          (err, results) => {
            if (err) throw err;
          }
        );
      });
      console.log(req.body);
      res.sendStatus(200);
    }
  });
});

router.post("/assign/:id", auth, function (req, res) {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      con.query(
        "UPDATE sensors SET levels_id = ?, is_assigned=1 WHERE id=?",
        [req.body.levels_id, req.params.id],
        function (error, results, fields) {
          if (error) throw error;
          res.end(JSON.stringify(results));
        }
      );
    }
  });
});

router.delete("/:id", auth, function (req, res) {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      con.query(
        "DELETE FROM sensors WHERE id = ?",
        [req.params.id],
        (err, results) => {
          if (err) throw err;
          res.sendStatus(200);
        }
      );
    }
  });
});

module.exports = router;