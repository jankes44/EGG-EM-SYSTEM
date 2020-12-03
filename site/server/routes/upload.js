const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const con = require("../database/db2");
const csv = require("fast-csv");
const fs = require('fs');
const multer = require('multer');
const Promise = require("bluebird");

const upload = multer({ dest: 'tmp/csv/' });

const createLevel = 'INSERT INTO levels (buildings_id) VALUES ?' 
const insertLights = 'INSERT INTO lights (node_id, device_id, type, levels_id) VALUES ?'

router.post("/building", (req, res) => {
    // if level_id is not present create a new one 
    const data = req.body

    let needNewLevel = false
    data.forEach(el => {
        if (el.levels_id === "") needNewLevel = true
    })

    if (needNewLevel){
        createNewLevel(buildingId)
        .then(levelId => {
            const data_ = data
            .map(r => r.levels_id == "" ? levelId : r.levels_id)
            .map(r => [r.node_id, r.device_id, r.type, r.levels_id])
            
            return con.query(insertLights, [data_])
        })
        .then(() => res.sendStatus(200))
        .catch(err => res.status(400).send(err))
    }
})

const createNewLevel = async (buildingId, needNewLevel) => {
    return promise = new Promise((resolve, reject) => {
        if (needNewLevel) {
        con.query(createLevel, buildingId)
        .then(res => {
            resolve(res.insertId)
        })
        .catch(err => reject(err))
    }
    else {
        resolve(null)
    }
    })
}

module.exports = router