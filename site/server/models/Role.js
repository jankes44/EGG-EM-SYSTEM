const Sequelize = require("sequelize");
const db = require("../database/db");

module.exports = db.sequelize.define(
  "roles",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    role_name: {
      type: Sequelize.STRING,
    },
    access: {
      type: Sequelize.INTEGER,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);
