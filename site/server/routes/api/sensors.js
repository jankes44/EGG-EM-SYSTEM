const express = require("express");
const router = express.Router();
var moment = require("moment");
const uuid = require("uuid");
const mysql = require("mysql");
const cors = require("cors");
const con = require("../../database/db2");
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken");
const { add } = require("lodash");

const getSensorsByLevel = `SELECT s.id, s.parent_id, s.node_id, s.levels_id, s.is_assigned as sensor_is_assigned, 
                        s.fp_coordinates_left, s.fp_coordinates_bot, s.type as sensor_type, 
                        lg.device_id, lg.type, lg.status, lg.levels_id, lg.node_id as light_node_id,
                        Bm.battery, Bm.ldr
                        FROM sensors s
                        LEFT JOIN lights lg ON lg.id = s.parent_id
                        LEFT JOIN ( SELECT MAX(id), battery, ldr, sensor_node_id
                                    FROM device_battery_ldr
                                    GROUP BY id ) AS Bm
                        ON Bm.sensor_node_id = s.node_id
                        WHERE s.levels_id = ? AND s.is_assigned = 1
                        GROUP BY s.id, lg.id`

const getUnassignedSensors = `SELECT s.id, s.type as sensor_type, s.parent_id, s.node_id, s.levels_id, s.is_assigned as sensor_is_assigned, 
                            s.fp_coordinates_left, s.fp_coordinates_bot,
                            lg.device_id, lg.type, lg.status, lg.levels_id, lg.node_id as light_node_id     
                            FROM sensors s  
                            LEFT JOIN lights lg ON lg.id = s.parent_id
                            LEFT JOIN levels l ON l.id = s.levels_id 
                            LEFT JOIN buildings b ON b.id = l.buildings_id 
                            LEFT JOIN sites st ON st.id = b.sites_id 
                            LEFT JOIN users_has_sites uhs ON uhs.sites_id = st.id 
                            LEFT JOIN users u ON u.id = uhs.users_id 
                            WHERE u.id = ? AND s.is_assigned = 0 `

const insertSensor =  "INSERT INTO sensors SET ?"
const updateSensor = "UPDATE sensors SET ? WHERE id=?"
const updateSensorPosition = `UPDATE sensors SET fp_coordinates_left = ?, fp_coordinates_bot = ?
                            WHERE id = ?`
const assignSensor = "UPDATE sensors SET levels_id = ?, is_assigned=1 WHERE id=?"
const deleteSensor = "DELETE FROM sensors WHERE id = ?"

router.get("/level/:level_id", auth, (req, res) => {
    con.query(getSensorsByLevel, req.params.level_id, (err, rows) => {
        if (err) res.sendStatus(400) 
        res.json(rows)
    })
})

router.get("/unassigned/:uid", auth, (req, res) => {
    con.query(getUnassignedSensors, req.params.uid, (err, rows) => {
        if (err) res.sendStatus(400) 
        res.json(rows)
    })
})

router.post("/add", auth, (req, res) => {
    const params = {
          type: req.body.type,
          parent_id: req.body.parent_id,
          node_id: req.body.node_id,
          levels_id: req.body.levels_id,
        }
    con.query(insertSensor, [params], (err) => {
        if (err) res.sendStatus(400) 
        res.sendStatus(200)
    })
})

router.post("/edit/:id", auth, function (req, res) {
    const params = [
        {
          type: req.body.type,
          parent_id: req.body.parent_id,
          node_id: req.body.node_id,
        },
        req.params.id,
      ]
    con.query(updateSensor, params, (err) => {
        if (err) res.sendStatus(400) 
        res.sendStatus(200)
    })
})

router.post("/edit-position", auth, (req, res) => {
    const params = [el.fp_coordinates_left, el.fp_coordinates_bot, el.id]
    con.query(updateSensorPosition, params, (err) => {
        if (err) res.sendStatus(400) 
        res.sendStatus(200)
    })
})

router.post("/assign/:id", auth, (req, res) => {
    const params = [req.body.levels_id, req.params.id]
    con.query(assignSensor, params, (err) => {
        if (err) res.sendStatus(400) 
        res.sendStatus(200)
    })
})

router.delete("/:id", auth, (req, res) => {
    con.query(deleteSensor, req.params.id, (err) => {
        if (err) res.sendStatus(400);
        res.sendStatus(200);
    })
})

module.exports = router;