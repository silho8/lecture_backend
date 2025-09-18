'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      course_code: {
        type: Sequelize.STRING(64),
        allowNull: false
      },
      course_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      visibility: {
        type: Sequelize.ENUM('public', 'private'),
        defaultValue: 'public',
        allowNull: false
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('notes', ['user_id']);
    await queryInterface.addIndex('notes', ['course_code']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('notes');
  }
};
