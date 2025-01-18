import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { kimaiClient } from '../api/kimaiClient'

const initialState = {
    status: 'idle',
    overtimeOverviewData: {}
}

export const loadOvertimeOverviewYear = createAsyncThunk('approval/loadWeek', async ({dateString, config}) => {
    var result = {};

    let apiPrefix = '';
    if (config.bundleApiUpdates){
        apiPrefix = "approval-bundle/";
    }

    // Get overtimeStatus for week
    const response = await kimaiClient(apiPrefix + 'weekly_overtime?date=' + dateString, config);
    
    if (Array.isArray(response)){
        result[dateString.substr(0,4)] = response;
    } else {
        result[dateString.substr(0,4)] = null;
    }

    return result;
})

export const overtimeOverviewSlice = createSlice({
    name: 'overtimeOverview',
    initialState,
    reducers: {
        reset: (state) => {
            state.status = 'idle';
            state.overtimeOverviewData = {};
        },
    },
    extraReducers: {
        [loadOvertimeOverviewYear.pending]: (state) => {
            state.status = 'loading'
        },
        [loadOvertimeOverviewYear.fulfilled]: (state, action) => {
            state.status = 'succeeded'
            state.overtimeOverviewData = {...state.overtimeOverviewData, ...action.payload}
        },
        [loadOvertimeOverviewYear.rejected]: (state, action) => {
            state.status = 'failed'
            state.error = action.error.message
        }
    },
})

export const { reset } = overtimeOverviewSlice.actions
export default overtimeOverviewSlice.reducer
