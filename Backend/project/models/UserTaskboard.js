// models/UserTaskboard.js
module.exports = (sequelize, DataTypes) => {
  const UserTaskboard = sequelize.define('UserTaskboard', {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: 'user_id',  // Explicitly define the database column name
      references: {
        model: 'Users',  // Make sure this matches the table name
        key: 'id',
      },
    },
    taskboard_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: 'taskboard_id',  // Explicitly define the database column name
      references: {
        model: 'Taskboards',  // Make sure this matches the table name
        key: 'id',
      },
    },
    role: {
      type: DataTypes.STRING(50),
      defaultValue: 'editor',
    },
  }, {
    tableName: 'user_taskboards',
    timestamps: false,
    returning: ['user_id', 'taskboard_id', 'role'], // Ensure only these fields are returned
  });

  UserTaskboard.associate = (models) => {
    UserTaskboard.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    UserTaskboard.belongsTo(models.Taskboard, { foreignKey: 'taskboard_id', as: 'taskboard' });
  };

  return UserTaskboard;
};
