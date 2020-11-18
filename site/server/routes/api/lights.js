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

const getUserLights = `SELECT lg.*, l.id as levels_id, l.level, b.building, b.id as buildings_id,
                      s.mqtt_topic_out, s.mqtt_topic_in,s.id as sites_id,
                      s.name as sites_name
                      FROM lights lg
                      LEFT JOIN levels l ON l.id = lg.levels_id
                      LEFT JOIN buildings b ON b.id = l.buildings_id
                      LEFT JOIN sites s ON s.id = b.sites_id
                      LEFT JOIN users_has_sites uhs ON uhs.sites_id = s.id
                      LEFT JOIN users u ON u.id = uhs.users_id
                      WHERE u.id = ? AND lg.is_assigned = ?`

const getBuildingLights = `SELECT DISTINCT lg.id as lights_id, lg.node_id, lg.device_id, lg.type,
                          lg.status, l.id as levels_id, l.level, b.building, b.id as buildings_id,
                          s.mqtt_topic_out, s.mqtt_topic_in,s.id as sites_id,
                          s.name as sites_name
                          FROM lights lg
                          LEFT JOIN levels l ON l.id = lg.levels_id
                          LEFT JOIN buildings b ON b.id = l.buildings_id
                          LEFT JOIN sites s ON s.id = b.sites_id
                          LEFT JOIN users_has_sites uhs ON uhs.sites_id = s.id
                          LEFT JOIN users u ON u.id = uhs.users_id
                          WHERE b.id = ?`

const getLevelLights = `SELECT DISTINCT lg.*, l.id as levels_id, l.level, b.building, 
                        b.id as buildings_id, s.mqtt_topic_out, s.mqtt_topic_in, s.id as sites_id,
                        s.name as sites_name
                        FROM lights lg
                        LEFT JOIN levels l ON l.id = lg.levels_id
                        LEFT JOIN buildings b ON b.id = l.buildings_id
                        LEFT JOIN sites s ON s.id = b.sites_id
                        LEFT JOIN users_has_sites uhs ON uhs.sites_id = s.id
                        LEFT JOIN users u ON u.id = uhs.users_id
                        WHERE l.id = ? AND lg.is_assigned = 1`

const getLastLightId = "SELECT id as last_id FROM lights ORDER BY id DESC LIMIT 1"
const getLightByDeviceAndLevel = "SELECT id FROM lights WHERE device_id = ? AND levels_id = ?"
const insertLight = "INSERT INTO lights SET ?"
const createEmptyLights = "INSERT INTO lights (level_id) VALUES ?"
const updateLightPosition = `UPDATE lights SET fp_coordinates_left = ?, fp_coordinates_bot = ? WHERE id = ?`
const updateLight = `UPDATE lights SET ? WHERE id = ?`
const assignLight = "UPDATE lights SET levels_id = ?, is_assigned=1 WHERE id=?"
const moveLight = "UPDATE lights SET levels_id=? WHERE id=?"
const deleteLight = "DELETE FROM lights WHERE id = ?"


router.get("/:uid", auth, (req, res) => {
  con.query(getUserLights, [req.params.uid, 1], (err, rows) => {
    if (err) throw err
    res.json(rows)
  })
})


router.get("/unassigned/:uid", auth, (req, res) => {
  con.query(getUserLights, [req.params.uid, 0], (err, rows) => {
    if (err) throw err
    res.json(rows)
  })
})

router.get("/building/:buildings_id", auth, (req, res) => {
  con.query(getBuildingLights, req.params.buildings_id, (err, rows) => {
    if (err) throw err
    if (rows.length) {
      res.json(rows);
    } 
    else con.query(getLastLightId, (err, rows) => res.json(rows)) 
  })
})

router.get("/level/:level_id", auth, (req, res) => {
  con.query(getLevelLights, req.params.level_id, (err, rows) => {
    if (err) throw err
    res.json(rows)
  })
})

router.get("/device_id/:device_id/:levels_id", auth, (req, res) => {
  const params = [req.params.device_id, req.params.levels_id]
  con.query(getLightByDeviceAndLevel, params, (err, rows) => {
    if (err) throw err 
    res.json(rows)
  })
})

router.post("/add", auth, function (req, res) {
  const params = {
    device_id: req.body.device_id,
    node_id: req.body.node_id,
    type: req.body.type,
    levels_id: req.body.levels_id,
  }
  con.query(insertLight, [params], (err) => {
    if (err) throw err 
    res.sendStatus(200)
  })
})

router.post("/addempty/:amount", auth, function (req, res) {
  const amount = req.params.amount
  const levelId = req.body.level_id 
  let params = []
  for (let i = 0; i < amount; i++) {
    params.push([levelId])
  }
  con.query(createEmptyLights, [params], (err) => {
    if (err) throw err 
    res.sendStatus(200)
  })
})

router.post("/edit/postion", auth, function (req, res) {
  const paramsList = req.body.devices.map(el => [el.fp_coordinates_left, el.fp_coordinates_bot, el.id])
  
  for (let i = 0; i < devices.length; i++) {
    con.query(updateLightPosition, paramsList[i], (err) => {
      if (err) throw err 
      if (i === paramsList.length - 1){
        res.sendStatus(200)
      }
    })
  }
})

router.post("/edit/many", auth, (req, res) => {
  const paramsList = Object.keys(req.body.update_data)
    .map(i => req.body.update_data[i])
    .map(el => [
        {
          device_id: el.newData.device_id,
          type: el.newData.type,
          node_id: el.newData.node_id,
        },
        el.newData.id,
      ])

    for (let i = 0; i < paramsList.length; i++) {
      con.query(updateLight, paramsList[i], (err) => {
        if (err) throw err 
        if (i === paramsList.length - 1){
          res.sendStatus(200)
        }
      })    
    }
})

router.post("/edit/single/:id", auth, (req, res) => {
  const params = [
    {
      device_id: req.body.device_id,
      node_id: req.body.node_id,
      type: req.body.type,
      levels_id: req.body.levels_id,
    },
    req.params.id,
  ]
  con.query(updateLight, params, (err) => {
    if (err) throw err 
    res.sendStatus(200)
  })
})

router.post("/assign/:id", auth, (req, res) => {
  const params = [req.body.levels_id, req.params.id]
  con.query(assignLight, params, (err) => {
    if (err) throw err 
    res.sendStatus(200)
  })
})

router.post("/move/:id", auth, (req, res) => {
  const params = [req.body.levels_id, req.params.id]
  con.query(moveLight, params, (err) => {
    if (err) throw err 
    res.sendStatus(200)
  })
})

router.delete("/:id", auth, (req, res) => {
  con.query(deleteLight, req.params.id, (err) => {
    if (err) throw err 
    res.sendStatus(200)
  })
})

router.get("/lastid", auth, (req, res) => {
  con.query(getLastLightId, (err, rows) => {
    console.log(rows)
    res.json(rows[0])
  })
})

module.exports = router
