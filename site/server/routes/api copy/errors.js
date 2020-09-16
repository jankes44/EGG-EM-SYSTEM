const express = require("express");
const router = express.Router();
var moment = require("moment");
const uuid = require("uuid");
const mysql = require("mysql");
const con = require("../../database/db2");
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken");

//get error by param: id
router.get("/:id", auth, (req, res) =>
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      con.query(
        "SELECT * FROM errors WHERE id = ?",
        [req.params.id],
        (err, rows) => res.json(rows)
      );
    }
  })
),
  //get error by param: tests_id
  router.get("/test/:id", auth, (req, res) =>
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          "SELECT errors.*, lights.device_id, lights.type, lights.lgt_groups_id, lgt_groups.group_name FROM errors LEFT OUTER JOIN lights ON lights.id = errors.device LEFT OUTER JOIN lgt_groups ON lgt_groups.id = lights.lgt_groups_id WHERE test_id = ? GROUP BY errors.device , lights.id",
          [req.params.id],
          (err, rows) => res.json(rows)
        );
      }
    })
  ),
  (module.exports = router);
