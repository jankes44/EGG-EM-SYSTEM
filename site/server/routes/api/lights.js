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
        lgt_groups.group_name,
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
        lgt_groups ON lights.lgt_groups_id = lgt_groups.id
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
  router.get("/nodevices/:level", auth, (req, res) =>
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          `SELECT 
          lgt_groups.*,
          levels.id as levels_id,
          levels.level,
          buildings.building,
          buildings.id as buildings_id,
          sites.mqtt_topic_out,
          sites.mqtt_topic_in,
          sites.id as sites_id,
          sites.name as sites_name
        FROM
          lgt_groups
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
        WHERE levels.id = ?
    GROUP BY lgt_groups.id, levels.id`,
          [req.params.level],
          (err, rows) => {
            if (err) throw err;
            res.json(rows);
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
        lgt_groups.group_name,
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
        lgt_groups ON lights.lgt_groups_id = lgt_groups.id
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
          lights.lgt_groups_id,
          lights.node_id,
          lights.device_id,
          lights.type,
          lights.status,
          lgt_groups.group_name,
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
          lgt_groups ON lights.lgt_groups_id = lgt_groups.id
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
        lgt_groups.group_name,
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
        lgt_groups ON lights.lgt_groups_id = lgt_groups.id
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
  router.get("/group/:lgt_groups_id", auth, (req, res) =>
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          `SELECT lights.*, lgt_groups.group_name
            FROM 
           lights 
            LEFT OUTER JOIN 
           lgt_groups ON lights.lgt_groups_id = lgt_groups.id 
           WHERE lights.lgt_groups_id = ? AND lights.is_assigned = 0`,
          [req.params.lgt_groups_id],
          (err, rows) => res.json(rows)
        );
      }
    })
  ),
  //get only node_id from lights
  router.post("/groups", auth, (req, res) =>
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          "SELECT lights.*, lgt_groups.group_name AS group_name FROM lights LEFT OUTER JOIN lgt_groups ON lgt_groups.id = lights.lgt_groups_id where lgt_groups_id in (?)",
          [req.body],
          (err, rows) => res.json(rows)
        ),
          console.log(req.body);
      }
    })
  ),
  router.get("/nodes/:group_id", auth, (req, res) =>
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          "SELECT node_id FROM lights WHERE lgt_groups_id = ?",
          [req.params.group_id],
          (err, rows) => res.json(rows)
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
  //get light by param: id
  router.get("/id/:id", auth, (req, res) =>
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          "SELECT lights.*, lgt_groups.group_name AS group_name FROM lights LEFT OUTER JOIN lgt_groups ON lgt_groups.id = lights.lgt_groups_id WHERE lights.id=? GROUP BY lgt_groups.id , lights.lgt_groups_id",
          [req.params.id],
          (err, rows) => res.json(rows)
        );
      }
    })
  ),
  //get light by param: group_id
  router.get("/group/:id", auth, (req, res) =>
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          "SELECT lights.*, lgt_groups.group_name AS group_name FROM lights LEFT OUTER JOIN lgt_groups ON lgt_groups.id = lights.lgt_groups_id where lgt_groups_id = ?",
          (err, rows) => res.json(rows)
        );
      }
    })
  ),
  // router.get("/testslights/:id", auth, (req, res) =>
  //   jwt.verify(req.token, process.env.SECRET_KEY, err => {
  //     if (err) {
  //       res.sendStatus(403);
  //     } else {
  //       con.query(
  //         "SELECT * FROM tests_has_lights WHERE tests_id = ?",
  //         [req.params.id],
  //         (err, rows) => console.log(rows)
  //       );
  //     }
  //   })
  // ),
  router.get("/testslights/:id", auth, (req, res) =>
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          "SELECT * FROM tests_has_lights WHERE tests_id = (?)",
          [req.params.id],
          (err, rows) => {
            if (err) throw err;
            var lights = rows.map((item) => {
              return item.lights_id;
            });
            if (!lights.length) {
            } else {
              con.query(
                "SELECT lights.*, lgt_groups.group_name AS group_name FROM lights LEFT OUTER JOIN lgt_groups ON lgt_groups.id = lights.lgt_groups_id WHERE lights.id IN (?)",
                [lights],
                (err, rows2) => {
                  if (err) throw err;
                  res.json(rows2);
                }
              );
            }
          }
        );
      }
    })
  ),
  // Create new light
  router.post("/new", auth, function (req, res) {
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          "INSERT INTO lights SET lgt_groups_id=?, fp_coordinates_bot=-550, fp_coordinates_left=0",
          [req.body.lgt_groups_id],
          function (error, results, fields) {
            if (error) throw error;
            console.log(
              "New device inserted to group id:",
              req.body.lgt_groups_id
            );
            res.end(JSON.stringify(results, fields));
          }
        );
      }
    });
  });

