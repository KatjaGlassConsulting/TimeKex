import {
    createSlice,
    createAsyncThunk,
    createEntityAdapter,
} from '@reduxjs/toolkit'
import { kimaiClient } from '../../api/kimaiClient'

const kimaiDBAdapter = createEntityAdapter({})

const initialState = kimaiDBAdapter.getInitialState({
    status: 'idle',
    error: null,
    userId: null,
    data: []
})

export function reset() {
    return { type: "kimaiTimesheets/reset", payload: {} };
};

export const fetchAllTimesheets = createAsyncThunk('kimaiTimesheets/fetchAllTimesheets', async (config) => {
    const response = await kimaiClient('timesheets?user=' + config.userId + '&orderBy=begin&order=DESC&size=1000', config);    
    if (response.code && response.code !== 200) {
        const customError = {
            ...response,
            name: "fetchAllTimesheets Error",
        };
        throw customError;
    }
    return response;
})

const kimaiTimesheetsSlice = createSlice({
    name: 'kimaiTimesheets',
    initialState,
    reducers: {
        reset: (state, action) => {
            state.status = 'idle';
            state.error = null;
            state.userId = null;
            state.data = [];
        }
    },
    extraReducers: {
        [fetchAllTimesheets.pending]: (state, action) => {
            state.status = 'loading'
        },
        [fetchAllTimesheets.fulfilled]: (state, action) => {
            state.status = 'succeeded';
            state.data = action.payload;
        },
        [fetchAllTimesheets.rejected]: (state, action) => {
            state.status = 'failed'
            state.error = action.error.message
        }
    },
})

export default kimaiTimesheetsSlice.reducer