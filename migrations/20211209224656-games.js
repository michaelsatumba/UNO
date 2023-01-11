'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('games', {
      // Game_ID
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      // Host of the game?
      user_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' }
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING
      },
      direction: {
        allowNull: false,
        type: Sequelize.INTEGER // -1 or 1
      },
      created: { // Do we need?
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('games');
  }
};
