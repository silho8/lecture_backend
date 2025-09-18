'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('cgpa_courses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      semester_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'cgpa_semesters',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      course_code: {
        type: Sequelize.STRING(64),
        allowNull: false
      },
      course_title: {
        type: Sequelize.STRING,
        allowNull: true
      },
      units: {
        type: Sequelize.SMALLINT,
        allowNull: false
      },
      grade_raw: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      grade_point: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: false
      },
      is_retake: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('cgpa_courses', ['semester_id']);
    await queryInterface.addIndex('cgpa_courses', ['user_id']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('cgpa_courses');
  }
};
