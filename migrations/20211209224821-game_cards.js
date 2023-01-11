'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('game_cards', {
      user_id: {
        allowNull: true, // If in Discard, no User has the card, hence NULL? (or do 0)
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' }
      },
      game_id: {
        type: Sequelize.INTEGER,
        references: { model: 'games', key: 'id' }
      },
      card_id: {
        type: Sequelize.INTEGER,
        references: { model: 'cards', key: 'id' }
      },
      order: { // Order in hand?
        allowNull: false,
        type: Sequelize.INTEGER
      },
      discarded: { // Change to boolean?
        allowNull: false,
        type: Sequelize.INTEGER // 1 for true, 0 for false.
      },
      // Card that is on top of discard pile
      active_discard: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      draw_pile: { // Change to boolean?
        allowNull: false,
        type: Sequelize.INTEGER // 1 for true, 0 for false.
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('game_cards');
  }
};
