'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AdminAction extends Model {
    static associate(models) {
      AdminAction.belongsTo(models.User, {
        foreignKey: 'admin_user_id',
        as: 'admin',
      });
    }
  }
  AdminAction.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    admin_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    action_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    target_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'AdminAction',
    tableName: 'admin_actions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });
  return AdminAction;
};
