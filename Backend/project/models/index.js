const Sequelize = require('sequelize');
const config = require('../config/config.json')[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize(config.database, config.username, config.password, config);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;


db.User = require('./User')(sequelize, Sequelize.DataTypes);
db.Workspace = require('./Workspace')(sequelize, Sequelize.DataTypes);
db.Taskboard = require('./Taskboard')(sequelize, Sequelize.DataTypes);
db.Task = require('./task')(sequelize, Sequelize.DataTypes);
db.UserTaskboard = require('./UserTaskboard')(sequelize, Sequelize.DataTypes);
db.UserTask = require('./UserTask')(sequelize, Sequelize.DataTypes);

// Associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});


module.exports = db;
