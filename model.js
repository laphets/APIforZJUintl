const Sequelize = require('sequelize');
const config = require('./config');

const instance = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    charset: 'utf8',
    collate: 'utf8_general_ci',
    dialect: 'mysql',
    logging: false
});

module.exports = instance;