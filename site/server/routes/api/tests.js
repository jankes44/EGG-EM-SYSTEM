const express = require("express");
const router = express.Router();
const con = require("../../database/db2");
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken");

const getLightResponsesForCsv = `SELECT GROUP_CONCAT(lg.device_id, ' - ', lg.type) AS device,
                                    CONCAT("\'", lg.node_id, "\'" ) AS 'BTMesh_Address',
                                    tthl.result, l.level, b.building, s.name
                                    FROM trial_tests_has_lights tthl
                                    LEFT JOIN lights lg ON lg.id = tthl.lights_id
                                    LEFT JOIN levels l ON l.id = lg.levels_id
                                    LEFT JOIN buildings b ON b.id = l.buildings_id
                                    LEFT JOIN sites s ON s.id = b.sites_id 
                                    WHERE trial_tests_id = ?
                                    GROUP BY trial_tests_id , tthl.lights_id`

const getLightResponses = `SELECT tthl.*, lg.id, lg.node_id, lg.device_id, lg.type, l.level, b.building as building
                          FROM trial_tests_has_lights tthl
                          LEFT JOIN lights lg ON lg.id = tthl.lights_id
                          LEFT JOIN levels l ON l.id = lg.levels_id 
                          LEFT JOIN buildings b ON b.id = l.buildings_id
                          GROUP BY tthl.trial_tests_id, tthl.lights_id `

const getLightResponsesByTrialId = `SELECT tthl.*, lg.id, lg.node_id, lg.device_id, lg.type, l.level, b.building as building
                                  FROM trial_tests_has_lights tthl
                                  LEFT JOIN lights lg ON lg.id = tthl.lights_id
                                  LEFT JOIN levels l ON l.id = lg.levels_id 
                                  LEFT JOIN buildings b ON b.id = l.buildings_id
                                  WHERE tthl.trial_tests_id = ?
                                  GROUP BY tthl.trial_tests_id, tthl.lights_id`

const getLightResponsesByUserId = `SELECT tt.id, tt.lights, tt.result, tt.type, tt.set, tt.created_at, s.name as site, u.id as users_id,
                                  FLOOR(SUM(tthl.result LIKE '%OK%')) AS responseok,
                                  FLOOR(SUM(tthl.result NOT LIKE '%OK%')) AS errors,
                                  GROUP_CONCAT(DISTINCT l.level SEPARATOR ', ') AS level,
                                  GROUP_CONCAT(DISTINCT b.building SEPARATOR ', ') AS building
                                  FROM trial_tests tt
                                  LEFT JOIN trial_tests_has_lights tthl ON tthl.trial_tests_id = tt.id
                                  LEFT JOIN lights lg ON lg.id = tthl.lights_id
                                  LEFT JOIN errors e ON e.test_id = tt.id
                                  LEFT JOIN levels l ON l.id = lg.levels_id
                                  LEFT JOIN buildings b ON b.id = l.buildings_id
                                  LEFT JOIN sites s ON s.id = b.sites_id
                                  LEFT JOIN users_has_sites uhs ON uhs.sites_id = s.id
                                  LEFT JOIN users u ON u.id = uhs.users_id
                                  WHERE u.id = 4
                                  GROUP BY tt.id
                                  ORDER BY tt.id DESC
                                  LIMIT ?`

const resultLimit = 1000000000

//get devices responses for csv report
router.get("/lightsresponses/csv/:id", auth, (req, res) => {
  con.query(getLightResponsesForCsv, [req.params.id], (err, rows) => {
    if (err) res.sendStatus(400)
    res.json(rows)
  })
})

//get devices responses
router.get("/lightsresponses/", auth, (req, res) => {
  con.query(getLightResponses, (err, rows) => {
    if (err) res.sendStatus(400)
    res.json(rows)
  })
})

//get devices responses
router.get("/lightsresponses/:id", auth, (req, res) => {
  con.query(getLightResponsesByTrialId, req.params.id, (err, rows) => {
    if (err) res.sendStatus(400)
    res.json(rows)
  })
})

router.get("/usr/:id", auth, (req, res) => {
  const params = [req.params.id, resultLimit]
  con.query(getLightResponsesByUserId, params, (err, rows) => {
    if (err) res.sendStatus(400)
    res.json(rows)
  })
})

router.get("/usr/:id/:limit", auth, (req, res) => {
const params = [req.params.id, req.params.limit]
  con.query(getLightResponsesByUserId, params, (err, rows) => {
    if (err) res.sendStatus(400)
    res.json(rows)
  })
})

module.exports = router
