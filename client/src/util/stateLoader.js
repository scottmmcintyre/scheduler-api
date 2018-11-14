export const loadState = () => {
    try {
        let serializedState = localStorage.getItem("scheduler-api-state");

        if (serializedState === null) {
            return undefined;
        }

        return JSON.parse(serializedState);
    }
    catch (err) {
        return undefined;
    }
}

export const saveState = (state) => {
    try {
        let serializedState = JSON.stringify(state);
        localStorage.setItem("scheduler-api-state", serializedState);
    }
    catch (err) {
        //do nothing and let state be built as normal
    }
}

export const deleteState = () => {
    try {
        localStorage.removeItem("scheduler-api-state");
    }
    catch (err) {

    }
}