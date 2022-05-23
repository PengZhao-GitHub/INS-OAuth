const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

const CallbackURL = require('../config/sys-config');

// User model
const User = require('../models/user-model');

// Call back URL
//const CustomerPortalBackURL = 'http://localhost:4200/profile/';  //follow-up: Consolidate into one variable
const CustomerPortalBackURL = CallbackURL.DevMode ? CallbackURL.log_in_out_callBackUrl.DevMode : CallbackURL.log_in_out_callBackUrl.ServiceMode;

// Login Page
//router.get('/login', (req, res) => res.render('./local/login'));
// req.isAuthenticated()
router.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        console.log(req.isAuthenticated());
        console.log('customer has logged in already', req.user);
        res.redirect('/local/redirect');
    } else {
        res.render('./local/login');
    }
});

// Register Page
router.get('/register', (req, res) => res.render('./local/register'));

// Register handle
router.post('/register', (req, res) => {
    console.log(req);
    const { username, email, password, password2  } = req.body;

    let errors = [];

    // Check required fields
    if (!username || !email || !password || !password2) {
        errors.push({msg: 'please fill in all fields'});
    };

    // check passwords match
    if (password !== password2) {
        errors.push({msg: 'Passwords do not match'});
    };

    // check pass length
    if (password.length < 6) {
        errors.push({msg: 'password should be at least 6 characters'});
    }

    if(errors.length > 0 ){
        res.render('./local/register', {
            errors, 
            username, 
            email,
            password,
            password2
        })
    } else {
        // Validation passed
        User.findOne({ email: email})
        .then(user => {
            if(user) {
                // User exists
                errors.push({msg: 'Email is already registered'})
                res.render('./local/register', {
                    errors, 
                    username, 
                    email,
                    password,
                    password2
                })
            } else {
                const newUser = new User({
                    username, 
                    email, 
                    password
                });

                // Hash password
                bcrypt.genSalt(10, (err, salt) => 
                    bcrypt.hash(newUser.password, salt, (err, hash) =>  {
                        if(err) throw err;
                        newUser.password = hash;

                        //Save the user
                        newUser.save()
                            .then(user => {
                                req.flash('success_msg', 'You are now registered and can log in');
                                res.redirect('/local/login')
                            })
                            .catch(err => console.log(err))
                    }))
            }
        })
        .catch()
    }


});

// Login handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/local/redirect',
        failureRedirect: '/local/login',
        failureFlash: true //enable use flash to see the error message;
    })(req, res, next);

});

// Logout handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/local/login');
})


// Call back to customer portal
router.get('/redirect', (req, res) => {
    console.log('/local/redirect', req.user);
    res.redirect(CustomerPortalBackURL + req.user.id);
});


module.exports = router;
