const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateEditShift(data) {
    let errors = {}

    //validator only works with strings, so have to check value and replace it with an empty string if empty
    data.start_date = !isEmpty(data.start_date) ? data.start_date : '';
    data.end_date = !isEmpty(data.end_date) ? data.end_date : '';

    if (Validator.isAfter(data.start_date, data.end_date)) {
        errors.end_date = "start_date and end_date must be in chronological order";
    }

    if (!Validator.isISO8601(data.start_date)) {
        errors.start_date = "start_date field is required and must be a valid ISO 8601 string";
    }

    if (!Validator.isISO8601(data.end_date)) {
        errors.end_date = "end_date field is required and must be a valid ISO 8601 string";
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}