import axios from 'axios';
import setAuthToken from '../util/setAuthToken';
import jwt_decode from 'jwt-decode';
import { deleteState } from '../util/stateLoader';

import { GET_ERRORS, CLEAR_ERRORS, SET_CURRENT_USER } from "./types";

// Register User
export const createUser = (userData, history) => dispatch => {
    dispatch(clearErrors());
    axios.post('/api/users/create', userData)
        .then(res => history.push('/login'))
        .catch(err => 
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            })
        );
};

// Login User
export const loginUser = (userData) => dispatch => {
    dispatch(clearErrors());
    axios.post('/api/users/login', userData)
        .then(res => {
            //save to localStorage
            const { token } = res.data;
            //set token to ls
            localStorage.setItem('jwtToken', token);
            // Set token to Auth header
            setAuthToken(token);
            // Decode Token to get user data as an object
            const decoded = jwt_decode(token);
            // Set current user
            dispatch(setCurrentUser(decoded));
        })
        .catch(err => {
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            })
        });
};

//Set the current logged in user
export const setCurrentUser = (decoded) => {
    return {
        type: SET_CURRENT_USER,
        payload: decoded
    }
}

//Log user out
export const logoutUser = () => dispatch =>  {
    // Remove token from local storage
    localStorage.removeItem('jwtToken');
    // Clear application state from local storage
    deleteState();
    // Remove the auth header for future requests
    setAuthToken(false);
    //set current user to an empty object and set isAuthenticated to false
    dispatch(setCurrentUser({}));
}

// Clear errors
export const clearErrors = () => {
    return {
      type: CLEAR_ERRORS
    };
  };