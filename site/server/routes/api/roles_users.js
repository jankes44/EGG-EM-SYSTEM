const express = require("express");
const router = express.Router();
var moment = require("moment");
const uuid = require("uuid");
const mysql = require("mysql");
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken");
const con = require("../../database/db2");

//gets all groups
router.get("/:access", auth, (req, res) =>
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      con.query(
        "SELECT * FROM roles WHERE access <= ?",
        [req.params.access],
        (err, rows) => res.json(rows)
      );
    }
  })
);

//gets all groups
router.get("/users/:uid", auth, (req, res) =>
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      var sitesArr = [];
      con.query(
        `SELECT * FROM users_has_sites WHERE users_id=?`,
        [req.params.uid],
        (err, rows) => {
          rows.forEach((el) => {
            sitesArr.push(el.sites_id);
          });

          con.query(
            `SELECT 
            users.*, GROUP_CONCAT(users_has_sites.sites_id) as sites, GROUP_CONCAT(sites.name) as site_names, roles.name as role_name, roles.access
        FROM
            users
                LEFT OUTER JOIN
            users_has_sites ON users_has_sites.users_id = users.id
				LEFT OUTER JOIN
			sites ON sites.id = users_has_sites.sites_id
                LEFT OUTER JOIN
            roles ON roles.id = users.roles_id
            WHERE sites_id IN (?)
            GROUP BY users.id`,
            [sitesArr],
            (err, rows) => res.json(rows)
          );
        }
      );
    }
  })
);

router.delete("/users/delete/:id", auth, function (req, res) {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      con.query("DELETE FROM `users` WHERE `id`=?", [req.params.id], function (
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

router.post("/edit/:id", auth, function (req, res) {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      con.query(
        "UPDATE `users` SET ??=? WHERE `id`=?",
        [req.body.column, req.body.value, req.params.id],
        function (error, results, fields, rows, id) {
          if (error) throw error;
          res.end(`User edited successfuly`);
        }
      );
    }
  });
});

module.exports = router;
