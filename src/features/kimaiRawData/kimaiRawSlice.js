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
    customersFull: [],
    projectsFull: [],
    activitiesFull: [],
    trigger: -1
})

export const fetchRawData = createAsyncThunk('kimaiRawData/fetchRawData', async ({config, trigger = -1}) => {    
    var result = {};   
    const responseCustomers = await kimaiClient('customers', config); 
    const responseProjects = await kimaiClient('projects?visible=3&ignoreDates=1', config);    
    const responseActivities = await kimaiClient('activities?visible=3', config);

    result.customers = responseCustomers;
    result.projects = responseProjects;
    result.activities = responseActivities;
    result.trigger = trigger;

    return result;
})

const kimaiRawSlice = createSlice({
    name: 'kimaiRawData',
    initialState,
    reducers: {},
    extraReducers: {
        [fetchRawData.pending]: (state, action) => {
            state.status = 'loading'
        },
        [fetchRawData.fulfilled]: (state, action) => {
            state.status = 'succeeded';
            state.customersFull = action.payload.customers;
            state.projectsFull = action.payload.projects;
            state.activitiesFull = action.payload.activities;
            state.trigger = action.payload.trigger;
        },
        [fetchRawData.rejected]: (state, action) => {
            state.status = 'failed'
            state.error = action.error.message
        }
    },
})

export default kimaiRawSlice.reducer
