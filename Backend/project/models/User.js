// models/User.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
      id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
      },
      username: {
          type: DataTypes.STRING(50),
          unique: true,
          allowNull: false,
      },
      password_hash: {
          type: DataTypes.STRING(255),
          allowNull: false,
      },
      email: {
          type: DataTypes.STRING(100),
          unique: true,
          allowNull: false,
      },
      full_name: {
          type: DataTypes.STRING(100),
      },
      user_type: {
          type: DataTypes.ENUM('admin', 'user'),
          allowNull: false,
      },
      created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
      },
      updated_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
      },
  }, {
      tableName: 'users',
      timestamps: false,
  });

  User.associate = (models) => {
      User.hasMany(models.Workspace, { foreignKey: 'user_id' });
      User.belongsToMany(models.Taskboard, { through: 'UserTaskboards', foreignKey: 'user_id' });
      User.belongsToMany(models.Task, { through: 'UserTasks', foreignKey: 'user_id' });
  };

  return User;
};
