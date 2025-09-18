'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'status', {
      type: Sequelize.ENUM('active', 'banned'),
      defaultValue: 'active',
      allowNull: false,
      after: 'role' // Place it after the 'role' column
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'status');
    // Also need to remove the ENUM type from the database manually if needed,
    // but for most cases, this is sufficient.
  }
};
