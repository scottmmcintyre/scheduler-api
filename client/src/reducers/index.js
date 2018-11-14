import { combineReducers } from 'redux';
import authReducer from './authReducer';
import errorReducer from './errorReducer';
import shiftReducer from './shiftReducer';

export default combineReducers({
    auth: authReducer,
    errors: errorReducer,
    shift: shiftReducer
});