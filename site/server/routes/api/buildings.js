const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken");
const con = require("../../database/db2");
const { values } = require("lodash");

const selectBuildings = "SELECT * FROM buildings"
const selectSite = `SELECT s.id as sites_id, b.building, b.id as buildings_id,
                    b.address, l.id AS levels_id, l.level, 
                    sum(case when lg.is_assigned = 1 then 1 else 0 end) as devices
                    FROM sites s 
                    LEFT JOIN buildings b on s.id = b.sites_id 
                    LEFT JOIN levels l on l.buildings_id = b.id 
                    LEFT JOIN lights lg on lg.levels_id = l.id 
                    WHERE s.id = ?
                    GROUP BY b.id, l.id`

const selectSiteJoinLevels = `SELECT s.id as sites_id, b.id as buildings_id, b.building, b.address,
                              group_concat(DISTINCT l.level SEPARATOR ', ') as levels,
                              sum(case when lg.is_assigned = 1 then 1 else 0 end) as devices
                              FROM sites s 
                              LEFT JOIN buildings b on s.id = b.sites_id 
                              LEFT JOIN levels l on l.buildings_id = b.id 
                              LEFT JOIN lights lg on lg.levels_id = l.id 
                              WHERE s.id = 1
                              GROUP BY b.id`

const insertNewBuilding = "INSERT INTO buildings SET building = ?, sites_id = ?"
const insertNewLevels = "INSERT INTO levels (level, building_id) VALUES ?"
const insertNewEmptyBuilding = "INSERT INTO buildings SET building = ?, address = ?, sites_id = ?"
const insertOneLevel = "INSERT INTO levels SET level = '1', buildings_id = ?"
const insertLevelInLghts = "INSERT INTO lights SET levels_id=?"
const updateBuilding = "UPDATE buildings SET building=?, address=? where id=?"
const deleteBuilding = "DELETE FROM buildings WHERE id=?"

//gets all groups
router.get("/", auth, (req, res) => {
  con.query(selectBuildings, (err, rows) => {
    if (err) throw err 
    res.json(rows)
  })
})

//get group by param: id
router.get("/:sites_id", auth, (req, res) => {
  con.query(selectSite, req.params.sites_id, (err, rows) => {
    if (err) throw err 
    res.json(rows)
  })
})

//get group by param: id
router.get("/joinlevels/:sites_id", auth, (req, res) => {
  con.query(selectSiteJoinLevels, req.params.sites_id, (err, rows) => {
    if (err) throw err 
    res.json(rows)
  })
})

// Create new building and floors
router.post("/new", auth, function (req, res) {
  con.query(insertNewBuilding, [req.body.name, req.body.sites_id], (err, result) => {
    if (err) throw err 
    const length = req.body.levels_count;
    const newBuildingId = result.insertId
    console.log(newBuildingId, "New building");

    values = []
    for (let i = 1; i <= length; i++) {
      values.push([i, newBuildingId])
    }
    
    con.query(insertNewLevels, [values], (err) => {
      if (err) throw err 
      res.status(200).send("Building created")
    })
  })
})

router.post("/new-empty", auth, function (req, res) {
  const params = [req.body.building, req.body.address, req.body.sites_id]
  con.query(insertNewEmptyBuilding, params, (err, resultBuilding) => {
    if (err) throw err 

    con.query(insertOneLevel, resultBuilding.insertId, (err, resultLevel) => {
      if (err) throw err 
      con.query(insertLevelInLghts, resultLevel.insertId, (err, result) => {
        if (err) throw err 
        res.json(result)
      })
    })
  })
})

// Update chosen building
router.post("/:id", auth, function (req, res) {
  const params = [req.body.building, req.body.address, req.params.id]
  con.query(updateBuilding, params, (err, result) => {
    if (err) throw err 
    res.json(result)
  })
})

// Delete chosen building
router.delete("/:id", auth, function (req, res) {
  con.query(deleteBuilding, [req.params.id], (err, result) => {
    if (err) throw err 
    res.send("Record deleted succesfully")
  })
})

module.exports = router;