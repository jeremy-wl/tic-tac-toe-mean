/**
 * Created by Jeremy on 6/20/17.
 */

var app = require('../../express')
var userModel = require('../models/user/user.model.server')

var passport = require('passport')

passport.serializeUser(function (user, done) {
    done(null, user._id)
})

passport.deserializeUser(function (_id, done) {
    userModel
        .findUserById(_id)
        .then(function (user) {
            done(null, user)
        }, function (err) {
            done(err, null)
        })
})

var bcrypt = require("bcrypt-nodejs")

/****************************** URL Endpoints *********************************/

app.get   ('/api/user', findUserByCredentials)
app.post  ('/api/login', passport.authenticate('local'), login)
app.post  ('/api/logout', logout)
app.get   ('/api/checkLoggedIn', checkLoggedIn)

app.get   ('/api/user/:userId', findUserById)
app.post  ('/api/user', registerUser)
app.delete('/api/user/:userId', unregisterUser)
app.put   ('/api/user/:userId', updateUser)

/****************************** Local Strategy *********************************/

var LocalStrategy = require('passport-local').Strategy
passport.use(new LocalStrategy(localStrategy))
function localStrategy(username, password, done) {
    userModel
        .findUserByUsername(username)
        .then(
            function(user) {
                if (user && bcrypt.compareSync(password, user.password)) {
                    return done(null, user)
                }
                return done(null, false)   // 如果身份验证失败, 则 false 会直接导致请求中断,
            },                             // 返回 401 Unauthorized, 否则继续执行之后的 login 函数
            function(err) {
                return done(err)
            }
        )
}

/****************************** Google Strategy *********************************/

var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy

var googleConfig = {
    clientID     : process.env.GOOGLE_CLIENT_ID,
    clientSecret : process.env.GOOGLE_CLIENT_SECRET,
    callbackURL  : process.env.GOOGLE_CALLBACK_URL
}

passport.use(new GoogleStrategy(googleConfig, googleStrategy))
app.get('/auth/google',               // redirects to Google, asking for profile and email
    passport.authenticate('google', {
        scope : ['profile', 'email']
    }))
app.get('/auth/google/callback',      // Google will call this url back and redirect for success/failure
    passport.authenticate('google', {
        successRedirect: '/index.html#!/',
        failureRedirect: '/index.html#!/login'
    }))

function googleStrategy(token, refreshToken, profile, done) {
    userModel
        .findUserByGoogleId(profile.id)
        .then(
            function(user) {
                if (user) {
                    return done(null, user)
                } else {
                    var email = profile.emails[0].value
                    var emailParts = email.split("@")
                    var newGoogleUser = {
                        username:  emailParts[0],
                        firstName: profile.name.givenName,
                        lastName:  profile.name.familyName,
                        email:     email,
                        google: {
                            id:    profile.id,
                            token: token
                        }
                    }
                    return userModel.createUser(newGoogleUser)
                }
            },
            function(err) {
                if (err) return done(err)
            }
        )
        .then(
            function(user) {
                return done(null, user)
            },
            function(err) {
                if (err) return done(err)
            }
        )
}

/****************************** Facebook Strategy *********************************/

var FacebookStrategy = require('passport-facebook').Strategy;

var facebookConfig = {
    clientID     : process.env.FACEBOOK_CLIENT_ID,
    clientSecret : process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL  : process.env.FACEBOOK_CALLBACK_URL,
    profileFields: ['id', 'emails', 'name']
}

passport.use(new FacebookStrategy(facebookConfig, facebookStrategy))
app.get('/auth/facebook',               // redirects to Facebook, asking for profile and email
    passport.authenticate('facebook', {
        scope : ['email']
    }))
app.get('/auth/facebook/callback',      // Facebook will call this url back and redirect for success/failure
    passport.authenticate('facebook', {
        // successRedirect: '/index.html#!/', TODO: change back to this
        successRedirect: '/index.html#!/online',
        failureRedirect: '/index.html#!/login'
    }))

function facebookStrategy(token, refreshToken, profile, done) {
    userModel
        .findUserByFacebookId(profile.id)
        .then(
            function(user) {
                if (user) {
                    return done(null, user)
                } else {
                    var email = profile.emails[0].value
                    var emailParts = email.split("@")
                    var newGoogleUser = {
                        username:  emailParts[0],
                        firstName: profile.name.givenName,
                        lastName:  profile.name.familyName,
                        email:     email,
                        facebook: {
                            id:    profile.id,
                            token: token
                        }
                    }
                    return userModel.createUser(newGoogleUser)
                }
            },
            function(err) {
                if (err) return done(err)
            }
        )
        .then(
            function(user) {
                return done(null, user)
            },
            function(err) {
                if (err) return done(err)
            }
        )
}

/****************************** Function Declarations *********************************/

function login(req, res) {
    var user = req.user
    res.json(user)
}

function logout(req, res) {
    req.logout()  // invalidates the current user from the session/cookie
    res.sendStatus(200)
}

function checkLoggedIn(req, res) {
    res.send(req.isAuthenticated() ? req.user : '0')  // isAuthenticated() is a convenient function that checks
}                                                     // if passport has already authenticated the user in the session

function findUserByCredentials(req, res) {
    var username = req.query['username']
    if (username) {
        userModel
            .findUserByUsername(username)
            .then(function (user) {
                if (user) {
                    res.status(200).send({ error: 'The username is already taken.' })
                } else {
                    res.sendStatus(200)
                }
            })
    }
}

function findUserById(req, res) {
    var userId = req.params["userId"]

    userModel
        .findUserById(userId)
        .then(function (user) {
            res.json(user)
        }, function () {
            res.sendStatus(404)
        })
}

function registerUser(req, res) {
    var user = req.body
    user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
    userModel
        .createUser(user)
        .then(
            function (user) {
                if (req.user && req.user.roles.indexOf('ADMIN') >= 0) {
                    res.sendStatus(200)  // Admins creating users from admin portal
                } else {
                    req.logIn(user, function (status) {
                        res.send(status)
                    })
                }
            },

            function (obj) {
                res.status(403).send(obj.errors || obj)
            }
        )
}

function unregisterUser(req, res) {
    var userId = req.params['userId']
    userModel
        .deleteUser(userId)
        .then(function () {
            req.logout()
            res.sendStatus(200)
        })
}

function updateUser(req, res) {
    var newUser = req.body
    userModel
        .updateUser(newUser._id, newUser)
        .then(function (status) {
            res.send(status)
        }, function (obj) {
            res.status(403).send(obj.errors)
        })
}
