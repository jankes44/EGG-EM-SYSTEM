const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const con = require("../database/db_promise");
const csv = require("fast-csv");
const fs = require("fs");
const multer = require("multer");
const Promise = require("bluebird");

const upload = multer({dest: "tmp/csv/"});

const getLevels = "SELECT * FROM `levels` WHERE `buildings_id`=?";
const getLevelLike =
  "SELECT id, level FROM `levels` WHERE `buildings_id`=? AND `level` LIKE ?";
const createLevel = "INSERT INTO `levels` (level, buildings_id) VALUES (?,?)";
const insertLights =
  "INSERT INTO `lights` (node_id, device_id, type, levels_id) VALUES ?";

router.post("/building", (req, res) => {
  // if level_id is not present create a new one
  const {data, buildingId} = req.body;

  let needNewLevel = false;
  data.forEach((el) => {
    if (
      el.level_name === "" ||
      el.level_name == null ||
      el.level_name == undefined
    )
      needNewLevel = true;
  });

  con
    .query(getLevels, buildingId)
    .spread((rows) => {
      console.log(rows);
      let mapping = Object.fromEntries(rows.map((r) => [r.level, r.id]));
      const levelsFromDB = new Set(Object.keys(mapping));
      console.log("levels from db", levelsFromDB);
      const newLevels = Array.from(
        new Set(
          data
            .filter(
              (csvRow) =>
                !levelsFromDB.has(csvRow.level_name) && csvRow.level_name
            )
            .map((r) => r.level_name)
        )
      ); // Need distinct
      if (needNewLevel && !levelsFromDB.has("No name"))
        newLevels.push("No name");
      console.log("new levels", newLevels);
      Promise.map(newLevels, (l) =>
        con.query(createLevel, [l, buildingId], {concurrency: 1})
      )
        .then((createdLevels) => {
          console.log("created", createdLevels);
          for (let index = 0; index < newLevels.length; index++) {
            const level_name = newLevels[index];
            const level_id = createdLevels[index][0].insertId;
            mapping[level_name] = level_id;
          }
          console.log(mapping);
          const data_ = data
            .map((r) => {
              r.levels_id = getMapping(r.level_name, mapping);
              return r;
            })
            .filter((r) => {
              return hasAllProperties(r, [
                "levels_id",
                "node_id",
                "device_id",
                "type",
              ]);
            })
            .map((r) => [r.node_id, r.device_id, r.type, r.levels_id]);

          return con.query(insertLights, [data_]);
        })
        .then(() => res.sendStatus(200))
        .catch((err) => console.log(err)); //TODO
    })
    .catch((err) => res.status(400).send(err));
});

const hasAllProperties = (obj, props) => {
  for (var i = 0; i < props.length; i++) {
    if (!obj.hasOwnProperty(props[i])) return false;
  }
  return true;
};

const getMapping = (level_name, mapping) => {
  if (level_name && mapping.hasOwnProperty(level_name))
    return mapping[level_name];
  else return mapping["No name"];
};

module.exports = router;
