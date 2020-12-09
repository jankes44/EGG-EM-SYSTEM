const express = require("express");
const users = express.Router();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const con = require("../database/db2");

const User = require("../models/User");
const Role = require("../models/Role");

User.hasOne(Role, { foreignKey: "roles_id" });

users.use(cors());

users.get("/", (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (err) => {
    if (err) {
      res.sendStatus(403);
    } else {
      con.query(`
      SELECT 
        users.*, roles.name as role_name
      FROM
        users
          LEFT OUTER JOIN
        roles ON roles.id = users.roles_id`);
    }
  });
});

users.post("/register", (req, res) => {
  console.log(req.body.first_name, req.body.last_name, req.body.role, req.body);
  const today = new Date();
  const userData = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    password: req.body.password,
    created: today,
    roles_id: req.body.role,
    sites: req.body.sites,
  };

  User.findOne({
    where: {
      email: req.body.email,
    },
  })
    .then((user) => {
      if (!user) {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          userData.password = hash;
          User.create(userData)
            .then((user) => {
              userData.sites.forEach((el) => {
                console.log(user.id, el);
                con.query(
                  "INSERT INTO users_has_sites SET users_id=?, sites_id=?",
                  [user.id, el],
                  (err, result) => {
                    if (err) throw err;
                    console.log(result);
                  }
                );
              });
              res.json({ status: user.email + " registered" });
            })
            .catch((err) => {
              console.log(err);
              res.send("error: " + err);
            });
        });
      } else {
        console.log("User already exists");
        res.status(400).json("User with this email address already exists");
      }
    })
    .catch((err) => {
      console.log(err);
      res.send("error: " + err);
    });
});

users.post("/login", (req, res) => {
  User.findOne({
    where: {
      email: req.body.email,
    },
  })
    .then((user) => {
      if (user) {
        if (bcrypt.compareSync(req.body.password, user.password)) {
          con.query(
            "SELECT * FROM roles WHERE id=? LIMIT 1",
            [user.dataValues.roles_id],
            (err, rows) => {
              var rowsData = JSON.stringify(rows[0]);
              var roleData = JSON.parse(rowsData);

              user.dataValues.access = roleData.access;
              user.dataValues.role_name = roleData.name;

              let token = jwt.sign(user.dataValues, process.env.SECRET_KEY, {
                expiresIn: "4h",
                algorithm: "HS512",
              });
              res.json(token);
            }
          );
        } else {
          res.status(400).json("Wrong password");
        }
      } else {
        res.status(400).json("User with this email address doesn't exist");
      }
    })
    .catch((err) => {
      res.status(400).json({ error: err });
    });
});

module.exports = users;
