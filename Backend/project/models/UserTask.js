// models/UserTask.js
module.exports = (sequelize, DataTypes) => {
  const UserTask = sequelize.define('UserTask', {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'User',
        key: 'id',
      },
    },
    task_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'Task',
        key: 'm_id',  // Assuming m_id is the primary key for the Task model
      },
    },
    role: {
      type: DataTypes.STRING(50),
      defaultValue: 'assignee',
    },
    assigned_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'user_tasks',
    timestamps: false,
  });

  // Associations
  UserTask.associate = (models) => {
    UserTask.belongsTo(models.User, { foreignKey: 'user_id' });
    UserTask.belongsTo(models.Task, { foreignKey: 'task_id' });
  };

  return UserTask;
};
