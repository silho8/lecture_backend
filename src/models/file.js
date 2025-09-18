'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class File extends Model {
    static associate(models) {
      File.belongsTo(models.Note, {
        foreignKey: 'note_id',
        as: 'note',
      });
    }
  }
  File.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    note_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'notes',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    filename_original: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    file_path: {
      type: DataTypes.STRING(1024),
      allowNull: false,
    },
    mimetype: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    filesize_bytes: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'File',
    tableName: 'files',
    timestamps: true,
    createdAt: 'uploaded_at',
    updatedAt: false, // No updated_at for this table
  });
  return File;
};
