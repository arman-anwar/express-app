var express = require('express');
var passport = require('passport');
var router = express.Router();

router.get('/', function (req, res) {
    //console.log(req.user);
    res.render('index', { user: req.user });
});

router.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));
router.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/#/list',
    failureRedirect: '/#/login'
}), function (req, res) {
    res.redirect('/');
}
);

router.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/');
});


module.exports = router;
