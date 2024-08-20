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
          key: 'm_id',
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
  
    return UserTask;
  };
  