// models/Workspace.js
module.exports = (sequelize, DataTypes) => {
    const Workspace = sequelize.define('Workspace', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'User',
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
      tableName: 'workspaces',
      timestamps: false,
    });
  
    Workspace.associate = (models) => {
      Workspace.belongsTo(models.User, { foreignKey: 'user_id' });
      Workspace.hasMany(models.Taskboard, { foreignKey: 'workspace_id' });
    };
  
    return Workspace;
  };
  