module.exports = (sequelize, DataTypes) => {
    const RetrospectiveItem = sequelize.define('RetrospectiveItem', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      taskboard_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'taskboards', // Assumes Taskboard is the model name
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      type: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      cont: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
    }, {
      tableName: 'RetrospectiveItems',
      timestamps: false,
    });
  
    // Associations
    RetrospectiveItem.associate = (models) => {
      RetrospectiveItem.belongsTo(models.Taskboard, { foreignKey: 'taskboard_id' });
    };
  
    return RetrospectiveItem;
  };
  