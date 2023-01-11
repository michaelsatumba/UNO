const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const logger = require('morgan');
const ejs = require("ejs");

const passport = require('passport');
const sessions = require('express-session');
// const mysqlSession = require('express-mysql-session')(sessions);
const flash = require('express-flash');

// const initializePassport = require('../config/passport');
// initializePassport(passport);

if(process.env.NODE_ENV === "development") {
  require("dotenv").config();
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const commentsRouter = require('./routes/comments');
const gamesRouter = require('./routes/games');
const testsRouter = require('./routes/tests');

const app = express();

// const mysqlSessionStore = new mysqlSession(
//   {
//     /* using default options */
//   },
//   require('./db')
// );

// Express Session
app.use(sessions({
  secret: "this is a secret from csc667",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// view engine setup
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/comments', commentsRouter);
app.use('/games', gamesRouter);
app.use('/tests', testsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
