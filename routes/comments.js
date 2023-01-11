var express = require('express');
var router = express.Router();
const db = require('../db');
const { ensureAuthenticated } = require('../config/auth');

router.post('/create', (req, res, next) => {
    if(req.isAuthenticated()) {
        // User logged in
        let comment = req.body.comment;
        let userId = req.user.id;
        let gameId = 0;
        // Check for empty comment?

        db.query(`INSERT INTO chats ("user_id", "message", "created") VALUES ($1, $2, $3);`, [userId, comment, "now()"])
        .then((_) => {
            req.flash('success', 'Posted a comment!');
            res.redirect('/game');
          })
        .catch( error => {
            console.log( error );
            res.json({ error });
        });
    } else {
        // User not logged in
        res.redirect('/login');
    }
});

module.exports = router;
