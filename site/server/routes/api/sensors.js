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
        sensors.type as sensor_type,
        sensors.parent_id,
        sensors.node_id,
        sensors.is_assigned as sensor_is_assigned,
        lights.device_id,
        lights.type,
        lights.status,
        lights.fp_coordinates_left,
        lights.fp_coordinates_bot
    FROM
        sensors
            LEFT OUTER JOIN
        lights ON lights.id = sensors.parent_id
    WHERE lights.levels_id = ?`,
        [req.params.level_id],
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
            },
          ],
          (err, results) => {
            if (err) res.send(err).status(400);
            res.sendStatus(200);
          }
        );
      }
    });
  });

module.exports = router;
