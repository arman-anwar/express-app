var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var mongojs = require('mongojs');

var FacebookStrategy = require('passport-facebook').Strategy
  , session = require('express-session')
  , cookieParser = require('cookie-parser')
  , config = require('./config/config')
  , passport = require('passport')


var app = express();
var db = mongojs(config.dbUrl, ['contactlist']);

// Passport session setup.
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (obj, done) {
  done(null, obj);
});
// Use the FacebookStrategy within Passport.
passport.use(new FacebookStrategy({
  clientID: config.facebook_api_key,
  clientSecret: config.facebook_api_secret,
  callbackURL: config.callback_url,
  profileFields: ['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified', 'displayName'],
},
  function (accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      db.contactlist.findOne({ id: profile.id }, function (err, doc) {
        if (doc) {
          return done(null, profile);
        } else {
          db.contactlist.insert(profile._json, function (err, doc) {
            return done(null, profile);
          });
        }
      });
      //Check whether the User exists or not using profile.id
      //Further DB code.
    });
  }
));
// view engine setup
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'keyboard cat', key: 'sid', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));
//Router code
app.get('/', function (req, res) {
  //console.log(req.user);
  res.render('index', { user: req.user });
});
app.get('/account', ensureAuthenticated, function (req, res) {
  res.render('account', { user: req.user });
});
//app.use('/', index);
//app.use('/users', users);

app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/#/list',
  failureRedirect: '/#/login'
}), function (req, res) {
  res.redirect('/');
}
);
app.get('/contactlist', function (req, res) {
  db.contactlist.find(function (err, docs) {
    res.json(docs);
  });
});
app.get('/logout', function (req, res) {
  req.session.destroy();
  res.redirect('/');
});
app.get('/contactlist/:id', function (req, res) {
  var id = req.params.id;
  db.contactlist.findOne({ _id: mongojs.ObjectId(id) }, function (err, doc) {
    res.json(doc);
  });
});

app.delete('/contactlist/:id', function (req, res) {
  var id = req.params.id;
  db.contactlist.remove({ _id: mongojs.ObjectId(id) }, function (err, doc) {
    res.json(doc);
  });
});

app.post('/contactlist', function (req, res) {
  db.contactlist.insert(req.body, function (err, doc) {
    res.json(doc);
  });
});

app.put('/contactlist/:id', function (req, res) {
  var id = req.params.id;
  db.contactlist.findAndModify({
    query: { _id: mongojs.ObjectId(id) },
    update: { $set: { name: req.body.name, email: req.body.email, number: req.body.number } },
    new: true
  }, function (err, doc) {
    res.json(doc);
  }
  );
});
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}
module.exports = app;
