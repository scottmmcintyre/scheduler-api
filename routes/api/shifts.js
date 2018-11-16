const express = require('express');
const router = express.Router();
const passport = require('passport');

//load validation functions
const validateCreateShift = require('../../validation/create_shift');
const validateEditShift = require('../../validation/edit_shift');

//load Shift model
const Shift = require('../../models/Shift');

/**
 * @swagger
 * definition:
 *   shifts:
 *     properties:
 *       _id:
 *         type: string
 *         format: uuid
 *       name:
 *         type: string
 *       start_date:
 *         type: string
 *         format: date-time
 *       end_date:
 *         type: string
 *         format: date-time
 *       user:
 *         type: string
 */

/**
 * @swagger
 * /api/shifts:
 *   get:
 *     tags:
 *       - shifts
 *     description: Get all shifts with optional start and end date in ISO 8601 format, returns all shifts inclusive between the two dates
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: start_date
 *         type: string
 *         format: date-time
 *         description: Lower bound of shift dates returned
 *       - in: query
 *         name: end_date
 *         type: string
 *         format: date-time
 *         description: Upper bound of shift dates returned
 *     responses:
 *       200:
 *         description: An array of shift objects
 *         schema:
 *           $ref: '#/definitions/shifts'
 *       404:
 *         description: No shifts found
 */
router.get('/', (req, res) => {
    var start_date = req.query.start_date;
    var end_date = req.query.end_date;

    var query = {};

    if(start_date) {
        query.start_date = { $gte: new Date(start_date) };
    }

    if(end_date) {
        query.end_date = { $lte: new Date(end_date) };
    }

    Shift.find(query)
        .sort({ start_date: 1})
        .then(shifts => {
            //Returning the string representation of the date as entered, Mongoose wants to convert it to an ISO string in UTC time because JS
            let string_date_shifts = shifts.map(shift => {
                let fixed_shift = {
                    "_id": shift._id,
                    "name": shift.name,
                    "start_date": shift.start_date_string,
                    "end_date": shift.end_date_string,
                    "user": shift.user
                }
                return fixed_shift;
            })
            res.json(string_date_shifts);
        })
        .catch(err => res.status(404).json({noshiftsfound: 'No shifts found'}))
});

/**
 * @swagger
 * /api/shifts/create:
 *   post:
 *     security:
 *       - JWT: []
 *     tags:
 *       - shifts
 *     description: Create a shift
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: shift
 *         required: true
 *         description: The shift to create. Dates should be in ISO 8601 format. If no user is provided, defaults to auth user
 *         schema:
 *           type: object
 *           required:
 *             - name
 *             - start_date
 *             - end_date
 *           properties:
 *             name:
 *               type: string
 *             start_date:
 *               type: string
 *               format: date-time
 *             end_date:
 *               type: string
 *               format: date-time
 *             user:
 *               type: string
 *     responses:
 *       200:
 *         description: Inserts the new shift into the DB and returns the new shift object
 *         schema:
 *           $ref: '#/definitions/shifts'
 *       400:
 *         description: Error object from validator. Will be rejected if shift dates overlap with an existing shift for the user
 *       401:
 *         description: Unauthorized
 */
router.post('/create', passport.authenticate('jwt', { session: false }), (req, res) => {

    var { errors, isValid } = validateCreateShift(req.body);

    if(!isValid) {
        res.status(400).json(errors);
    } else {

        var start_date = new Date(req.body.start_date);
        var end_date = new Date(req.body.end_date);

        //if a user is specified in the req body, use that, otherwise set user as the requesting user
        var user_id = req.body.user ? req.body.user : req.user.id;

        //check if the new shift's start or end date lies between an existing shift's start and end date for that user, if not then create new shift
        Shift.findOne({ $and: [
            { $or: [
                { start_date: { $lte: start_date }, end_date: { $gte: start_date}},
                { start_date: { $lte: end_date }, end_date: { $gte: end_date }}
            ]},
            { user: { $eq: user_id }}
        ]})
            .then(shift => {
                if(!shift) {
                    //this is a pain, but JS sucks with dates so I'm storing the ISO date string as a pure string (local time) and as a Date for querying purposes
                    const new_shift = new Shift({
                        name: req.body.name,
                        start_date: req.body.start_date,
                        end_date: req.body.end_date,
                        start_date_string: req.body.start_date,
                        end_date_string: req.body.end_date,
                        user: user_id
                    });
                    new_shift.save().then(shift => {
                        //Returning the string representation of the date as entered, Mongoose wants to convert it to an ISO string in UTC time because JS
                        let fixed_shift = {
                            "_id": shift._id,
                            "name": shift.name,
                            "start_date": shift.start_date_string,
                            "end_date": shift.end_date_string,
                            "user": shift.user
                        }
                        res.json(fixed_shift);
                    })
                    .catch(err => console.log(err));
                } else {
                    res.status(400).json({start_date: 'Overlaps with existing shift for user', end_date: 'Overlaps with existing shift for user'})
                }
            })
            .catch(
                //validator.js and mongoose apparently disagree on what a valid ISO 8601 string is, so I'm not logging this catch to avoid cluttering the console with a warning I'm seeing.
            );
    }
});

