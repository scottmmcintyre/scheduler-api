import axios from 'axios';
import { GET_ERRORS, CLEAR_ERRORS, CLEAR_CURRENT_SHIFT, LOAD_EVENTS_BEGIN, LOAD_EVENTS_SUCCESS, LOAD_RESOURCES_BEGIN, LOAD_RESOURCES_SUCCESS, LOAD_CURRENT_SHIFT_SUCCESS, LOAD_CURRENT_SHIFT_BEGIN} from "./types";

// Create a new Shift
export const createShift = (shiftData, history) => dispatch => {
    dispatch(clearErrors());
    axios.post('/api/shifts/create', shiftData)
        .then(res => history.push('/'))
        .catch(err => 
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            })
        );
};

//load Shifts from the API and convert them into the data format for Calendar component
export const loadEvents = () => dispatch => {
    dispatch(loadEventsBegin());
    axios.get("/api/shifts")
        .then(res => {
            let events = res.data.map(shift => {
                let new_event = {
                    id: shift._id,
                    start: shift.start_date,
                    end: shift.end_date,
                    resourceId: shift.user,
                    title: shift.name
                }
                return new_event;
            })
            dispatch(loadEventsSuccess(events));
        })
        .catch(err => 
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            })
        );
}

export const loadEventsBegin = () => ({
    type: LOAD_EVENTS_BEGIN
})

export const loadEventsSuccess = (events) => ({
    type: LOAD_EVENTS_SUCCESS,
    payload: events
})

//load Resources from the API and convert them into the data format for Calendar component
export const loadResources = () => dispatch => {
    dispatch(loadResourcesBegin());
    axios.get("/api/users")
        .then(res => {
            let resources = res.data.map(user => {
                let new_resource = {
                    id: user._id,
                    name: user.name
                }
                return new_resource;
                })
            dispatch(loadResourcesSuccess(resources))
        })
}

export const loadResourcesBegin = () => ({
    type: LOAD_RESOURCES_BEGIN
})

export const loadResourcesSuccess = (resources) => ({
    type: LOAD_RESOURCES_SUCCESS,
    payload: resources
})


//load a shift into currentShift for editing purposes
export const loadCurrentShift = (shift_id) => dispatch => {
    dispatch(clearErrors())
    dispatch(clearCurrentShift());
    dispatch(loadCurrentShiftBegin());
    axios.get(`/api/shifts/${shift_id}`)
        .then(res => {
            dispatch(loadCurrentShiftSuccess(res.data))
        })
}

export const loadCurrentShiftBegin = () => ({
    type: LOAD_CURRENT_SHIFT_BEGIN
})

export const loadCurrentShiftSuccess = (shift) => ({
    type: LOAD_CURRENT_SHIFT_SUCCESS,
    payload: shift
})

export const editShift = (shiftData, history) => dispatch => {
    dispatch(clearErrors());
    axios.post(`/api/shifts/edit/${shiftData.id}`, shiftData)
        .then(res => history.push('/'))
        .catch(err => 
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            })
        );
}

export const deleteShift = (id) => dispatch => {
    axios.delete(`/api/shifts/${id}`)
        .then(res => {
            dispatch(loadEvents());
        })
}

// Clear errors
export const clearErrors = () => {
    return {
      type: CLEAR_ERRORS
    };
  };

// Clear errors
export const clearCurrentShift = () => {
    return {
      type: CLEAR_CURRENT_SHIFT
    };
  };  