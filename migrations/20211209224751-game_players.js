'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('game_players', {
      user_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' }
      },
      game_id: {
        type: Sequelize.INTEGER,
        references: { model: 'games', key: 'id' }
      },
      current_player: { // Change to boolean?
        allowNull: false,
        type: Sequelize.INTEGER // 0 for false, 1 for true
      },
      order: {
        allowNull: false,
        type: Sequelize.INTEGER
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('game_players');
  }
};
