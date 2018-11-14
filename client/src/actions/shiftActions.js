import axios from 'axios';
import { GET_ERRORS, LOAD_EVENTS, LOAD_RESOURCES} from "./types";

// Create a new Shift
export const createShift = (shiftData, history) => dispatch => {
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

            dispatch({
                type: LOAD_EVENTS,
                payload: events
            })
        })
}

//load Resources from the API and convert them into the data format for Calendar component
export const loadResources = () => dispatch => {
    axios.get("/api/users")
        .then(res => {
            let resources = res.data.map(user => {
                let new_resource = {
                    id: user._id,
                    name: user.name
                }
                return new_resource;
                })

            dispatch({
                type: LOAD_RESOURCES,
                payload: resources
            })
        })
}