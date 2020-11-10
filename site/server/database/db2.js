const mysql = require("mysql");
const mysql_async = require("promise-mysql")

const config = {
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_BASE,
}

//connection details
var con = mysql.createPool(config);

//make connection
con.getConnection(function (error) {
  if (!!error) {
    console.log(error);
  } else {
    console.log("Connected to database");
  }
});

con.on("error", function (err) {
  console.log("db error", err);
  if (err) {
    console.log("Database disconnected, reconnecting in 30 seconds", Date());
    setTimeout(() => {
      con.connect(function (error) {
        if (!error) {
          console.log("Connected to database");
        } else throw error;
        if (err.fatal) {
          console.trace("Fatal error" + err.message);
        }
      });
    }, 30000);
    // lost due to either server restart, or a
  } else {
    // connnection idle timeout (the wait_timeout
    throw err; // server variable configures this)
  }
});

const getAsyncCon = async () => {
  pool = await mysql_async.createPool(config);
  await pool.getConnection()
  return pool;
 }

 async_con = getAsyncCon()

//export module so other files can use it
module.exports = {con, async_con}
