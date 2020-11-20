var db = require("mysql-promise")()
//connection details
db.configure({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_BASE,
  multipleStatements: true
});


module.exports = db;
