import { LOAD_EVENTS_BEGIN, LOAD_EVENTS_SUCCESS, LOAD_RESOURCES_BEGIN, LOAD_RESOURCES_SUCCESS, LOAD_CURRENT_SHIFT_SUCCESS, LOAD_CURRENT_SHIFT_BEGIN, CLEAR_CURRENT_SHIFT } from "../actions/types";

const initialState = {
    loadingEvents: false,
    loadingResources: false,
    loadingCurrentShift: false,
    events: [],
    resources: [],
    currentShift: {}
}

export default function(state = initialState, action) {
    switch(action.type) {
        case LOAD_EVENTS_BEGIN:
            return {
                ...state,
                loadingEvents: true
            }
        case LOAD_EVENTS_SUCCESS:
            return {
                ...state,
                loadingEvents: false,
                events: action.payload
            }
        case LOAD_RESOURCES_BEGIN:
            return {
                ...state,
                loadingResources: true
            }
        case LOAD_RESOURCES_SUCCESS:
            return {
                ...state,
                loadingResources: false,
                resources: action.payload
            }
        case LOAD_CURRENT_SHIFT_BEGIN:
            return {
                ...state,
                loadingCurrentShift: true
            }
        case LOAD_CURRENT_SHIFT_SUCCESS:
            return {
                ...state,
                loadingCurrentShift: false,
                currentShift: action.payload
            }
        case CLEAR_CURRENT_SHIFT:
            return {
                ...state,
                currentShift: {}
            }
        default:
            return state;
    }
}