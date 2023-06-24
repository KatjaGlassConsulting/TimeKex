const initialState = {}

/* action */
export function globalConfigSet(config) {
    if (!config.durationCustomers){ config.durationCustomers = [] }
    if (!config.ignoreProjects){ config.ignoreProjects = [] }
    if (!config.metaTimeEntry){ config.metaTimeEntry = [] }
    if (!config.meta){ config.meta = [] }
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