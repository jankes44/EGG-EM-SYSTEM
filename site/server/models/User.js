const Sequelize = require("sequelize");
const db = require("../database/db");

module.exports = db.sequelize.define(
  "users",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    first_name: {
      type: Sequelize.STRING,
    },
    last_name: {
      type: Sequelize.STRING,
    },
    email: {
      type: Sequelize.STRING,
    },
    password: {
      type: Sequelize.STRING,
    },
    roles_id: {
      type: Sequelize.INTEGER,
      foreignKey: true,
    },
    created: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    last_login: {
      type: Sequelize.DATE,
    },
  },
  {
    timestamps: false,
  }
);
