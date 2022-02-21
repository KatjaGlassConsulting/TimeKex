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

export const fetchAllTimesheets = createAsyncThunk('kimaiTimesheets/fetchAllTimesheets', async (config) => {
    const response = await kimaiClient('timesheets?user=' + config.userId + '&orderBy=begin&order=ASC', config);    
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