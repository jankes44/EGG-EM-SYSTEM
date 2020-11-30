const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const con = require("../database/db2");
const csv = require("fast-csv");
const fs = require('fs');
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
        console.log(1, filePath)
        let rows = []
        fs.createReadStream(filePath)
        .pipe(csv.parse({ headers: true })) 
        .on("data", data => {
            console.log(data)
            rows.push(data)
        })
        .on("end", () => {
            //fs.unlinkSync(filePath)
            const result = {file: filePath, columns: Object.keys(rows[0])}
            resolve(result)
        })
        .on("error", err => reject(err.field))
    }) 
}

module.exports = router