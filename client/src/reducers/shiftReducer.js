import { LOAD_EVENTS, LOAD_RESOURCES } from "../actions/types";

const initialState = {
    events: [],
    resources: []
}

export default function(state = initialState, action) {
    switch(action.type) {
        case LOAD_EVENTS:
            return {
                ...state,
                events: action.payload
            }
        case LOAD_RESOURCES:
            return {
                ...state,
                resources: action.payload
            }
        default:
            return state;
    }
}