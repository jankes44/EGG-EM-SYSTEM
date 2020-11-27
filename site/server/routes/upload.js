const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const con = require("../database/db2");
const csv = require("fast-csv");
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const Promise = require("bluebird");

const upload = multer({ dest: 'tmp/csv/' });

router.post("/csv", upload.single("file"), (req, res) => {
    const filePath = req.file.path
    uploadCSV(filePath)
    .then(() => res.sendStatus(200))
    .catch(err => res.status(400).send(err))
})

const uploadCSV = async (filePath) => {
    return new Promise((resolve, reject) => {
        let rows = []
        csv.fromPath(filePath)
        .on("data", data => rows.push(data))
        .on("end", () => {
            fs.unlinkSync(filePath)
            resolve(rows)
        })
        .on("error", err => reject(err))
    }) 
}

module.exports = router