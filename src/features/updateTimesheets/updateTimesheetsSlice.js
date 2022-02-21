import {
    createSlice,
    createAsyncThunk,
    createEntityAdapter,
} from '@reduxjs/toolkit'
import { kimaiClientPostTimesheet } from '../../api/kimaiClientPostTimesheet';
import { kimaiClientPostGeneric } from '../../api/kimaiClientPostGeneric';

const updateTimesheetsAdapter = createEntityAdapter({})

const initialState = updateTimesheetsAdapter.getInitialState({
    status: 'idle',
    error: null,
    data: {},
    deleteStatus: 'idle',
    deleteError: {},
    deletedData: {}
})

export const deleteTimesheets = createAsyncThunk('updateTimesheets/deleteTimesheets', async (collection) => {
    const timesheets = collection.data;
    const config = collection.config;
    var result = [];
    var deleteError = {};

    for (let index = 0; index < timesheets.length; index++) {
        var timesheetId = timesheets[index].timesheetId;
        const response = await kimaiClientPostGeneric("timesheets/" + timesheetId, config, {}, "DELETE");
        if (response === null) {
            result.push({ ...timesheets[index], action: "deleted", hasIssue: false });
        }
        else {
            deleteError[timesheetId] = { errorMessage: response.message }
        }
    }
    return { data: result, deleteError: deleteError };
});

export const pushAllTimesheets = createAsyncThunk('updateTimesheets/pushAllTimesheets', async (collection) => {
    const timesheets = collection.data;
    const config = collection.config;
    var result = {};

    for (let index = 0; index < timesheets.length; index++) {
        const response = await kimaiClientPostTimesheet(timesheets[index], config);
        result[timesheets[index].lineNumber] = {};
        result[timesheets[index].lineNumber].responseId = response.id;
        if (response.code && response.code !== 200) {
            var errorText = response.message;
            if (response.errors?.children) {
                for (var key in response.errors.children) {
                    if (response.errors.children[key].errors) {
                        errorText = errorText + " - " + key + " : " + response.errors.children[key].errors.join(", ");
                    }
                }
            }
            result[timesheets[index].lineNumber].hasIssue = true;
            result[timesheets[index].lineNumber].responseCode = response.code;
            result[timesheets[index].lineNumber].error = true;
            result[timesheets[index].lineNumber].errorMessage = errorText;
        }
        else {
            result[timesheets[index].lineNumber].hasIssue = false;
        }
    }
    return result;
});


export function reset() {
    return { type: "updateTimesheets/reset", payload: {} };
};

const updateTimesheetsSlice = createSlice({
    name: 'updateTimesheets',
    initialState,
    reducers: {
        reset: (state, action) => {
            state.status = 'idle'
            state.error = null
            state.data = {}
            state.deleteStatus = 'idle'
            state.deleteError = {}
            state.deletedData = {}
        }
    },
    extraReducers: {
        [pushAllTimesheets.pending]: (state, action) => {
            state.status = 'loading'
        },
        [pushAllTimesheets.fulfilled]: (state, action) => {
            state.status = 'succeeded'
            state.data = action.payload;
        },
        [pushAllTimesheets.rejected]: (state, action) => {
            state.status = 'failed'
            state.error = action.error.message
        },
        [deleteTimesheets.pending]: (state, action) => {
            state.deleteStatus = 'loading'
        },
        [deleteTimesheets.fulfilled]: (state, action) => {
            state.deleteStatus = 'succeeded'
            state.deletedData = action.payload.data;
            state.deleteError = action.payload.deleteError;
        },
        [deleteTimesheets.rejected]: (state, action) => {
            state.deleteStatus = 'failed'
            state.deleteError = action.error.message
        }
    },
})

export default updateTimesheetsSlice.reducer
