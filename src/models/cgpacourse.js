'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CgpaCourse extends Model {
    static associate(models) {
      CgpaCourse.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });
      CgpaCourse.belongsTo(models.CgpaSemester, {
        foreignKey: 'semester_id',
        as: 'semester',
      });
    }
  }
  CgpaCourse.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    semester_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'cgpa_semesters',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
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
    course_code: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    course_title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    units: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    },
    grade_raw: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    grade_point: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
    },
    is_retake: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'CgpaCourse',
    tableName: 'cgpa_courses',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });
  return CgpaCourse;
};
