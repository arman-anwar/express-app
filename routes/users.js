var express = require('express');
var router = express.Router();
var FacebookStrategy = require('passport-facebook').Strategy
  , session = require('express-session')
  , cookieParser = require('cookie-parser')
  , config = require('../config/config')
  , passport = require('passport');
var User = require('../models/users');

// Passport session setup.
// Use the FacebookStrategy within Passport.
passport.use(new FacebookStrategy({
  clientID: config.facebook_api_key,
  clientSecret: config.facebook_api_secret,
  callbackURL: config.callback_url,
  profileFields: ['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified', 'displayName'],
},
  function (accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      User.getUserByFbId(profile.id, function (data) {
        if (data.length == 0) {
          var newUser = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            fb_id: profile.id,
            gender: profile.gender
          });
          User.createUser(newUser, function (err, user) {
            if (err) throw err;
            return done(null, profile);
          });
        } else {
          console.log('user already exists');
          return done(null, profile);
        }
      });

      //Check whether the User exists or not using profile.id
      //Further DB code.
    });
  }
));

passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

router.get('/id/:id', function (req, res) {
  var id = req.params.id;
  User.getUserById(id, function (err, user) {
    res.json(user);
  });
});

router.get('/', function (req, res) {
  User.getAllUsers(function (err, docs) {
    res.json(docs);
  });
});

router.delete('/id/:id', function (req, res) {
  var id = req.params.id;
  User.remove(id, function (err, user) {
    res.json(user);
  });
});

router.put('/id/:id', function (req, res) {
  var id = req.params.id;
  User.update({ _id: id }, { name: req.body.name, email: req.body.email, number: req.body.number }, function (err, doc) {
    if (err) return res.status(500).send({ error: err });
    return res.json(doc);
  });
});

module.exports = router;
