const express = require("express");
const router = express.Router();
var moment = require("moment");
const uuid = require("uuid");
const mysql = require("mysql");
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken");
const con = require("../../database/db2");
const path = require("path");
var multer = require("multer");
var fs = require("fs");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/img");
  },
  filename: function (req, file, cb) {
    cb(null, `floorplan${req.body.level}.jpg`);
  },
});

var upload = multer({ storage: storage }).single("file");

//gets all groups
router.get("/", auth, (req, res) =>
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      con.query(
        `select
        levels.*,
          count(lights.id) as lights_count, 
          GROUP_CONCAT(DISTINCT lights.device_id, '-', lights.type SEPARATOR ', ') as devices
      from
        levels
          LEFT OUTER JOIN
          lights on lights.levels_id = levels.id
      GROUP BY levels.id`,
        (err, rows) => res.json(rows)
      );
    }
  })
),
  router.get("/site/:sites_id", auth, (req, res) =>
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          `select
      levels.*,
        count(lights.id) as lights_count, 
        GROUP_CONCAT(DISTINCT lights.device_id, '-', lights.type SEPARATOR ', ') as devices
    from
      levels
  LEFT OUTER JOIN
  buildings ON buildings.id = levels.buildings_id
        LEFT OUTER JOIN
        sites ON sites.id = buildings.sites_id
        LEFT OUTER JOIN
        lights on lights.levels_id = levels.id
      WHERE sites.id = ${req.params.sites_id}
    GROUP BY levels.id`,
          (err, rows) => res.json(rows)
        );
      }
    })
  ),
  //get group by param: id
  router.get("/building/:building_id", auth, (req, res) =>
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          `select
          levels.*,
            count(lights.id) as lights_count, 
            GROUP_CONCAT(DISTINCT lights.device_id, '-', lights.type SEPARATOR ', ') as devices
        from
          levels
      LEFT OUTER JOIN
      buildings ON buildings.id = levels.buildings_id
            LEFT OUTER JOIN
            sites ON sites.id = buildings.sites_id
            LEFT OUTER JOIN
            lights on lights.levels_id = levels.id
          WHERE buildings.id = ${req.params.building_id}
        GROUP BY levels.id`,
          [req.params.building_id],
          (err, rows) => res.json(rows)
        );
      }
    })
  ),
  // Create new level
  router.post("/add", auth, function (req, res) {
    jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        con.query(
          "INSERT INTO levels SET `buildings_id`=?, `level`=?, `description`=?",
          [req.body.buildings_id, req.body.level, req.body.description],
          (error, results, fields) => {
            if (error) throw error;
            con.query(
              "INSERT INTO lights SET levels_id=?",
              [results.insertId],
              (err, resultsdevices) => {
                console.log(resultsdevices);
                res.end(JSON.stringify(resultsdevices));
              }
            );
          }
        );
      }
    });
  });

// Update chosen level
router.post("/edit/:id", auth, function (req, res) {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      con.query(
        "UPDATE `levels` SET `level`=?, `description`=? where `id`=(?)",
        [req.body.level_name, req.body.description, req.params.id],
        function (error, results, fields) {
          if (error) throw error;
          res.end(JSON.stringify(results));
        }
      );
    }
  });
});

// Get floorplan by level id
router.get("/floorplan/:id", auth, function (req, res) {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      if (
        fs.existsSync(
          path.join(
            __dirname,
            "../../public/img",
            `floorplan${req.params.id}.jpg`
          )
        )
      ) {
        res.sendFile(
          path.join(
            __dirname,
            "../../public/img",
            `floorplan${req.params.id}.jpg`
          )
        );
      } else {
        res.status(404).send("File doesn't exist");
      }
    }
  });
});

//upload floorplan and assign id to it
router.post("/floorplan/upload/:id", auth, function (req, res) {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
    }
  });
});

router.post("/testUpload", function (req, res) {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    upload(req, res, function (err) {
      console.log(req.body);
      if (err instanceof multer.MulterError) {
        console.log(err);
        return res.status(500).json(err);
      } else if (err) {
        console.log(err);
        return res.status(500).json(err);
      }
      return res.sendFile(
        path.join(
          __dirname,
          "../../public/img",
          `floorplan${req.body.level}.jpg`
        )
      );
    });
  });
});

// Delete chosen level
router.delete("/:id", auth, function (req, res) {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      con.query("DELETE FROM `levels` WHERE `id`=?", [req.params.id], function (
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
