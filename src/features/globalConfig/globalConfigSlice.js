const initialState = {}

/* action */
export function globalConfigSet(config) {
    return { type: "config/globalConfigChanged", payload: config };
};

/* reducer */
export function globalConfigReducer(state = initialState, action) {
    switch (action.type) {
        case 'config/globalConfigChanged': {
            return action.payload 
        }
        default:
            return state
    }
} 