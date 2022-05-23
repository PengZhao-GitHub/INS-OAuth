const router = require('express').Router();

const User = require('../models/user-model');
const { ensureAuthenticated } = require('../config/auth');


// create a middleware
const authCheck = (req, res, next) => {
    if (!req.user) {
        // if user is not logged in
        res.redirect('/auth/login-index');
    } else {
        // if user logged in
        next();
    }
};

// Version#1 Web Page
// add the authCheck middleware to check if the customer is logged in
router.get('/', authCheck, (req, res) => {
    //res.send('you are logged in, this is your profile -' + req.user.username);
    res.render('profile', { user: req.user });
});

// Version#2 API
// Get customer profile by mongoDB ID , add authenticated check!!!
router.get('/:id', (req, res) => {
    console.log('Call API: /profile/:id  --> isAuthenticated?', req.isAuthenticated());
    if (req.isAuthenticated()) {
        User.findById(req.params.id).then((user) => {
            console.log('get user profile:', user);
            // The two lines are the magic to handle the error
            //Access to XMLHttpRequest at 'http://localhost:3000/profile/5f328d389c25320399580f35' from origin 'http://localhost:4200' has been blocked by CORS policy: The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'.
            //Good article: http://50linesofco.de/post/2017-03-06-cors-a-guided-tour
            res.set('Access-Control-Allow-Credentials', 'true')
            res.set('Access-Control-Allow-Origin', req.headers.origin)
            //Set the response headers to solve the CORS issues
            res.json(user);
            //res.send(403);
        });
    } else {
        //res.redirect('/auth/login-index');
        res.sendStatus(403); //Forbidden
    }
});

/*
router.get('/:id', (req, res) => {
    User.findById(req.params.id).then((user) => {
        console.log('get user profile:', user);
        res.json(user);

    });
});
*/





module.exports = router;