const db = require('../db');
var format = require('pg-format'); // To SQL insert nested array of array values with one query

// CONSTANTS:
const GET_CARD_BY_ID = 'SELECT * FROM cards WHERE id=$1;';
const TWO_CARDS_BY_ID = 'SELECT * FROM cards WHERE id=$1 OR id=$2;';

const getCardById = (cardId) => db.one(GET_CARD_BY_ID, [cardId]);

const getTwoCardsByIds = (cardId1, cardId2) => db.any(TWO_CARDS_BY_ID, [cardId1, cardId2]);

module.exports = {
    getCardById,
    getTwoCardsByIds
}
