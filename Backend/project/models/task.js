// models/Task.js
module.exports = (sequelize, DataTypes) => {
    const Task = sequelize.define('Task', {
      m_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      task_title: {
        type: DataTypes.STRING(100),
      },
      task_content: {
        type: DataTypes.STRING(500),
      },
      status: {
        type: DataTypes.STRING(255),
        defaultValue: 'todo',
      },
      importance: {
        type: DataTypes.STRING(50),
        defaultValue: 'No Time Constraint',
      },
      taskboard_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Taskboard',
          key: 'id',
        },
      },
      due_date: {
        type: DataTypes.DATEONLY,
      },
      due_time: {
        type: DataTypes.TIME,
      },
    }, {
      tableName: 'tasks',
      timestamps: false,
    });
  
    Task.associate = (models) => {
      Task.belongsTo(models.Taskboard, { foreignKey: 'taskboard_id' });
      Task.belongsToMany(models.User, { through: 'UserTasks', foreignKey: 'task_id' });
    };
  
    return Task;
  };
  