router.post("/testeditmany", auth, function (req, res) {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      if (req.body) {
        req.body.newRows.forEach((newRow) => {
          con.query(
            "INSERT INTO lights SET id=?, lgt_groups_id=?",
            [newRow.id, newRow.lgt_groups_id],
            (err, results) => {
              if (err) throw err;
            }
          );
        });
        req.body.updateData.forEach((element) => {
          let newValue = element.newValue;
          if (element.colName === "lgt_groups_id") {
            newValue = parseInt(element.newValue);
          }

          con.query(
            "UPDATE lights set ??=? WHERE id=? ",
            [element.colName, newValue, element.row],
            (err, results) => {
              if (err) throw err;
            }
          );
        });
        res.end("edited");
      } else {
        res.end("no data provided");
        console.log("no data provided, testeditmany");
      }
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

router.post("/edit/:id", auth, function (req, res) {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      console.log(req.body);
      if (req.body[0] === "group_name") {
        con.query(
          "UPDATE lights SET ??=? WHERE id=?",
          ["lgt_groups_id", req.body[1], req.params.id],
          function (error, results, fields) {
            if (error) throw error;
            res.end(JSON.stringify(results));
          }
        );
      } else {
        con.query(
          "UPDATE lights SET lgt_groups_id = ?, is_assigned=1 WHERE id=?",
          [req.body.lgt_groups_id, req.params.id],
          function (error, results, fields) {
            if (error) throw error;
            res.end(JSON.stringify(results));
          }
        );
      }
    }
  });
});

router.post("/move/:id", auth, function (req, res) {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      con.query(
        "UPDATE lights SET lgt_groups_id=? WHERE id=?",
        [req.body.lgt_groups_id, req.params.id],
        function (error, results, fields) {
          if (error) throw error;
          res.end(JSON.stringify(results));
        }
      );
    }
  });
});

router.post("/:id", auth, function (req, res) {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      if (req.body.lgt_groups_id) {
        con.query(
          "UPDATE `lights` SET `lgt_groups_id`=?, `device_id`=?, `type`=?, `node_id`=? where `id`=?",
          [
            req.body.lgt_groups_id,
            req.body.device_id,
            req.body.type,
            req.body.node_id,
            req.params.id,
          ],
          function (error, results, fields) {
            if (error) throw error;
            res.end(JSON.stringify(results));
          }
        );
      } else {
        con.query(
          "UPDATE `lights` SET `device_id`=?, `type`=?, `node_id`=? where `id`=?",
          [req.body.device_id, req.body.type, req.body.node_id, req.params.id],
          function (error, results, fields) {
            if (error) throw error;
            res.end(JSON.stringify(results));
          }
        );
      }
    }
  });
});

// Update chosen light
router.post("/:id", auth, function (req, res) {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      con.query(
        "UPDATE `lights` SET `lgt_groups_id`=?, `description`=? where `id`=?",
        [req.body.lgt_groups_id, req.body.description, req.params.id],
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

router.get("/lightcount/all", auth, (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      con.query(
        "select lgt_groups.id, lgt_groups.group_name, lgt_groups.description, count(*) as Lights from lgt_groups inner join lights on lights.lgt_groups_id = lgt_groups.id group by lgt_groups.id, lights.lgt_groups_id",

        (err, rows) => res.json(rows)
      );
    }
  });
}),
  //get light count in group by param: group_id
  router.get("/groupcount/:id", auth, (req, res) => {
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          "select lgt_groups.id, lgt_groups.group_name, lgt_groups.description, count(*) as Lights from lgt_groups inner join lights on lights.lgt_groups_id = lgt_groups.id where lgt_groups.id = ? group by lgt_groups.id, lights.lgt_groups_id",
          [req.params.id],
          (err, rows) => res.json(rows)
        );
      }
    });
  }),
  router.get("/dev/:id/:uid/:test", auth, (req, res) =>
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        if (req.params.id === "ping") {
          res.json("pong");
        }
        console.log(req.params.id, req.params.uid, req.params.test);
      }
    })
  ),
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
