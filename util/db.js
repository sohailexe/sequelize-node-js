const Sequelize= require("sequelize");

const sequelize= new Sequelize(">>Store NAME<<",">>>>DB NAME>>>","PASSWORD",
{dialect: 'mysql', host: "localhost"})

module.exports = sequelize;
