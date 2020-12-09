const express = require("express");
const router = express.Router();
var moment = require("moment");
const uuid = require("uuid");
const mysql = require("mysql");
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken");
const con = require("../../database/db2");

//gets all groups
router.get("/", auth, (req, res) =>
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      con.query("SELECT * FROM buildings", (err, rows) => res.json(rows));
    }
  })
),
  //get group by param: id
  router.get("/:id", auth, (req, res) =>
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          "SELECT * FROM buildings WHERE id = ?",
          [req.params.id],
          (err, rows) => res.json(rows)
        );
      }
    })
  ),
  // Create new group
  router.post("/", auth, function (req, res) {
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        var postData = [
          req.body.id,
          req.body.group_name,
          req.body.location,
          req.body.description,
        ];
        con.query(
          "INSERT INTO buildings SET `description`=?, `location`=?, `description`=?",

          postData,
          function (error, results, fields) {
            if (error) throw error;
            res.end(JSON.stringify(results)).json({ msg: `Light added` });
          }
        );
      }
    });
  });

// Update chosen light
router.post("/:id", auth, function (req, res) {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      if (req.body.description) {
        con.query(
          "UPDATE `buildings` SET `group_name`=?, `description`=? where `id`=(?)",
          [req.body.group_name, req.body.description, req.params.id],
          function (error, results, fields) {
            if (error) throw error;
            res.end(JSON.stringify(results));
          }
        );
      } else {
        con.query(
          "UPDATE `buildings` SET `group_name`=? where `id`=(?)",
          [req.body.group_name, req.params.id],
          function (error, results, fields) {
            if (error) throw error;
            res.end(JSON.stringify(results));
          }
        );
      }
    }
  });
});

// Delete chosen light
router.delete("/:id", auth, function (req, res) {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      console.log(req.body);
      con.query(
        "DELETE FROM `buildings` WHERE `id`=?",
        [req.params.id],
        function (error, results, fields, rows, id) {
          if (error) throw error;
          res.end(`Record deleted succesfully`);
        }
      );
    }
  });
});

module.exports = router;
