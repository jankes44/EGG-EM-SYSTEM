const express = require("express");
const router = express.Router();
var moment = require("moment");
const uuid = require("uuid");
const mysql = require("mysql");
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken");
const con = require("../../database/db2");

const usersSites = `SELECT 
                    sites.id AS sites_id,
                    sites.name,
                    sites.socket_name,
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
                    GROUP BY sites_id`;

const revokeAccess = `DELETE FROM users_has_sites WHERE users_id=? AND sites_id=?`;
const insertSite =
  "INSERT INTO sites SET `description`=?, `location`=?, `description`=?";
const updateSite =
  "UPDATE `sites` SET `group_name`=?, `description`=? where `id`=(?)";
const updateSiteNoDesc = "UPDATE `sites` SET `group_name`=? where `id`=(?)";
const deleteSite = "DELETE FROM `sites` WHERE `id`=?";

//get site by param: users_id
router.get("/:id", auth, (req, res) =>
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      con.query(usersSites, req.params.id, (err, rows) => {
        if (err) throw err;
        res.json(rows);
      });
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
        con.query(revokeAccess, [req.params.uid, req.params.sid], function (
          error,
          results
        ) {
          if (error) throw error;
          res.sendStatus(200);
        });
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
      con.query(insertSite, postData, function (error, results) {
        if (error) throw error;
        res.sendStatus(200);
      });
    }
  });
});

// Update chosen site
router.post("/:id", auth, function (req, res) {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      if (req.body.description) {
        con.query(
          updateSite,
          [req.body.group_name, req.body.description, req.params.id],
          function (error, results) {
            if (error) throw error;
            res.end(JSON.stringify(results));
          }
        );
      } else {
        con.query(
          updateSiteNoDesc,
          [req.body.group_name, req.params.id],
          function (error, results) {
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
      con.query(deleteSite, req.params.id, function (error, results) {
        if (error) throw error;
        res.sendStatus(200);
      });
    }
  });
});

module.exports = router;
