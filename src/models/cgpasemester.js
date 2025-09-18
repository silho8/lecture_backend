'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CgpaSemester extends Model {
    static associate(models) {
      CgpaSemester.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });
      CgpaSemester.hasMany(models.CgpaCourse, {
        foreignKey: 'semester_id',
        as: 'courses',
        onDelete: 'CASCADE',
      });
    }
  }
  CgpaSemester.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'CgpaSemester',
    tableName: 'cgpa_semesters',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });
  return CgpaSemester;
};
