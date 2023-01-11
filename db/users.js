const db = require('../db');

const SEARCH_USER = 'SELECT * FROM users WHERE id=${user_id};';

const findUserById = (user_id) => 
    db.one(SEARCH_USER, {user_id});

module.exports = {
    findUserById
}
