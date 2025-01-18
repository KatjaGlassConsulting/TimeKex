import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { kimaiClient } from '../api/kimaiClient'

const initialState = {
    status: 'idle',
    overtimeStatus: {}
}

export const loadOvertimeWeek = createAsyncThunk('approval/loadWeek', async ({week, config}) => {
    var result = {};

    let apiPrefix = '';
    if (config.bundleApiUpdates){
        apiPrefix = "approval-bundle/";
    }

    // Get overtimeStatus for week
    const response = await kimaiClient(apiPrefix + 'overtime_year?date=' + week.weekEndDay, config);
    
    if (typeof response === "object"){
        result[week.weekStartDay] = response;
    } else {
        result[week.weekStartDay] = null;
    }

    return result;
})

export const overtimeSlice = createSlice({
    name: 'overtime',
    initialState,
    reducers: {
        reset: (state) => {
            state.status = 'idle';
            state.overtimeStatus = {};
        },
    },
    extraReducers: {
        [loadOvertimeWeek.pending]: (state) => {
            state.status = 'loading'
        },
        [loadOvertimeWeek.fulfilled]: (state, action) => {
            state.status = 'succeeded'
            state.overtimeStatus = {...state.overtimeStatus, ...action.payload}
        },
        [loadOvertimeWeek.rejected]: (state, action) => {
            state.status = 'failed'
            state.error = action.error.message
        }
    },
})

export const { reset } = overtimeSlice.actions
export default overtimeSlice.reducer
