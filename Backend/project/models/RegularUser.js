module.exports = (sequelize, DataTypes) => {
  const RegularUser = sequelize.define('RegularUser', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'User',
        key: 'id',
      },
    },
    user_specific_column: {
      type: DataTypes.STRING(100),
    },
  }, {
    tableName: 'regularusers',
    timestamps: false,
  });

  RegularUser.associate = (models) => {
    RegularUser.belongsTo(models.User, { foreignKey: 'id' });
  };

  return RegularUser;
};
