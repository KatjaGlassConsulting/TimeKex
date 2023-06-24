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
    deleteError: {},
    deletedData: {}
})

export const processTimesheets = createAsyncThunk('updateTimesheets/processTimesheets', async (collection) => {
    // Step 1: Delete data if required
    const deleteTimesheets = collection.deleteData;
    const addTimesheets = collection.addData;
    const config = collection.config;
    var deleteResult = [];
    var deleteError = {};
    for (let index = 0; index < deleteTimesheets.length; index++) {
        var timesheetId = deleteTimesheets[index].timesheetId;
        const response = await kimaiClientPostGeneric("timesheets/" + timesheetId, config, {}, "DELETE");
        if (response === null) {
            deleteResult.push({ ...deleteTimesheets[index], action: "deleted", hasIssue: false });
        }
        else {
            deleteError[timesheetId] = { errorMessage: response.message }
        }
    }

    var result = {};
    var addError = false;
    for (let index = 0; index < addTimesheets.length; index++) {
        // submit timesheet to kimai
        const response = await kimaiClientPostTimesheet(addTimesheets[index], config);
        result[addTimesheets[index].lineNumber] = {};
        result[addTimesheets[index].lineNumber].responseId = response.id;
        if (response.code && response.code !== 200) {
            // in case of errors, add error text
            var errorText = response.message;
            if (response.errors?.children) {
                for (var key in response.errors.children) {
                    if (response.errors.children[key].errors) {
                        errorText = errorText + " - " + key + " : " + response.errors.children[key].errors.join(", ");
                    }
                }
            }
            result[addTimesheets[index].lineNumber].hasIssue = true;
            result[addTimesheets[index].lineNumber].responseCode = response.code;
            result[addTimesheets[index].lineNumber].error = true;
            result[addTimesheets[index].lineNumber].errorMessage = errorText;
            addError = true;
        }
        else {
            // no error
            result[addTimesheets[index].lineNumber].hasIssue = false;

            // submit meta fields if available
            if (config.metaTimeEntry){
                for (let i = 0; i < config.metaTimeEntry.length; i++){  
                    const item = config.metaTimeEntry[i];                    
                    if (addTimesheets[index][item.name] && addTimesheets[index][item.name].length > 0){
                        const metaEntry = {"name":item.name, "value":addTimesheets[index][item.name]}
                        
                        const responseMeta = await kimaiClientPostGeneric("timesheets/" + response.id + "/meta", config, metaEntry, 'PATCH');
                        if (!responseMeta.id) {
                            console.log("ISSUES: (Timesheet metadata) ", metaEntry, response);
                            result[addTimesheets[index].lineNumber].hasIssue = true;
                            result[addTimesheets[index].lineNumber].responseCode = response.code;
                            result[addTimesheets[index].lineNumber].error = true;
                            result[addTimesheets[index].lineNumber].errorMessage = "Issue with Timesheet Metadata Creation";
                        }
                    }
                }
            }
        }
    }
    
    if (collection.callback){
        collection.callback();
    }

    return { ...result, deleteResult: deleteResult, deleteError: deleteError, addError: addError };
});


export function reset() {
    return { type: "updateTimesheets/reset", payload: {} };
};

const updateTimesheetsSlice = createSlice({
    name: 'updateTimesheets',
    initialState,
    reducers: {
        reset: (state, action) => {
            state.status = 'idle';
            state.error = null;
            state.data = {};
            state.deleteError = {};
            state.deletedData = {};
        }
    },
    extraReducers: {
        [processTimesheets.pending]: (state) => {
            state.status = 'loading'
        },
        [processTimesheets.fulfilled]: (state, action) => {
            state.status = 'succeeded'
            state.data = action.payload;
            state.error = action.payload.addError;
            state.deletedData = action.payload.deleteResult;
            state.deleteError = action.payload.deleteError;
        },
        [processTimesheets.rejected]: (state, action) => {
            state.status = 'failed'
            state.error = action.error.message
        }
    },
})

export default updateTimesheetsSlice.reducer
