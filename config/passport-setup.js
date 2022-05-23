//************************************** */
// Step #2 configure third party authentication strategy
//************************************** */

//************************************** */
// Passport strategies:
// - Google
// - Facebook
// - Twitter
// - Linkedin
// - Local strategy
//************************************** */


const passport = require('passport');

const GoogleStrategy = require('passport-google-oauth20');
const FacebookStrategy = require('passport-facebook');
const TwitterStrategy = require('passport-twitter');
const localStrategy = require('passport-local').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const LineStrategy = require('passport-line-auth');

const bcrypt = require('bcryptjs');

const keys = require('./keys');
const User = require('../models/user-model');

passport.serializeUser((user, done) => {
    //mongodb id: _id, but you can use it just as id
    console.log('serialize', user.id);
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        console.log('deserialize', user);
        done(null, user); //add user to req ???
    });
});



// Google strategy
//------------------
passport.use(
    new GoogleStrategy(
        // param #1: Options for the google stategy
        {
            callbackURL: '/auth/google/redirect',
            clientID: keys.google.clientID,
            clientSecret: keys.google.clientSecret
        },
        // param #2: callback function fired by passport 
        (accessToken, refreshToken, profile, done) => {
            // passport callback funciton 

            console.log('Google Strategy', profile);

            // Check if user already exists
            
            User.findOne({ thirdpartyid: 'google-' + profile.id }).then((currentUser) => {
                if (currentUser) {
                    // already have the user
                    console.log('user is realdy in DB', currentUser);
                    done(null, currentUser); // trigger the serializeUser call to create cookie
                } else {
                    // if not, create user in DB            
                    user = new User({
                        username: profile.displayName,
                        thirdpartyid: 'google-' + profile.id,
                        thumbnail: profile._json.picture
                    });
                    user.save()
                        .then((newUser) => {
                            console.log('new user created:' + newUser);
                            done(null, newUser); // trigger the serializeUser call to create cookie
                        });
                };
            })
            
            
        }
    )
);

// Facebook Strategy
//------------------
passport.use(
    new FacebookStrategy(
        {
            clientID: keys.facebook.clientID,
            clientSecret: keys.facebook.clientSecret,
            callbackURL: '/auth/facebook/redirect'
        },
        function (accessToken, refreshToken, profile, done) {
            // In this example, the user's Facebook profile is supplied as the user
            // record.  In a production-quality application, the Facebook profile should
            // be associated with a user record in the application's database, which
            // allows for account linking and authentication with other identity
            // providers.
            console.log("facebook:", profile);

            User.findOne({ thirdpartyid: 'facebook-' + profile.id }).then((currentUser) => {
                if (currentUser) {
                    // already have the user
                    console.log('user is realdy in DB', currentUser);
                    done(null, currentUser); // trigger the serializeUser call to create cookie
                } else {
                    user = new User({
                        username: profile.displayName,
                        thirdpartyid: 'facebook-' + profile.id,
                        thumbnail: null
                    }).save()
                        .then((newUser) => {
                            console.log('new user created:' + newUser);
                            done(null, newUser)
                        });
                }
            });
        })
);

// Twitter strategy
//------------------
passport.use(
    new TwitterStrategy(
        {
            consumerKey: keys.twitter.clientID,
            consumerSecret: keys.twitter.clientSecret,
            callbackURL: '/auth/twitter/redirect',
            //proxy: trustProxy
        },
        function (accessToken, refreshToken, profile, done) {

            console.log("Twitter strategy:", profile);

            User.findOne({ thirdpartyid: 'twitter-' + profile.id }).then((currentUser) => {
                if (currentUser) {
                    // already have the user
                    console.log('user is realdy in DB', currentUser);
                    done(null, currentUser); // trigger the serializeUser call to create cookie
                } else {
                    new User({
                        username: profile.displayName,
                        thirdpartyid: 'twitter-' + profile.id,
                        thumbnail: profile._json.profile_image_url
                    }).save()
                        .then((newUser) => {
                            console.log('new user created:' + newUser);
                            done(null, newUser)
                        });
                }
            });
        })
);

//Linkedin strategy
//-------------------

passport.use(
    new LinkedInStrategy(
        {
            clientID: keys.linkedin.clientID,
            clientSecret: keys.linkedin.clientSecret,
            callbackURL: "/auth/linkedin/redirect",
            //scope: ['r_emailaddress', 'r_basicprofile'],
            state: true
        },
        function (accessToken, refreshToken, profile, done) {

            console.log("Linkedin strategy:", profile);

            // asynchronous verification, for effect...
            process.nextTick(function () {
                // To keep the example simple, the user's LinkedIn profile is returned to
                // represent the logged-in user. In a typical application, you would want
                // to associate the LinkedIn account with a user record in your database,
                // and return that user instead.

                User.findOne({ thirdpartyid: 'linkedin-' + profile.id }).then((currentUser) => {
                    if (currentUser) {
                        // already have the user
                        console.log('user is realdy in DB', currentUser);
                        done(null, currentUser); // trigger the serializeUser call to create cookie
                    } else {
                        new User({
                            username: profile.displayName,
                            thirdpartyid: 'linkedin-' + profile.id,
                            thumbnail: profile.photos[0].value
                        }).save()
                            .then((newUser) => {
                                console.log('new user created:' + newUser);
                                done(null, newUser)
                            });
                    }
                });
                //return done(null, profile);
            });
        })
);


// LINE strategy
//------------------
passport.use(new LineStrategy(
    {
        channelID: keys.line.clientID,
        channelSecret: keys.line.clientSecret,
        callbackURL: "/auth/line/redirect",
        scope: ['profile', 'openid'],
        botPrompt: 'normal'
    },
    function (accessToken, refreshToken, profile, done) {
        console.log("Line strategy:", profile);

        User.findOne({ thirdpartyid: 'line-' + profile.id }).then((currentUser) => {
            if (currentUser) {
                // already have the user
                console.log('user is realdy in DB', currentUser);
                done(null, currentUser); // trigger the serializeUser call to create cookie
            } else {
                new User({
                    username: profile.displayName,
                    thirdpartyid: 'line-' + profile.id,
                    thumbnail: profile.pictureUrl
                }).save()
                    .then((newUser) => {
                        console.log('new user created:' + newUser);
                        done(null, newUser)
                    });
            }
        });

    })
);


// Local strategy
//------------------
passport.use(
    new localStrategy({ usernameField: 'email' }, (email, password, done) => {
        // Match user
        User.findOne({ email: email })
            .then(user => {
                if (!user) {
                    return done(null, false, { message: 'That email is not registered' });
                }

                // Match password
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err;
                    if (isMatch) {
                        console.log('Local strategy', user);
                        return done(null, user);
                    } else {
                        console.log("login error");
                        return done(null, false, { message: 'Password incorrect' })
                    }
                });
            })
            .catch(err => console.log(err));
    })
);