/**
 * @swagger
 * /api/shifts/edit/{id}:
 *   post:
 *     security:
 *       - JWT: []
 *     tags:
 *       - shifts
 *     description: Edit a shift by id
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *         description: The shift id
 *       - in: body
 *         name: shift
 *         description: The new dates for the shift. Dates should be in ISO 8601 format. No other fields may be changed
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             start_date:
 *               type: string
 *               format: date-time
 *             end_date:
 *               type: string
 *               format: date-time
 *     responses:
 *       200:
 *         description: Updates the shift object in the DB and returns the shift object
 *         schema:
 *           $ref: '#/definitions/shifts'
 *       400:
 *         description: Error object from validator. Will be rejected if shift dates overlap with an existing shift for the user (other than the shift that is being edited)
 *       401:
 *         description: Unauthorized
 */
router.post('/edit/:id', passport.authenticate('jwt', { session: false}), (req, res) => {

    var { errors, isValid } = validateEditShift(req.body);

    if(!isValid) {
        res.status(400).json(errors);
    } else {

        var start_date = new Date(req.body.start_date);
        var end_date = new Date(req.body.end_date);

        //if a user is specified in the body use that, otherwise use the logged in user (token bearer)
        var user_id = req.body.user ? req.body.user : req.user.id;

        //check if the new shift's start or end date lies between this user's existing shift start and end dates (excluding itself), if not then save the changes
        Shift.findOne({ $and: [
            { $or: [
                { start_date: { $lte: start_date }, end_date: { $gte: start_date }},
                { start_date: { $lte: end_date }, end_date: { $gte: end_date }}
            ]},
            { _id: { $ne: req.params.id }},
            { user: { $eq: user_id }}
        ]})
        .then(shift => {
            if(!shift) {
                Shift.findOneAndUpdate({_id: req.params.id}, {$set: { start_date: start_date, end_date: end_date, start_date_string: req.body.start_date, end_date_string: req.body.end_date}}, {new: true})
                .then(shift => {
                    //Returning the string representation of the date as entered, Mongoose wants to convert it to an ISO string in UTC time because JS
                    let fixed_shift = {
                        "_id": shift._id,
                        "name": shift.name,
                        "start_date": shift.start_date_string,
                        "end_date": shift.end_date_string,
                        "user": shift.user
                    }
                    res.json(fixed_shift);
                })
                .catch( err => res.status(404).json({shiftnotfound: 'No shift found by that id and user'}));
            } else {
                res.status(400).json({start_date: 'Overlaps with existing shift for user', end_date: 'Overlaps with existing shift for user'})
            }
        })
        .catch(
            //validator.js and mongoose apparently disagree on what a valid ISO 8601 string is, so I'm not logging this catch to avoid cluttering the console with a warning I'm seeing.
        );    
    }
});

/**
 * @swagger
 * /api/shifts/{id}:
 *   get:
 *     tags:
 *       - shifts
 *     description: Get a single shift by id
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *         description: The shift id
 *     responses:
 *       200:
 *         description: The requested shift object
 *         schema:
 *           $ref: '#/definitions/shifts'
 *       404:
 *         description: No shift found with that id
 */
router.get('/:id', (req, res) => {
    Shift.findById(req.params.id)
        .then(shift => {
            //Returning the string representation of the date as entered, Mongoose wants to convert it to an ISO string in UTC time because JS
            let fixed_shift = {
                "_id": shift._id,
                "name": shift.name,
                "start_date": shift.start_date_string,
                "end_date": shift.end_date_string,
                "user": shift.user
            }
            res.json(fixed_shift);
        })
        .catch( err => res.status(404).json({shiftnotfound: 'No shift found with that id'}));
});

/**
 * @swagger
 * /api/shifts/{id}:
 *   delete:
 *     security:
 *       - JWT: []
 *     tags:
 *       - shifts
 *     description: Delete a single shift by id
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *         description: The shift id
 *     responses:
 *       200:
 *         description: A success object
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *       404:
 *         description: No shift found with that id
 */
router.delete('/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    Shift.findById(req.params.id)
        .then(shift => {
            shift.remove().then(() => res.json({success: true}))
        })
        .catch( err => res.status(404).json({shiftnotfound: 'No shift found with that id'}));
});

module.exports = router; 