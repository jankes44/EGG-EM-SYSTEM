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
router.get("/", auth, (req, res) =>
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      con.query("SELECT * FROM lights ORDER BY id asc", (err, rows) =>
        res.json(rows)
      );
    }
  })
),
  //get only node_id from lights
  router.get("/nodes", auth, (req, res) =>
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query("SELECT node_id FROM lights ORDER BY id asc", (err, rows) =>
          res.json(rows)
        );
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
  router.get("/:id", auth, (req, res) =>
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
          [req.params.id],
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
  router.post("/", auth, function (req, res) {
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      console.log(req.body);
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          "INSERT INTO lights SET lgt_groups_id=?",
          [req.body.lgt_groups_id],
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
      console.log(req.body);
      con.query("DELETE FROM `lights` WHERE `id`=?", [req.params.id], function (
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
  (module.exports = router);
