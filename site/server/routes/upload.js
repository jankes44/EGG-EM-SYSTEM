const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const con = require("../database/db_promise");
const csv = require("fast-csv");
const fs = require("fs");
const multer = require("multer");
const Promise = require("bluebird");

const upload = multer({dest: "tmp/csv/"});

// const getLevel = "SELECT * FROM `levels` WHERE `buildings_id`=? AND `level`=?";
const getLevelLike =
  "SELECT id, level FROM `levels` WHERE `buildings_id`=? AND `level` LIKE ?";
const createLevel = "INSERT INTO `levels` (buildings_id) VALUES (?)";
const insertLights =
  "INSERT INTO `lights` (node_id, device_id, type, levels_id) VALUES ?";

router.post("/building", (req, res) => {
  // if level_id is not present create a new one
  const {data, buildingId} = req.body;

  let needNewLevel = false;
  let levels = new Set();
  data.forEach((element) => {
    levels.add(element.level_name);
  });

  const levelsArray = Array.from(levels);

  data.forEach((el) => {
    if (
      el.level_name === "" ||
      el.level_name == null ||
      el.level_name == undefined
    )
      needNewLevel = true;
  });

  getLevelsToInsert(levelsArray, needNewLevel, buildingId)
    .then((mapping) => {
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
    .catch((err) => res.status(400).send(err));
});

const getLevelsToInsert = async (levels, newLevel, buildingId) => {
  return new Promise((resolve, reject) => {
    let levelsMapping = {};

    createNewLevel(buildingId, newLevel).then((levelId) =>
      mapLevels(levelId, buildingId, levelsMapping, levels)
        .then((rows) => {
          rows
            .map((r) => r[0])
            .forEach((r1) => {
              if (r1.length > 0) {
                const r2 = r1[0];
                levelsMapping[r2.level] = r2.id;
              }
            });
          console.log(levelsMapping);
          resolve(levelsMapping);
        })
        .catch((err) => console.log(err))
    );
  });
};

const mapLevels = async (levelId, buildingId, levelsMapping, levels) => {
  if (levelId) levelsMapping[""] = levelId;
  return Promise.map(levels, (l) =>
    con.query(getLevelLike, [buildingId, `%${l}%`], {concurrency: 1})
  );
};

function hasAllProperties(obj, props) {
  for (var i = 0; i < props.length; i++) {
    if (!obj.hasOwnProperty(props[i])) return false;
  }
  return true;
}

const createNewLevel = async (buildingId, needNewLevel) => {
  return new Promise((resolve, reject) => {
    if (needNewLevel) {
      con
        .query(createLevel, parseInt(buildingId))
        .spread((res) => {
          resolve(res.insertId);
        })
        .catch((err) => reject(err));
    } else {
      resolve(null);
    }
  });
};

const getMapping = (level_name, mapping) => {
  if (level_name && mapping.hasOwnProperty(level_name))
    return mapping[level_name];
  else return mapping[""];
};

module.exports = router;
