'use strict';

const CARD_LIST = (() => {
  const colors = ["red", "blue", "green", "yellow"];
  const number_cards = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const action_cards = ["Draw 2", "Reverse", "Skip"];
  const wild_cards = ["Wild", "Draw 4"];

  const deck = [];

  colors.forEach((color) => {
    // One zero for each color
    deck.push({ color, displayName: "0" });

    // Two of each number card (other than 0)
    const nums = number_cards.map((displayName) => ({ color, displayName }));
    deck.push( ... nums, ... nums);

    // Two of each action card
    const actions = action_cards.map((displayName) => ({ color, displayName }));
    deck.push( ... actions, ... actions);
  });

  // Four of each wild card
  const wilds = wild_cards.map((displayName) => ({
    color: "wild",
    displayName
  }));
  deck.push(... wilds, ... wilds, ... wilds, ... wilds)

  colors.forEach((color) => {
    deck.push({ color, displayName: "Wild" });
    deck.push({ color, displayName: "Draw 4" });
  });

  return deck;

})();

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('cards', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      color: {
        type: Sequelize.STRING,
        allowNull: false
      },
      displayName: {
        allowNull: false,
        // Colors: 0-9 , Draw 2, Reverse, Skip. ()
        // Wild: Wild, Draw 4
        type: Sequelize.STRING
      }
    });

    return queryInterface.bulkInsert('cards', CARD_LIST);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('cards');
  }
};
