const express = require("express");
const router = express.Router();
const con = require("../../database/db2");
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken");

//get schedule
router.get("/", auth, (req, res) =>
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      con.query("SELECT * FROM schedule", (err, rows) => res.json(rows));
    }
  })
),
  router.get("/schgroups/:uid", auth, (req, res) =>
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          `SELECT 
          schedule.*,
          schedule_has_lgt_groups.lgt_groups_id AS group_id,
          lgt_groups.group_name,
          levels.level
      FROM
          schedule
              LEFT OUTER JOIN
          schedule_has_lgt_groups ON schedule_has_lgt_groups.schedule_schedule_id = schedule.schedule_id
              LEFT OUTER JOIN
          lgt_groups ON lgt_groups.id = schedule_has_lgt_groups.lgt_groups_id
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
      WHERE users.id = ?`,
          [req.params.uid],
          (err, rows) => res.json(rows)
        );
      }
    })
  ), //
  router.get("/schgrplvl/:uid", auth, (req, res) =>
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          `SELECT 
          schedule.schedule_id AS id,
          schedule.date,
          GROUP_CONCAT(schedule_has_lgt_groups.lgt_groups_id
              SEPARATOR ', ') AS group_id,
          GROUP_CONCAT(lgt_groups.group_name
              SEPARATOR ', ') AS group_name,
          GROUP_CONCAT(DISTINCT levels.level
              SEPARATOR ', ') AS levels
      FROM
          schedule
              LEFT OUTER JOIN
          schedule_has_lgt_groups ON schedule_has_lgt_groups.schedule_schedule_id = schedule.schedule_id
              LEFT OUTER JOIN
          lgt_groups ON lgt_groups.id = schedule_has_lgt_groups.lgt_groups_id
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
      GROUP BY schedule.schedule_id`,
          [req.params.uid],
          (err, rows) => res.json(rows)
        );
      }
    })
  ),
  //get error by param: id
  router.get("/:id", auth, (req, res) =>
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          "SELECT schedule.*, schedule_has_lgt_groups.lgt_groups_id as group_id, lgt_groups.group_name FROM schedule LEFT OUTER JOIN schedule_has_lgt_groups ON schedule_has_lgt_groups.schedule_schedule_id = schedule.schedule_id LEFT OUTER JOIN lgt_groups ON lgt_groups.id = schedule_has_lgt_groups.lgt_groups_id WHERE schedule_id = ?",
          [req.params.id],
          (err, rows) => res.json(rows)
        );
      }
    })
  ),
  //get error by param: id
  router.get("/:id", auth, (req, res) =>
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          "SELECT * FROM schedule WHERE id = ?",
          [req.params.id],
          (err, rows) => res.json(rows)
        );
      }
    })
  ),
  router.post("/", auth, (req, res) =>
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        var postData = [req.body.date];
        con.query("INSERT INTO schedule SET `date`=?", postData, function (
          error,
          results,
          fields
        ) {
          if (error) throw error;
          res.end(JSON.stringify(results));

          var dataArr = req.body.data;
          var schedule_id;

          con.query(
            "SELECT schedule_id FROM schedule ORDER BY schedule_id DESC limit 1",
            (err, result) => {
              schedule_id = result[0].schedule_id;

              dataArr.forEach((item) => {
                con.query("INSERT INTO schedule_has_lgt_groups SET ?", {
                  schedule_schedule_id: schedule_id,
                  lgt_groups_id: item,
                });
              });
            }
          );
        });
      }
    })
  ),
  //   //get error by param: tests_id
  //   router.get("/test/:id", auth, (req, res) =>
  //     jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
  //       if (err) {
  //         res.sendStatus(403);
  //       } else {
  //         con.query(
  //           "SELECT schedule.*, lights.device_id, lights.type, lights.lgt_groups_id, lgt_groups.group_name FROM schedule LEFT OUTER JOIN lights ON lights.id = schedule.device LEFT OUTER JOIN lgt_groups ON lgt_groups.id = lights.lgt_groups_id WHERE tests_id = ? GROUP BY schedule.device , lights.id",
  //           [req.params.id],
  //           (err, rows) => res.json(rows)
  //         );
  //       }
  //     })
  //   ),
  (module.exports = router);
