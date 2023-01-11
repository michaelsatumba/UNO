'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('chats', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: { 
          model: 'users', 
          key: 'id' 
        }
      },
      game_id: {
        type: Sequelize.INTEGER,
        references: { 
          model: 'games', 
          key: 'id' 
        }
      },
      message: {
        type: Sequelize.TEXT
      },
      created: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('chats');
  }
};
