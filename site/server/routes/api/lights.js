const express = require("express");
const router = express.Router();
var moment = require("moment");
const uuid = require("uuid");
const mysql = require("mysql");
const cors = require("cors");
const con = require("../../database/db2");
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken");

let arr;
var data;

//gets all lights
router.get("/:uid", auth, (req, res) =>
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      con.query(
        `SELECT 
        lights.*, 
        levels.id as levels_id,
        levels.level,
        buildings.building,
        buildings.id as buildings_id,
        sites.mqtt_topic_out,
        sites.mqtt_topic_in,
        sites.id as sites_id,
        sites.name as sites_name
      FROM
        lights
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
      WHERE users.id = ? AND lights.is_assigned = 1`,
        [req.params.uid],
        (err, rows) => {
          if (err) throw err;
          if (rows.length) {
            res.json(rows);
          } else res.json([]);
        }
      );
    }
  })
),
  router.get("/unassigned/:uid", auth, (req, res) =>
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          `SELECT 
        lights.*, 
        levels.id as levels_id,
        levels.level,
        buildings.building,
        buildings.id as buildings_id,
        sites.mqtt_topic_out,
        sites.mqtt_topic_in,
        sites.id as sites_id,
        sites.name as sites_name
      FROM
        lights
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
      WHERE users.id = ? AND lights.is_assigned = 0`,
          [req.params.uid, req.params.assigned],
          (err, rows) => {
            if (err) throw err;
            if (rows.length) {
              res.json(rows);
            } else res.json([]);
          }
        );
      }
    })
  ),
  //gets all lights
  router.get("/building/:buildings_id", auth, (req, res) =>
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          `SELECT 
          lights.id as lights_id,
          lights.node_id,
          lights.device_id,
          lights.type,
          lights.status,
          levels.id as levels_id,
          levels.level,
          buildings.building,
          buildings.id as buildings_id,
          sites.mqtt_topic_out,
          sites.mqtt_topic_in,
          sites.id as sites_id,
          sites.name as sites_name
        FROM
          lights
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
        WHERE buildings.id = ?
        GROUP BY lights_id`,
          [req.params.buildings_id],
          (err, rows) => {
            if (err) throw err;
            if (rows.length) {
              res.json(rows);
            } else
              con.query(
                "SELECT id as last_id FROM lights ORDER BY id DESC LIMIT 1",
                (err, rows) => res.json(rows)
              );
          }
        );
      }
    })
  ),
  router.get("/level/:level_id", auth, (req, res) =>
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          `SELECT 
        lights.*, 
        levels.id as levels_id,
        levels.level,
        buildings.building,
        buildings.id as buildings_id,
        sites.mqtt_topic_out,
        sites.mqtt_topic_in,
        sites.id as sites_id,
        sites.name as sites_name
      FROM
        lights
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
      WHERE levels.id = ?
	GROUP BY lights.id, levels.id`,
          [req.params.level_id],
          (err, rows) => {
            if (err) throw err;
            if (rows.length) {
              res.json(rows);
            } else res.json([]);
          }
        );
      }
    })
  ),
  router.get("/nodesingle/:id", auth, (req, res) =>
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          "SELECT node_id FROM lights WHERE id = ?",
          [req.params.id],
          (err, rows) => res.json(rows)
        );
      }
    })
  ),
  router.post("/addempty/:amount", auth, function (req, res) {
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        console.log("Add", req.params.amount, "empty devices");

        res.sendStatus(200);
      }
    });
  });

router.post("/edit/many", auth, function (req, res) {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      console.log("edit");
      req.body.devices.forEach((el) => {
        con.query(
          `UPDATE emergencyegg.lights
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
      res.sendStatus(200);
    }
  });
});

//bulk edit
router.post("/bulkedit", auth, function (req, res) {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      const updateData = Object.keys(req.body.update_data).map(
        (i) => req.body.update_data[i]
      );
      updateData.forEach((el) => {
        con.query(`UPDATE lights SET ? WHERE id = ?`, [
          {
            device_id: el.newData.device_id,
            type: el.newData.type,
            node_id: el.newData.node_id,
          },
          el.newData.id,
        ]);
      });
      res.sendStatus(200);
    }
  });
});

router.post("/edit/:id", auth, function (req, res) {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      con.query(
        "UPDATE lights SET levels_id = ?, is_assigned=1 WHERE id=?",
        [req.body.levels_id, req.params.id],
        function (error, results, fields) {
          if (error) throw error;
          res.end(JSON.stringify(results));
        }
      );
    }
  });
});

router.post("/move/:id", auth, function (req, res) {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      con.query(
        "UPDATE lights SET levels_id=? WHERE id=?",
        [req.body.levels_id, req.params.id],
        function (error, results, fields) {
          if (error) throw error;
          res.end(JSON.stringify(results));
        }
      );
    }
  });
});

// Delete chosen light
router.delete("/:id", auth, function (req, res) {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      con.query(
        "SELECT * FROM `lights` WHERE `id`=?",
        [req.params.id],
        (err, results) => {
          if (results.length) {
            con.query(
              "DELETE FROM `lights` WHERE `id`=?",
              [req.params.id],
              function (error, results, fields, rows, id) {
                if (error) throw error;
                res.end(JSON.stringify(results));
                console.log("Deleted device id " + req.params.id);
              }
            );
          } else {
            console.log(`Device ${req.params.id} doesn't exist`);
            res.end(JSON.stringify(results));
          }
        }
      );
    }
  });
});

router.get("/lastid", auth, (req, res) =>
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      con.query(
        "SELECT id as last_id FROM lights ORDER BY id DESC LIMIT 1",
        (err, rows) => {
          if (err) throw err;
          console.log(rows);
          res.json(rows[0]);
        }
      );
    }
  })
),
  (module.exports = router);
