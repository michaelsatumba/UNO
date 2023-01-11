const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const passport = require('passport');
const Users = require('../db/users');

const initializePassport = require('../config/passport');
initializePassport(passport);

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* REGISTER */
router.post('/register', async (req, res, next) => {
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;
  let cpassword = req.body.cpassword;

  // Simple Form Validation:
  // All values need to be filled out.
  // Username: At least 3 characters.
  // Password: At least 6 characters.
  // Password + Confirm Password needs to match.

  let errors = [];

  if (!username || !email || !password || !cpassword) {
    errors.push({message: "Please enter all fields."});
  }

  if (username.length < 3) {
    errors.push({message: "Username must be at least 3 characters long."});
  }

  if (password.length < 6) {
    errors.push({message: "Password must be at least 6 characters long."});
  }

  if (password != cpassword) {
    errors.push({message: "Passwords do not match."});
  }

  // Form Validation has failed:
  if (errors.length > 0) {
    res.render('registration', { errors });
  } 
  // Form Validation has passed:
  else {
    // Bcrypt encrypts passwords for 15 cycles (takes a few seconds).
    let hashedPassword = await bcrypt.hash(password, 15);

    // Checks for existing usernames in database
    await db.any('SELECT * FROM users WHERE username = $1;', username)
    .then( result => {
      if(result.length > 0) {
        errors.push({message: "Username already exists."});
        res.render('registration', { errors })
      } else {
        db.query(`INSERT INTO users ("username", "email", "password", "created") VALUES ($1, $2, $3, $4);`, [username, email, hashedPassword, "now()"])
        .then((_) => {
          req.flash('success', 'User account has been made!');
          res.redirect('/login');
        })
        .catch( error => {
          console.log( error );
          res.json({ error });
        }); 
      }
    })
    .catch( error => {
        console.log( error );
        res.json({ error });
    });
  }
});

/* LOG IN */
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
  successRedirect: '/lobby',
  failureRedirect: '/login',
  failureFlash: true
  })(req, res, next);
});

router.get('/logout', function(req, res, next) {
  req.logout();
  req.flash('success', 'You have been logged out');
  res.redirect('/login');
});

// Get user details by user_id
router.get('/:id', function(req, res) {
  const { id } = req.params;

  Users.findUserById(id)
  .then((response) => res.json(response))
  .catch(console.log);
});

module.exports = router;
