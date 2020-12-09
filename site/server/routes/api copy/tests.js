const express = require("express");
const router = express.Router();
const con = require("../../database/db2");
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken");

//gets all tests
router.get("/", auth, (req, res) =>
  jwt.verify(req.token, process.env.SECRET_KEY, (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      con.query(
        "SELECT tests.*, COUNT(errors.tests_id) AS errors, lgt_groups.group_name AS group_name FROM tests LEFT OUTER JOIN errors ON errors.tests_id = tests.id LEFT OUTER JOIN lgt_groups ON lgt_groups.id = tests.group_id GROUP BY tests.id , errors.tests_id",
        (err, rows) => res.json(rows)
      );
    }
  })
),
  //get report data by param: id
  router.get("/reportdata/:id", auth, (req, res) =>
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          "SELECT tests.*, a.error, a.device, lgt_groups.group_name AS location FROM tests JOIN errors AS a ON FIND_IN_SET(a.tests_id, tests.id) LEFT OUTER JOIN lgt_groups ON lgt_groups.id = tests.group_id where tests.id=?",
          [req.params.id],
          (err, rows) => {
            res.setHeader(
              "Content-Type",
              "application/json",
              "Access-Control-Allow-Headers",
              "Origin, X-Requested-With, Content-Type, Accept"
            );
            return res.send(rows[0]);
          }
        );
      }
    })
  ),
  //get test by param: id
  router.get("/:id", auth, (req, res) =>
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          "SELECT tests.*, COUNT(errors.tests_id) AS errors, errors.error, errors.device, lgt_groups.group_name AS location FROM tests LEFT OUTER JOIN errors ON errors.tests_id = tests.id LEFT OUTER JOIN lgt_groups ON lgt_groups.id = tests.group_id WHERE tests.id= ? GROUP BY tests.id , errors.tests_id",
          [req.params.id],
          (err, rows) => {
            res.setHeader(
              "Content-Type",
              "application/json",
              "Access-Control-Allow-Headers",
              "Origin, X-Requested-With, Content-Type, Accept"
            );
            return res.send(rows[0]);
          }
        );
      }
    })
  ),
  //get test by param: groups_id
  router.get("/group/:id", auth, (req, res) =>
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          "SELECT id, lgt_groups_id, lights, result, warning, failed, light_id, info FROM tests WHERE id = ?",
          [req.params.id],
          (err, rows) => res.send([body])
        );
      }
    })
  ),
  // Create new test
  router.post("/", auth, function (req, res) {
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        var postData = [
          req.body.light_id,
          req.body.group_id,
          req.body.lights,
          req.body.result,
          req.body.warning,
          req.body.failed,
          req.body.info,
        ];
        con.query(
          "INSERT INTO tests SET `light_id`=?,`group_id`=?,`lights`=?,`result`=?,`warning`=?,`failed`=?,`info`=?",
          postData,
          function (error, results, fields) {
            if (error) throw error;
            res.end(JSON.stringify(results));
          }
        );
      }
    });
  });

// Update chosen test
router.put("/:id", auth, function (req, res) {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      con.query(
        "UPDATE `tests` SET `groups_id`=?,`name`=?,`location`=?, `description`=? where `id`=?",
        [
          req.body.groups_id,
          req.body.name,
          req.body.location,
          req.body.description,
          req.params.id,
        ],
        function (error, results, fields) {
          if (error) throw error;
          res.end(JSON.stringify(results));
        }
      );
    }
  });
});

// Delete chosen test
router.delete("/:id", auth, function (req, res) {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      console.log(req.body);
      con.query("DELETE FROM `tests` WHERE `id`=?", [req.params.id], function (
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
