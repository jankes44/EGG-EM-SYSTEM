const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken");
const con = require("../../database/db2");

router.post("/insert", auth, (req, res, next) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      const data_ = req.body;
      const data = data_.map((el) => Object.values(el));
      const sql =
        "INSERT INTO power_data (line, epoch, power, current ,voltage) VALUES ?";
      con.query(sql, [data], (err) => {
        if (err) {
          res.json({ status: "Error", data: err.stack });
        } else {
          res.json({ status: "ok" });
        }
      });
    }
  });
});

router.get("/lines", auth, (req, res, next) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      con.query(
        "select distinct line from power_data order by line",
        (err, result, fields) => {
          if (err) {
            res.json({ status: "Error", data: err.stack });
          } else {
            res.json({ status: "ok", data: result });
          }
        }
      );
    }
  });
});

router.get("/voltage", auth, (req, res, next) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      con.query(
        "select distinct epoch, voltage from power_data order by epoch",
        (err, result, fields) => {
          if (err) {
            res.json({ status: "Error", data: err.stack });
          } else {
            res.json({ status: "ok", data: result });
          }
        }
      );
    }
  });
});

router.get("/power", auth, (req, res, next) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      con.query(
        "select epoch, group_concat(power order by line) as 'values' from power_data group by epoch having count(*) > 1  order by epoch ",
        (err, result, fields) => {
          if (err) {
            res.json({ status: "Error", data: err.stack });
          } else {
            res.json({ status: "ok", data: result });
          }
        }
      );
    }
  });
});

router.get("/current", auth, (req, res, next) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      con.query(
        "select epoch, group_concat(current order by line) as 'values' from power_data group by epoch having count(*) > 1  order by epoch",
        (err, result, fields) => {
          if (err) {
            res.json({ status: "Error", data: err.stack });
          } else {
            res.json({ status: "ok", data: result });
          }
        }
      );
    }
  });
});

module.exports = router;
