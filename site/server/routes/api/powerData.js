const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken");
const con = require("../../database/db2");
const url = require('url');

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

router.post("/voltage", auth, (req, res, next) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      const query_ = "select distinct epoch, voltage from power_data \
                      where epoch > UNIX_TIMESTAMP(DATE_ADD(now(), INTERVAL -3 HOUR)) * 1000 order by epoch "
      con.query(
        query_,
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

router.post("/power", auth, (req, res, next) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      if (req.body.hasOwnProperty('aggregate')){
        switch(req.body.aggregate){
          case 'avg_day_line': var query_ = "select line, if(DAYOFWEEK(date_) > 6 or DAYOFWEEK(date_) = 1, 'weekend', 'weekday') as day, sum(kwh) as power_consumption \
          from ( select 	DATE_FORMAT((FROM_UNIXTIME(epoch/1000)), '%Y-%m-%d-%h') as date_hour, \
                FROM_UNIXTIME(epoch/1000) as date_, line, \
                avg(if(power > 0, power, 0))/1000 as kwh \
            from power_data \
            where epoch < UNIX_TIMESTAMP(timestamp(current_date)) * 1000 \
            group by date_hour, line ) t \
            group by line, day"
          break
          case 'total_month_line':  query_ = "select line, sum(kwh) as power_consumption from "  +
                              "( select 	DATE_FORMAT((FROM_UNIXTIME(epoch/1000)), '%Y-%m-%d-%h') as date_hour, " +
                "FROM_UNIXTIME(epoch/1000) as date_, line, avg(if(power > 0, power, 0))/1000 as kwh from power_data " +
            "where epoch > UNIX_TIMESTAMP(DATE_ADD(now(), INTERVAL -1 MONTH)) * 1000 \
            group by date_hour, line ) t \
          group by line" 
          break
          case 'total_three_months_line': query_ = "select line, sum(kwh) as power_consumption from "  +
          "( select 	DATE_FORMAT((FROM_UNIXTIME(epoch/1000)), '%Y-%m-%d-%h') as date_hour, " +
          "FROM_UNIXTIME(epoch/1000) as date_, line, avg(if(power > 0, power, 0))/1000 as kwh from power_data " +
          "where epoch > UNIX_TIMESTAMP(DATE_ADD(now(), INTERVAL -3 MONTH)) * 1000 \
          group by date_hour, line ) t \
          group by line" 
          break 
          case 'total_year_line':  query_ = "select line, sum(kwh) as power_consumption from "  +
          "( select 	DATE_FORMAT((FROM_UNIXTIME(epoch/1000)), '%Y-%m-%d-%h') as date_hour, " +
          "FROM_UNIXTIME(epoch/1000) as date_, line, avg(if(power > 0, power, 0))/1000 as kwh from power_data " +
          "where epoch > UNIX_TIMESTAMP(DATE_ADD(now(), INTERVAL -1 YEAR)) * 1000 \
          group by date_hour, line ) t \
          group by line" 
          break
          case 'avg_day':  query_ = "select if(DAYOFWEEK(date_) > 6 or DAYOFWEEK(date_) = 1, 'weekend', 'weekday') as day, sum(kwh) as power_consumption \
          from ( select 	DATE_FORMAT((FROM_UNIXTIME(epoch/1000)), '%Y-%m-%d-%h') as date_hour, \
                FROM_UNIXTIME(epoch/1000) as date_, line, \
                avg(if(power > 0, power, 0))/1000 as kwh \
            from power_data \
            where epoch < UNIX_TIMESTAMP(timestamp(current_date)) * 1000 \
            group by date_hour, line ) t \
            group by day"
          break
          case 'total_month':  query_ = "select sum(kwh) as power_consumption from "  +
                              "( select 	DATE_FORMAT((FROM_UNIXTIME(epoch/1000)), '%Y-%m-%d-%h') as date_hour, " +
                "FROM_UNIXTIME(epoch/1000) as date_, line, avg(if(power > 0, power, 0))/1000 as kwh from power_data " +
            "where epoch > UNIX_TIMESTAMP(DATE_ADD(now(), INTERVAL -1 MONTH)) * 1000 \
            group by date_hour, line ) t" 
          break
          case 'total_three_months':  query_ = "select sum(kwh) as power_consumption from "  +
          "( select 	DATE_FORMAT((FROM_UNIXTIME(epoch/1000)), '%Y-%m-%d-%h') as date_hour, " +
          "FROM_UNIXTIME(epoch/1000) as date_, line, avg(if(power > 0, power, 0))/1000 as kwh from power_data " +
          "where epoch > UNIX_TIMESTAMP(DATE_ADD(now(), INTERVAL -3 MONTH)) * 1000 \
          group by date_hour, line ) t" 
          break 
          case 'total_year':  query_ = "select sum(kwh) as power_consumption from "  +
          "( select 	DATE_FORMAT((FROM_UNIXTIME(epoch/1000)), '%Y-%m-%d-%h') as date_hour, " +
          "FROM_UNIXTIME(epoch/1000) as date_, line, avg(if(power > 0, power, 0))/1000 as kwh from power_data " +
          "where epoch > UNIX_TIMESTAMP(DATE_ADD(now(), INTERVAL -1 YEAR)) * 1000 \
          group by date_hour, line ) t" 
          break
          default:  query_ = "select epoch, group_concat(power order by line) as 'values' \
          from power_data group by epoch having count(*) > 1  order by epoch "
        }
      }
      else {
        query_ = "select epoch, group_concat(power order by line) as 'values' \
                        from power_data   \
                        where epoch > UNIX_TIMESTAMP(DATE_ADD(now(), INTERVAL -3 HOUR)) * 1000 \
                        group by epoch having count(*) > 1 \
                        order by epoch  "
      }
      con.query(query_,
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

router.post("/current", auth, (req, res, next) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      con.query(
        "select epoch, group_concat(current order by line) as 'values' from power_data \
        where epoch > UNIX_TIMESTAMP(DATE_ADD(now(), INTERVAL -3 HOUR)) * 1000 \
        group by epoch having count(*) > 1 \
        order by epoch ",
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
