import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { kimaiClient } from '../api/kimaiClient'
import kimaiClientPostGeneric from '../api/kimaiClientPostGeneric'

const initialState = {
    status: 'idle',
    data: {},
    excelWeekStatus: {},
    submitStatus: {},
    nextApprovalWeek: null
}

export const loadAll = createAsyncThunk('approval/loadAll', async ({weeks, config}) => {
    var result = {};

    let apiPrefix = '';
    if (config.bundleApiUpdates){
        apiPrefix = "approval-bundle/";        
    }

    // Get week-status for all available weeks
    for (let index = 0; index < weeks.length; index++) {
        const response = await kimaiClient(apiPrefix + 'week-status?date=' + weeks[index].weekStartDay, config);
        result[weeks[index].weekStartDay] = response;    
    }

    return result
})

export const submitToApproval = createAsyncThunk('approval/submitToApproval', async ({week, config, userID}) => {
    let apiPrefix = '';
    if (config.bundleApiUpdates){
        apiPrefix = "approval-bundle/";
    }
    const response = await kimaiClientPostGeneric(apiPrefix + 'add_to_approve?date=' + week, config, {}, "POST");
    if (response.code && response.code !== 200) {
        console.log(response);
        const customError = {
            ...response,
            name: "submitToApproval Error",
        };
        throw customError;
    }

    const nextApprovalWeek = await kimaiClient(apiPrefix + 'next-week', config);
    return {weekStartDay:week, result: response, nextApprovalWeek: nextApprovalWeek}
})

export const approvalSlice = createSlice({
    name: 'approval',
    initialState,
    reducers: {
        reset: (state) => {
            state.status = 'idle';
            state.data = {};
            state.excelWeekStatus = {};
            state.submitStatus = {};
            state.nextApprovalWeek = null;
        },
        resetSubmitStatus: (state) => {
            state.submitStatus = {}
        },
        updateExcelWeekStatus: (state, action) => {
            if (action.payload.weekStartDay && action.payload.status !== undefined){
                state.excelWeekStatus[action.payload.weekStartDay] = action.payload.status
            }
        },
    },
    extraReducers: {
        [loadAll.pending]: (state) => {
            state.status = 'loading'
        },
        [loadAll.fulfilled]: (state, action) => {
            state.status = 'succeeded'
            state.data = action.payload
        },
        [loadAll.rejected]: (state, action) => {
            state.status = 'failed'
            state.error = action.error.message
        },
        [submitToApproval.pending]: (state, action) => {
            state.submitStatus.status = 'loading'
        },
        [submitToApproval.fulfilled]: (state, action) => {
            const week = action.payload.weekStartDay;
            state.submitStatus.status = 'succeeded'
            state.excelWeekStatus[week] = false
            state.data[week] = 'Submitted'
            state.nextApprovalWeek = action.payload.nextApprovalWeek
        },
        [submitToApproval.rejected]: (state, action) => {
            state.submitStatus.status = 'failed'
            state.submitStatus.error = action.error.message
        },
    },
})

export const { reset, updateExcelWeekStatus, resetSubmitStatus } = approvalSlice.actions
export default approvalSlice.reducer
