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

/**
 * @swagger
 * definition:
 *   users:
 *     properties:
 *       _id:
 *         type: string
 *         format: uuid
 *       username:
 *         type: string
 *       name:
 *         type: string
 *       email:
 *         type: string
 *       password:
 *         type: string
 *       role:
 *         type: string
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags:
 *       - users
 *     description: Get all users
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of user objects
 *         schema:
 *           type: object
 *           properties:
 *             _id: 
 *               type: string
 *             username: 
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             role:
 *               type: string
 *       404:
 *         description: No users found
 */
router.get('/', (req, res) => {
    User.find()
        .then(users => {
            let no_pass_users = users.map(user => {
                let temp_user = {
                    _id: user.id,
                    username: user.username,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
                return temp_user;
            })
            res.json(no_pass_users);
        })
        .catch(err => res.status(404).json({noshiftsfound: 'No users found'}));
});

/**
 * @swagger
 * /api/users/create:
 *   post:
 *     tags:
 *       - users
 *     description: Create a user
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: user
 *         required: true
 *         description: The user to create
 *         schema:
 *           type: object
 *           properties:
 *             username:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             password:
 *               type: string
 *             role:
 *               type: string
 *     responses:
 *       200:
 *         description: Inserts the new user into the DB and returns the new user object
 *         schema:
 *           $ref: '#/definitions/users'
 *       400:
 *         description: Error object from validator. Will be rejected if shift dates overlap with an existing shift for the user
 */
router.post('/create', (req, res) => {

    var { errors, isValid } = validateCreateUser(req.body);

    //Check validation
    if(!isValid) {
        return res.status(400).json(errors);
    } else {
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
            })
            .catch(err => console.log(err));
    }
});

// @route Post api/users/edit/:id
// @desc Edit a user. Employees can only edit their own user, managers can edit all users
// @access Private
/**
 * @swagger
 * /api/users/edit/{id}:
 *   post:
 *     security:
 *       - JWT: []
 *     tags:
 *       - users
 *     description: Edit a user by id
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *         description: The user id
 *       - in: body
 *         name: shift
 *         description: All fields optional. Username cannot be changed.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             role:
 *               type: string
 *             password:
 *               type: string
 *     responses:
 *       200:
 *         description: Updates the user object in the DB and returns the user object
 *         schema:
 *           $ref: '#/definitions/users'
 *       400:
 *         description: Error object from validator. Will be rejected if shift dates overlap with an existing shift for the user (other than the shift that is being edited)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found with that id
 */
router.post('/edit/:id', passport.authenticate('jwt', {session: false}), (req, res) => {

    if(req.params.id != req.user.id && req.user.role != 'manager') {
        res.status(400).json({wronguser: "You can only edit your own user"})
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

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     tags:
 *       - users
 *     description: Login in a user and receive a JWT
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: user-login
 *         description: The user's login information
 *         schema:
 *           type: object
 *           required: 
 *             - username
 *             - password
 *           properties:
 *             username:
 *               type: string
 *             password:
 *               type: string
 *     responses:
 *       200:
 *         description: Returns an object containing a success bool and a JWT Bearer token for auth
 *       400:
 *         description: Error object from validator
 *       404:
 *         description: User not found
 */
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
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
});

module.exports = router;