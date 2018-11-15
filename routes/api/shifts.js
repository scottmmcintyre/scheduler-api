const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//load validation functions
const validateCreateShift = require('../../validation/create_shift');
const validateEditShift = require('../../validation/edit_shift');

//load Shift model
const Shift = require('../../models/Shift');

// @route   Get api/shifts
// @desc    Get all shifts with optional start and end date in ISO 8601 format, returns all shifts inclusive between two values
// @access  Public
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

// @route Post api/shifts/create
// @desc Create a shift
// @access Private
router.post('/create', passport.authenticate('jwt', { session: false }), (req, res) => {

    var { errors, isValid } = validateCreateShift(req.body);

    if(!isValid) {
        res.status(400).json(errors);
    }

    var start_date = new Date(req.body.start_date);
    var end_date = new Date(req.body.end_date);

    //if a user is specified in the req body, use that, otherwise set user as the requesting user
    var user_id = req.body.user ? req.body.user : req.user.id;

    //check if the new shift's start or end date lies between an existing shift's start and end date, if not then create new shift
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
                new_shift.save().then(shift => res.json(shift));
            } else {
                res.status(400).json({start_date: 'Overlaps with existing shift for user', end_date: 'Overlaps with existing shift for user'})
            }
        })
});

// @route Post api/shifts/edit/:id
// @desc Edit a single shift by id
// @access Private
router.post('/edit/:id', passport.authenticate('jwt', { session: false}), (req, res) => {

    var { errors, isValid } = validateEditShift(req.body);

    if(!isValid) {
        res.status(400).json(errors);
    }

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
                res.json(shift);
            })
            .catch( err => res.status(404).json({shiftnotfound: 'No shift found by that id and user'}));
        } else {
            res.status(400).json({start_date: 'Overlaps with existing shift for user', end_date: 'Overlaps with existing shift for user'})
        }
    })    
});

// @route Get api/shifts/:id
// @desc View a single shift by id
// @access Public
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

// @route Delete api/shifts/:id
// @desc Delete a shift by id
// @access Private
router.delete('/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    Shift.findById(req.params.id)
        .then(shift => {
            shift.remove().then(() => res.json({success: true}))
        })
        .catch( err => res.status(404).json({shiftnotfound: 'No shift found with that id'}));
});

module.exports = router; 