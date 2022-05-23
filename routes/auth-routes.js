const router = require('express').Router();
const passport = require('passport');
const CallbackURL = require('../config/sys-config');

// Call back URL
//const CustomerPortalBackURL = 'http://localhost:4200/profile/';
const CustomerPortalBackURL = CallbackURL.DevMode ? CallbackURL.log_in_out_callBackUrl.DevMode : CallbackURL.log_in_out_callBackUrl.ServiceMode;

// auth login
// Used for internal 
router.get('/login-index', (req, res) => {
    res.render('login-index', {user: req.user});
});

// auth logout
router.get('/logout', (req, res) => {
    // handle with passport
    //res.send('logging out');
    
    req.logout();
    //res.redirect('/');
    console.log('Logout: redirectURL', CustomerPortalBackURL);
    res.redirect(CustomerPortalBackURL);
    
});


//************************************** */
// Step #3 use passport in routes        */
//************************************** */


// Google 
//--------------------------------------------------

// auth with google
router.get('/google', passport.authenticate('google', {
    scope: ['profile']
}));

router.get('/google/redirect', passport.authenticate('google'), (req, res) => { // callback route for google to redirect to // passport.authenticate('google') to use the code returned from google to fire the callback funciton
    console.log('/google/redirect:', req.user);
    res.redirect(CustomerPortalBackURL + req.user.id);
});

// Facebook 
//--------------------------------------------------
router.get('/facebook', passport.authenticate('facebook'));

router.get('/facebook/redirect', passport.authenticate('facebook'), (req, res) => {
    console.log('/facebook/redirect:', req.user);
    res.redirect(CustomerPortalBackURL + req.user.id);
});

// Twitter 
//--------------------------------------------------
router.get('/twitter', passport.authenticate('twitter'));

router.get('/twitter/redirect', passport.authenticate('twitter'), (req, res) => {
    console.log('/twitter/redirect:', req.user);
    res.redirect(CustomerPortalBackURL + req.user.id);
});

// Linkedin 
//--------------------------------------------------
router.get('/linkedin', passport.authenticate('linkedin'));

router.get('/linkedin/redirect', passport.authenticate('linkedin'), (req, res) => {
    console.log('/linkedin/redirect:', req.user);
    res.redirect(CustomerPortalBackURL + req.user.id);
});

// LINE /auth/line/redirect
router.get('/line', passport.authenticate('line'));

router.get('/line/redirect', passport.authenticate('line'), (req, res) => {
    console.log('/line/redirect:', req.user);
    res.redirect(CustomerPortalBackURL + req.user.id);
});


module.exports = router;

