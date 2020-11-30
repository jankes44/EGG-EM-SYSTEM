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

const getLightsInLevels = `select l.*, count(lg.id) as lights_count, 
                          GROUP_CONCAT(DISTINCT lg.device_id, '-', lg.type SEPARATOR ', ') as devices
                          from levels l
                          LEFT OUTER JOIN lights lg on lg.levels_id = l.id
                          GROUP BY l.id`;

const getLightsInLevelsBySite = `select l.*, count(lg.id) as lights_count, 
                          GROUP_CONCAT(DISTINCT lg.device_id, '-', lg.type SEPARATOR ', ') as devices
                          from levels l
                          LEFT OUTER JOIN buildings b ON b.id = l.buildings_id
                          LEFT OUTER JOIN sites s ON s.id = b.sites_id
                          LEFT OUTER JOIN lights lg on lg.levels_id = l.id
                          WHERE s.id = ?
                          GROUP BY l.id`;

const getLightsInLevelsByBuilding = `select l.*, count(lg.id) as lights_count, 
                            GROUP_CONCAT(DISTINCT lg.device_id, '-', lg.type SEPARATOR ', ') as devices
                            from levels l
                            LEFT OUTER JOIN buildings b ON b.id = l.buildings_id
                            LEFT OUTER JOIN lights lg on lg.levels_id = l.id
                            WHERE b.id = ?
                            GROUP BY l.id`;

const createLevel =
  "INSERT INTO levels (buildings_id, level, description) VALUES (?, ?, ?)";
const updateLevel = "UPDATE levels SET level=?, description=? where id=?";
const deleteLevel = "DELETE FROM levels WHERE id=?";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/img"),
  filename: (req, file, cb) => cb(null, `floorplan${req.body.level}.jpg`),
});
const upload = multer({ storage: storage }).single("file");
const floorplansDir = path.join(__dirname, "../../public/img");

router.get("/", auth, (req, res) => {
  con.query(getLightsInLevels, (err, rows) => {
    if (err) res.sendStatus(400);
    res.json(rows);
  });
});

router.get("/site/:sites_id", auth, (req, res) => {
  con.query(getLightsInLevelsBySite, req.params, sites_id, (err, rows) => {
    if (err) res.sendStatus(400);
    res.json(rows);
  });
});

router.get("/building/:building_id", auth, (req, res) => {
  con.query(
    getLightsInLevelsByBuilding,
    req.params.building_id,
    (err, rows) => {
      if (err) res.sendStatus(400);
      res.json(rows);
    }
  );
});

// Create new level
router.post("/add", auth, (req, res) => {
  const params = [req.body.buildings_id, req.body.level, req.body.description];
  con.query(createLevel, params, (err) => {
    if (err) res.sendStatus(400);
    res.sendStatus(200);
  });
});

// Update chosen level
router.post("/edit/:id", auth, function (req, res) {
  const params = [req.body.level_name, req.body.description, req.params.id];
  con.query(updateLevel, params, (err, result) => {
    if (err) res.sendStatus(400);
    res.json(result);
  });
});

// Get floorplan by level id
router.get("/floorplan/:id", auth, function (req, res) {
  const floorplan = path.join(floorplansDir, `floorplan${req.params.id}.jpg`);
  if (fs.existsSync(floorplan)) {
    res.sendFile(floorplan);
  } else {
    res.sendStatus(404);
  }
});

//upload floorplan and assign id to it
router.post("/floorplan/upload", auth, (req, res) => {
  const floorplan = path.join(floorplansDir, `floorplan${req.body.level}.jpg`);
  upload(req, res, (err) => {
    console.log(req.body.file);
    if (err instanceof multer.MulterError) {
      console.log(err);
      return res.status(500).json(err);
    } else if (err) {
      console.log(err);
      return res.status(500).json(err);
    }
    return res.sendFile(floorplan);
  });
});

// Delete chosen level
router.delete("/:id", auth, function (req, res) {
  con.query(deleteLevel, [req.params.id], (err) => {
    if (err) res.sendStatus(400);
    res.sendStatus(200);
  });
});

module.exports = router;
