// models/Admin.js
module.exports = (sequelize, DataTypes) => {
    const Admin = sequelize.define('Admin', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: 'User',
          key: 'id',
        },
      },
      admin_specific_column: {
        type: DataTypes.STRING(100),
      },
    }, {
      tableName: 'admins',
      timestamps: false,
    });
  
    Admin.associate = (models) => {
      Admin.belongsTo(models.User, { foreignKey: 'id' });
    };
  
    return Admin;
  };
  