const initialState = []

/* action */
export function messagesAppend(message) {
    return { type: "messages/append", payload: message };
};

export function messagesSet(message) {
    return { type: "messages/set", payload: message };
};

export function messagesReset() {
    return { type: "messages/reset", payload: null };
};

/* reducer */
export function messagesReducer(state = initialState, action) {
    switch (action.type) {
        case 'messages/set': {
            return action.payload
        }
        case 'messages/append': {
            return [...initialState, action.payload]
        }
        case 'messages/reset': {
            return []
        }
        default:
            return state
    }
} 