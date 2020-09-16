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
