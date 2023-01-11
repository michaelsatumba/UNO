const db = require('../db');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({usernameField: 'username', passwordField: 'password'}, (username, password, done) => {
      // Match user
      db.any('SELECT * FROM users WHERE username = $1;', username)
      .then( result => {
        // If no username exists
        if(result.length > 0 && bcrypt.compareSync(password, result[0].password)) {
          // Username exists
          return done(null, {id: result[0].id, username: result[0].username});
        } else {
          // errors.push({message: "Username does not exist."});
          // res.render('registration', { errors })
          return done('That user was not found.', false);
        }
      })
    })
  )
};

passport.serializeUser((user, done) => {
    done(null, user.id);
});
  
passport.deserializeUser((id, done) => {
  db.one('SELECT * FROM users WHERE id=$1;', [id])
  .then(({ id, username }) => done(null, { id, username }))
  .catch( error => {
    console.log( error );
    res.json({ error });
  });
});
