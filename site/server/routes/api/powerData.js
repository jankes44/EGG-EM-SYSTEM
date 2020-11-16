const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken");
const con = require("../../database/db2");
const url = require('url');

const fillTemplate = function(templateString, templateVars){
  var func = new Function(...Object.keys(templateVars),  "return `"+templateString +"`;")
  return func(...Object.values(templateVars));
}

const insertQuery = "INSERT INTO power_data (line, epoch, power, current ,voltage) VALUES ?"
const getLinesQuery = "select distinct line from power_data order by line"
const aggregatePowerQuery = "select ${line_} round(sum(kwh),2) as power_consumption from "  +
"( select 	DATE_FORMAT((FROM_UNIXTIME(epoch)), '%Y-%m-%d-%H') as date_hour, " +
"FROM_UNIXTIME(epoch) as date_, line, avg(if(power > 0, power, 0))/1000 as kwh from power_data " +
"where epoch > UNIX_TIMESTAMP(DATE_ADD(now(), INTERVAL ${timePeriod})) \
group by date_hour, line ) t ${line}"

const timePeriods = {
  "day": "-1 DAY",
  "month": "-1 MONTH",
  "three_months": "-3 MONTH",
  "year": "-1 YEAR"
}

const rangeQueries = {
  "day": "select UNIX_TIMESTAMP(date_hour) as epoch, ${values} \
          as 'values' from (select DATE_FORMAT((FROM_UNIXTIME(epoch)), '%Y-%m-%d-%H') as date_hour, line, \
          avg(if (${measure} > 0, ${measure}, 0)) as ${measure} \
          from power_data where epoch > UNIX_TIMESTAMP(DATE_ADD(now(), INTERVAL -1 DAY)) \
          group by date_hour, line ) t group by epoch", 
  
  "week": "select UNIX_TIMESTAMP(CONCAT( date, '-', hour*6)) as epoch, ${values} as 'values' \
            from ( \
            select  DATE_FORMAT((FROM_UNIXTIME(epoch)), '%Y-%m-%d') as date, \
                DATE_FORMAT((FROM_UNIXTIME(epoch)), '%H') DIV 6 as hour, line, \
                avg(if (${measure} > 0, ${measure}, 0)) as ${measure} \
            from power_data where epoch > UNIX_TIMESTAMP(DATE_ADD(now(), INTERVAL -1 WEEK)) \
            group by date, line, hour) t group by epoch",
  
  "month": "select UNIX_TIMESTAMP(date_hour) as epoch, ${values} \
            as 'values' from (select DATE_FORMAT((FROM_UNIXTIME(epoch)), '%Y-%m-%d') as date_hour, line, avg(if (${measure} > 0, ${measure} , 0)) as ${measure} \
            from power_data where epoch > UNIX_TIMESTAMP(DATE_ADD(now(), INTERVAL -1 MONTH)) group by date_hour, line ) t group by epoch", 

  "three_months":  "select UNIX_TIMESTAMP(week_start) as epoch, ${values} as 'values' from ( \
                    SELECT  WEEK(from_unixtime(epoch)) AS week_no, date(from_unixtime(epoch)) as week_start, \
                    line, avg(if (${measure} > 0, ${measure} , 0)) as ${measure} \
                    from power_data \
                    where epoch > UNIX_TIMESTAMP(DATE_ADD(now(), INTERVAL -3 MONTH)) \
                    GROUP BY WEEK(from_unixtime(epoch)), line \
                    ORDER BY week_no ) t group by epoch",
  
   "year": "select UNIX_TIMESTAMP(week_start) as epoch, ${values} as 'values' from ( \
            SELECT  WEEK(from_unixtime(epoch)) AS week_no, date(from_unixtime(epoch)) as week_start, \
            line, avg(if (${measure} > 0, ${measure} , 0)) as ${measure} \
            from power_data \
            where epoch > UNIX_TIMESTAMP(DATE_ADD(now(), INTERVAL -1 YEAR)) \
            GROUP BY WEEK(from_unixtime(epoch)), line \
            ORDER BY week_no ) t group by epoch"
      
}

const aggregatePower = (range_, byLine) => {
  const line = byLine ? "group by line" : ""
  const line_ = byLine ? "line, " : ""
  const timePeriod = timePeriods[range_]
  return fillTemplate(aggregatePowerQuery, {line_: line_, line: line, timePeriod: timePeriod})
}

const getValuesInRange = (range_, measure) => {
  const values = measure === "voltage" ?  "voltage" : `group_concat(${measure} order by line)`
  return fillTemplate(rangeQueries[range_], {values: values, measure: measure})
}


router.post("/insert", auth, (req, res, next) => {
  const data_ = req.body;
  const data = data_.map((el) => Object.values(el));
  con.query(insertQuery, [data], (err) => {
    if (err) {
      res.json({ status: "Error", data: err.stack });
    } else {
      res.json({ status: "ok" });
    }
  });
});

router.get("/lines", auth, (req, res, next) => {
  con.query(getLinesQuery, (err, result, fields) => {
    if (err) {
      res.status(400).json({ status: "Error", data: err.stack });
    } else {
      res.status(200).json({ status: "ok", data: result });
    }
  });
});

router.post("/values", auth, (req, res, next) => {
  const query_ = getValuesInRange(req.body.range, req.body.measure)
  console.log(query_)
  con.query(query_, (err, result, fields) => {
    if (err) {
      res.status(400).json({data: err.stack });
    } else {
      res.status(200).json({data: result});
    }
  })
})
  

const ranges = ["month", "three_months", "year"]
const byLines = [true, false]

router.post("/aggregate", auth, (req, res, next) => {
  if (req.body.measure === "power"){
    let params = []
    ranges.forEach(range => byLines.forEach(byLine => params.push({range: range, byLine: byLine})))
    console.log(params, params.length)

    const queries = (params.map(p => aggregatePower(p.range, p.byLine))).join(";")
    con.query(queries, (err, result, fields) => {
      if (err) {
        res.sendStatus(400)
      } else {
        res.status(200).json({summary: {
          month_line: result[0],
          month: result[1],
          three_months_line: result[2],
          three_months: result[3],
          year_line: result[4],
          year: result[5]
      }
    })
  }
})
}})

module.exports = router;
