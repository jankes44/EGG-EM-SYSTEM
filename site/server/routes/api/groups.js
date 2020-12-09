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
      con.query(
        "select lgt_groups.*, GROUP_CONCAT(CONCAT(lights.device_id, ' ', lights.type) SEPARATOR ', ') as device from lgt_groups LEFT OUTER JOIN  lights ON lights.lgt_groups_id=lgt_groups.id GROUP BY lgt_groups.id",
        (err, rows) => res.json(rows)
      );
    }
  })
),
  router.get("/selectoptions/:uid", auth, (req, res) =>
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          `SELECT 
          lgt_groups.id AS value,
          CONCAT(buildings.building, " - ", levels.level, " level") AS label,
          levels.level as levels_name,
          buildings.building as buildings_name
      FROM
          lgt_groups
              LEFT OUTER JOIN
          levels ON lgt_groups.levels_id = levels.id
            LEFT OUTER JOIN
        buildings ON buildings.id = levels.buildings_id
          LEFT OUTER JOIN
        sites ON sites.id = buildings.sites_id
          LEFT OUTER JOIN
        users_has_sites ON users_has_sites.sites_id = sites.id
          LEFT OUTER JOIN
        users ON users.id = users_has_sites.users_id
      WHERE users.id = ?
      ORDER BY levels_id`,
          [req.params.uid],
          (err, rows) => res.json(rows)
        );
      }
    })
  ),
  //gets all groups + level
  router.get("/groupslevel/:uid", auth, (req, res) =>
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          `SELECT 
          lgt_groups.*, levels.level, users.id as users_id
      FROM
          lgt_groups
              LEFT OUTER JOIN
          levels ON lgt_groups.levels_id = levels.id
          LEFT OUTER JOIN
        buildings ON buildings.id = levels.buildings_id
          LEFT OUTER JOIN
        sites ON sites.id = buildings.sites_id
          LEFT OUTER JOIN
        users_has_sites ON users_has_sites.sites_id = sites.id
          LEFT OUTER JOIN
          users ON users.id = users_has_sites.users_id
      WHERE users.id = ?
      GROUP BY lgt_groups.id
      ORDER BY levels_id`,
          [req.params.uid],
          (err, rows) => res.json(rows)
        );
      }
    })
  ),
  //get groups by param id
  router.get("/:id", auth, (req, res) =>
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          "select lgt_groups.*, count(lights.id) as Lights from lgt_groups left join lights on lights.lgt_groups_id = lgt_groups.id where levels_id=? group by lights.lgt_groups_id",
          [req.params.id],
          (err, rows) => res.json(rows)
        );
      }
    })
  ),
  //get groups with level table joined
  router.get("/levels/", auth, (req, res) =>
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          "SELECT lgt_groups.*, levels.level FROM lgt_groups LEFT OUTER JOIN levels ON lgt_groups.levels_id = levels.id",
          [req.params.id],
          (err, rows) => res.json(rows)
        );
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
          "SELECT * FROM lgt_groups WHERE id = ?",
          [req.params.id],
          (err, rows) => res.json(rows)
        );
      }
    })
  ),
  // Create new group
  router.post("/new", auth, function (req, res) {
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        console.log(req.body);
        res.sendStatus(403);
      } else {
        console.log(req.body);
        con.query(
          "INSERT INTO lgt_groups SET levels_id=?, group_name=?",
          [req.body.levels_id, req.body.group_name],
          function (error, results, fields) {
            if (error) throw error;
            console.log(
              "New location inserted to level id:",
              req.body.levels_id
            );
            res.end(JSON.stringify(results, fields));
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
          "UPDATE `lgt_groups` SET `group_name`=?, `description`=? where `id`=(?)",
          [req.body.group_name, req.body.description, req.params.id],
          function (error, results, fields) {
            if (error) throw error;
            res.end(JSON.stringify(results));
          }
        );
      } else {
        con.query(
          "UPDATE `lgt_groups` SET `group_name`=? where `id`=(?)",
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

router.post("/edit/:id", auth, function (req, res) {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      con.query(
        "UPDATE lgt_groups SET ??=? WHERE id=?",
        [req.body.colName, req.body.newValue, req.params.id],
        function (error, results, fields) {
          if (error) throw error;
          res.send(JSON.stringify(results));
        }
      );
    }
  });
});

router.get("/test", auth, (req, res) =>
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      con.query("SELECT * FROM lights", (err, rows) => res.json(rows));
    }
  })
),
  // Delete chosen light
  router.delete("/:id", auth, function (req, res) {
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        console.log(req.params);
        con.query(
          "DELETE FROM `lgt_groups` WHERE `id`=?",
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
