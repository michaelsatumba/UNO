var express = require('express');
var router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const { result } = require('../db');
const Games = require('../db/games');

router.get('/', function(req, res, next) {
  res.render('home');
});

router.get('/registration', function(req, res, next) {
  res.render('registration');
});

router.get('/login', function(req, res, next) {
  // If user is already logged in, redirects to lobby page.
  if(req.isAuthenticated()) {
    res.redirect('/lobby');
    res.render('lobby', {
      name: req.user.username
    });
  } 
  else {
    res.render('login');
  }
});

router.get('/rules', function(req, res, next) {
  res.render('rules');
});

router.get('/lobby', ensureAuthenticated, function(req, res, next) {

  Games.listGames()
  .then((results) => res.json(results))
  .catch(console.log);

  res.render('lobby', {
    name: req.user.username
  });

});

router.get('/user', function(req, res) {
  res.send(req.user);
})

// router.get('/game', function(req, res, next) {
//   res.render('game');
// });

module.exports = router;
