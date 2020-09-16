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
      con.query("SELECT * FROM sites", (err, rows) => res.json(rows));
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
          `SELECT 
          sites.id AS sites_id,
          sites.name,
          users.id,
          users.email,
          GROUP_CONCAT(buildings.id
              SEPARATOR ', ') AS buildings_id,
          GROUP_CONCAT(buildings.building
              SEPARATOR ', ') AS buildings
      FROM
          sites
              LEFT OUTER JOIN
          users_has_sites ON users_has_sites.sites_id = sites.id
              LEFT OUTER JOIN
          users ON users.id = users_has_sites.users_id
              LEFT OUTER JOIN
          buildings ON buildings.sites_id = sites.id
              WHERE users.id = ?
      GROUP BY sites_id
      `,
          [req.params.id],
          (err, rows) => {
            if (err) throw err;
            res.json(rows);
          }
        );
      }
    })
  ),
  // Delete chosen light
  router.delete("/revoke/:uid/:sid", auth, function (req, res) {
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        // console.log(req.params);
        con.query(
          "DELETE FROM users_has_sites WHERE users_id=? AND sites_id=?",
          [req.params.uid, req.params.sid],
          function (error, results, fields, rows, id) {
            if (error) throw error;
            res.end(`Record deleted succesfully`);
          }
        );
      }
    });
  });

// Create new site
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
        "INSERT INTO sites SET `description`=?, `location`=?, `description`=?",

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
          "UPDATE `sites` SET `group_name`=?, `description`=? where `id`=(?)",
          [req.body.group_name, req.body.description, req.params.id],
          function (error, results, fields) {
            if (error) throw error;
            res.end(JSON.stringify(results));
          }
        );
      } else {
        con.query(
          "UPDATE `sites` SET `group_name`=? where `id`=(?)",
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
      con.query("DELETE FROM `sites` WHERE `id`=?", [req.params.id], function (
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
