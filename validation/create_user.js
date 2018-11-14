const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateCreateUser(data) {
    let errors = {}

    //validator only works with strings, so have to check value and replace it with an empty string if empty
    data.username = !isEmpty(data.username) ? data.username : '';
    data.name = !isEmpty(data.name) ? data.name : '';
    data.email = !isEmpty(data.email) ? data.email : '';
    data.password = !isEmpty(data.password) ? data.password : '';
    data.password2 = !isEmpty(data.password2) ? data.password2 : '';
    data.role = !isEmpty(data.role) ? data.role : '';

    if (Validator.isEmpty(data.name)) {
        errors.name = "name field is required";
    }

    if (Validator.isEmpty(data.email)) {
        errors.email = "email field is required";
    }

    if (Validator.isEmpty(data.username)) {
        errors.username = "username field is required, and must be unique";
    }

    if (Validator.isEmpty(data.password)) {
        errors.password = "password field is required";
    }

    if (!Validator.equals(data.role, 'manager') && !Validator.equals(data.role, 'employee')) {
        errors.role = "role must be either manager or employee (string)";
    }

    if (Validator.isEmpty(data.role)) {
        errors.role = "role field is required";
    }

    if (!Validator.equals(data.password, data.password2)) {
        errors.password2 = "passwords must match";
    }

    if (Validator.isEmpty(data.password2)) {
        errors.password2 = "password2 (confirm password) field is required";
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}