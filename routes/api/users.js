const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

//load validation functions
const validateCreateUser = require('../../validation/create_user');

//load the User model for use in our routes
const User = require('../../models/User');

// @route Post api/users/create
// @desc Create a user
// @access Public
router.post('/create', (req, res) => {

    var { errors, isValid } = validateCreateUser(req.body);
    
    //Check validation
    if(!isValid) {
        return res.status(400).json(errors);
    }

    //Check for existing username in system, if none, create new user
    User.findOne({ username: req.body.username })
        .then(user => {
            if(user) {
                return res.status(400).json({ username: 'Username already taken'});
            } else {
                const new_user = new User({
                    username: req.body.username,
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                    role: req.body.role
                });
                
                //hash password and store it
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(new_user.password, salt, (err, hash) => {
                        if (err) throw err;
                        new_user.password = hash;
                        new_user.save()
                            .then( user => res.json(user))
                            .catch( err => console.log(err));
                    });
                });
            }
        });

});

// @route Post api/users/edit/:id
// @desc Edit a user. Employees can only edit their own user, managers can edit all users
// @access Private
router.post('/edit/:id', passport.authenticate('jwt', {session: false}), (req, res) => {

    //TODO: add validation
    if(req.params.id != req.user.id && req.user.role != 'manager') {
        res.status(401).json({wronguser: "You can only edit your own user"})
    }

    var update_fields = {};

    if (req.body.name) { update_fields.name = req.body.name };
    if (req.body.email) { update_fields.email = req.body.email };
    if (req.body.role) { update_fields.role = req.body.role };

    User.findOneAndUpdate({_id: req.params.id}, { $set: update_fields }, {new: true})
        .then(user => {
            if (user) {
                if (req.body.password) {
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(req.body.password, salt, (err, hash) => {
                            if (err) throw err;
                            user.password = hash;
                            user.save()
                                .then( user => res.json(user))
                                .catch( err => console.log(err));
                        });
                    });
                } else {
                    res.json(user);
                }
            } else {
                res.status(404).json({usernotfound: 'No user found by that id'});
            }
        })
        .catch(err => res.status(404).json({usernotfound: 'No user found by that id'}));
});

// @route   Post api/users/login
// @desc    Logs in a user, returns a JWT bearer token
// @access  Public
router.post('/login', (req, res) => {
    User.findOne({username: req.body.username})
        .then( user => {
            if(!user) {
                return res.status(404).json({username: 'User not found'});
            }
            bcrypt.compare(req.body.password, user.password)
                .then(matched => {
                    if(matched) {
                        //define a payload for the JWT
                        const payload = { user_id: user.id, name: user.name, role: user.role };
                        
                        //now sign the token, set expiration and send it along
                        jwt.sign(payload, keys.secretOrKey, { expiresIn: 7200 }, (error, token) => {
                            res.json({
                                success: true,
                                token: 'Bearer ' + token
                            });
                        });
                    } else {
                        return res.status(400).json({ password: 'Password incorrect'});
                    }
                });
        });
});


module.exports = router;