// models/Taskboard.js
module.exports = (sequelize, DataTypes) => {
  const Taskboard = sequelize.define('Taskboard', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    workspace_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Workspace',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(255),
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
    tableName: 'taskboards',
    timestamps: false,
  });

  Taskboard.associate = (models) => {
    Taskboard.belongsTo(models.Workspace, { foreignKey: 'workspace_id' });
    Taskboard.hasMany(models.Task, { foreignKey: 'taskboard_id' });
    Taskboard.belongsToMany(models.User, { through: models.UserTaskboard, foreignKey: 'taskboard_id' });
    Taskboard.hasMany(models.UserTaskboard, { foreignKey: 'taskboard_id' });
  };

  return Taskboard;
};
