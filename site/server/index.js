const express = require("express");
require("dotenv").config();
const path = require("path");
// const exphbs = require("express-handlebars");
// const logger = require("./middleware/logger");
const PORT = process.env.PORT || 5000;
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

//init middleware
//app.use(logger);

// // Handlebarrs Middleware
// app.engine("handlebars", exphbs({ defaultLayout: "main" }));
// app.set("view engine", "handlebars");

// Body parser middleware
app.use(bodyParser.json());
// Cors middleware, allow all requests
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Users
var Users = require("./routes/Users");
app.use("/users", Users);

// MQTT routes
// app.use("/mqtt", require("./routes/mqtt"));
app.use("/mqtt", require("./routes/mqtt"));
// app.use("/mqttCore", require("./Mqtt/MqttCore"));

// api routes
app.use("/api/lights", require("./routes/api/lights"));
app.use("/api/levels", require("./routes/api/levels"));
app.use("/api/buildings", require("./routes/api/buildings"));
app.use("/api/sites", require("./routes/api/sites"));
app.use("/api/trialtests", require("./routes/api/tests"));
app.use("/api/rolesusers", require("./routes/api/roles_users"));
app.use("/api/generatepdf", require("./routes/api/PdfGenerate"));
app.use("/api/sensors", require("./routes/api/sensors"));
app.use("/sockets", require("./routes/socketsControl"));
app.use("/api/power", require("./routes/api/powerData"));

app.listen(PORT, () => console.log("Server started on port", PORT, Date()));
