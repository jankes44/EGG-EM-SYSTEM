const express = require("express");
const router = express.Router();
var moment = require("moment");
const uuid = require("uuid");
const mysql = require("mysql");
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken");
const con = require("../../database/db2");

const getAccessRoles = "SELECT * FROM roles WHERE access <= ?"
const getUserFromSameSite = `SELECT u.*, GROUP_CONCAT(s.id) as sites, GROUP_CONCAT(s.name) as site_names, 
                            r.name as role_name, r.access
                            FROM users u 
                            LEFT JOIN users_has_sites uhs ON uhs.users_id = u.id
                            LEFT JOIN sites s on uhs.sites_id = s.id 
                            LEFT JOIN roles r on r.id = u.roles_id 
                            WHERE s.id in (
                              SELECT uhs2.sites_id 	
                              FROM users_has_sites uhs2
                              WHERE uhs2.users_id = 4
                            )
                            group by u.id`
const deleteUser = "DELETE FROM users WHERE id = ?"
const updateUser = "UPDATE users SET ?? = ? WHERE id = ?"

//gets all groups
router.get("/:access", auth, (req, res) => {
  con.query(getAccessRoles, req.params.access, (err, rows) => {
    if (err) throw err 
    res.json(rows)
  })
})

router.get("/users/:uid", auth, (req, res) => {
  con.query(getUserFromSameSite, req.params.uid, (err, rows) => {
    if (err) throw err 
    res.json(rows)
  })
})

router.delete("/users/delete/:id", auth, (req, res) => {
  con.query(deleteUser, req.params.uid, (err) => {
    if (err) throw err 
    res.sendStatus(200)
  })
})

router.post("/edit/:id", auth, (req, res) => {
  const params = [req.body.column, req.body.value, req.params.id]
  con.query(updateUser, params, (err) => {
    if (err) throw err 
    res.sendStatus(200)
  })
})

module.exports = router;
