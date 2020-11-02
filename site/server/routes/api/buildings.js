const express = require("express");
const router = express.Router();
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
  router.get("/:sites_id", auth, (req, res) =>
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          `SELECT
          s.id as sites_id,
            buildings.building,
            buildings.id as buildings_id,
            levels.id AS levels_id,
            levels.level,
            sum(case when lights.is_assigned = 1 then 1 else 0 end) as devices
        FROM
          sites as s
            LEFT OUTER JOIN
          buildings ON s.id = buildings.sites_id
                LEFT OUTER JOIN
            levels ON levels.buildings_id = buildings.id
                LEFT OUTER JOIN
            lgt_groups ON lgt_groups.levels_id = levels.id
                LEFT OUTER JOIN
            lights ON lights.lgt_groups_id = lgt_groups.id
        WHERE s.id = ${req.params.sites_id}
        GROUP BY buildings.id, levels.id
        `,
          (err, rows) => res.json(rows)
        );
      }
    })
  ),
  //get group by param: id
  router.get("/joinlevels/:sites_id", auth, (req, res) =>
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          `SELECT
          s.id as sites_id,
           buildings.id as buildings_id,
            buildings.building,
            group_concat(DISTINCT levels.level SEPARATOR ', ') as levels,
            sum(case when lights.is_assigned = 1 then 1 else 0 end) as devices
        FROM
          sites as s
            LEFT OUTER JOIN
          buildings ON s.id = buildings.sites_id
                LEFT OUTER JOIN
            levels ON levels.buildings_id = buildings.id
                LEFT OUTER JOIN
            lgt_groups ON lgt_groups.levels_id = levels.id
                LEFT OUTER JOIN
            lights ON lights.lgt_groups_id = lgt_groups.id
        WHERE s.id = ${req.params.sites_id}
        GROUP BY buildings.id
        `,
          (err, rows) => res.json(rows)
        );
      }
    })
  ),
  // Create new building and floors
  router.post("/new", auth, function (req, res) {
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          "INSERT INTO buildings SET building = ?, sites_id = ?",
          [req.body.name, req.body.sites_id],
          function (error, results, fields) {
            if (error) throw error;

            let counter = 1;
            const length = req.body.levels_count + 1;
            console.log(results.insertId, "New building");
            loop = () => {
              if (counter < length) {
                con.query(
                  "INSERT INTO levels SET level = ?, buildings_id = ?",
                  [counter, results.insertId],
                  (err, results) => {
                    if (err) throw err;
                    con.query("INSERT INTO lgt_groups SET levels_id=?", [
                      results.insertId,
                    ]);
                    counter++;
                    loop();
                  }
                );
              } else {
                res.status(200).send("Building created");
                counter = 0;
              }
            };
            loop();
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
