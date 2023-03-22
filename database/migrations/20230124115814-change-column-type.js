'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.changeColumn('licenses', 'licenseSummary', {
      type: Sequelize.TEXT,
    });

    await queryInterface.changeColumn('projects', 'projectDescription', {
      type: Sequelize.TEXT,
    });
    
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.changeColumn('licenses', 'licenseSummary', {
      type: Sequelize.STRING,
    });
    await queryInterface.changeColumn('projects', 'projectDescription', {
      type: Sequelize.STRING,
    });
  }
};
