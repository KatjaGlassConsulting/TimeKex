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
    customers: [],
    projects: [],
    activities: [],
    uploadStatus: {},
    nextApprovalWeek: ""
})

export const fetchAllData = createAsyncThunk('kimaiData/fetchAllData', async (config) => {
    let apiPrefix = '';
    if (config.bundleApiUpdates){
        apiPrefix = "approval-bundle/";        
    }

    var result = {};
    const responseUserID = await kimaiClient('users/me', config);
    result.userId = responseUserID.id;

    if (responseUserID.message) {
        const customError = {
            name: "fetchAllData Error",
            message: responseUserID.message
        };
        throw customError;
    }

    const nextApprovalWeek = await kimaiClient(apiPrefix + 'next-week', config);
    if (nextApprovalWeek && nextApprovalWeek.length > 4 && !isNaN(nextApprovalWeek.substring(0, 4))){
        result.nextApprovalWeek = nextApprovalWeek;
    }
    else {
        result.nextApprovalWeek = "";
    }

    const responseCustomers = await kimaiClient('customers', config);
    result.customers = {};
    responseCustomers.forEach(item => {
        result.customers[item.id] = { id: item.id, name: item.name };
    });

    const responseProjects = await kimaiClient('projects?ignoreDates=1', config);
    result.projects = {};
    responseProjects.forEach(item => {
        result.projects[item.id] = { id: item.id, name: item.name, customer: result.customers[item.customer] ? result.customers[item.customer] : null };
    });

    const responseActivities = await kimaiClient('activities', config);
    result.activities = {};
    responseActivities.forEach(item => {
        result.activities[item.id] = { id: item.id, name: item.name, project: result.projects[item.project] ? result.projects[item.project] : null };
    });

    return result;

})

export function getIdFromKimaiData(metadata, customer, project, activity) {
    if (!metadata){
        return null;
    }
    
    var returnId = null;
    if (!project && !activity) {
        Object.keys(metadata.customers).forEach(key => {
            if (metadata.customers[key].name?.toLowerCase() === customer?.toLowerCase()) {
                returnId = key;
                return;
            }
        })
    }
    else if (!activity) {
        Object.keys(metadata.projects).forEach(key => {
            if (metadata.projects[key].name?.toLowerCase() === project?.toLowerCase() &&
                metadata.projects[key].customer.name?.toLowerCase() === customer?.toLowerCase()) {
                returnId = key;
                return;
            }
        })
    }
    else {
        Object.keys(metadata.activities).forEach(key => {
            if (metadata.activities[key].name?.toLowerCase() === activity?.toLowerCase()) {
                if (!project && !metadata.activities[key].project) {
                    returnId = key;
                    return;
                }
                else if (project &&
                    metadata.activities[key].project?.name?.toLowerCase() === project?.toLowerCase() &&
                    metadata.activities[key].project?.customer.name?.toLowerCase() === customer?.toLowerCase()) {
                    returnId = key;
                    return;
                }
            }
        })
    }
    return returnId;
}

export function reset() {
    return { type: "kimaiData/reset", payload: {} };
};

const kimaiSlice = createSlice({
    name: 'kimaiData',
    initialState,
    reducers: {
        reset: (state, action) => {
            state.status= 'idle';
            state.error = null;
            state.userId = null;
            state.customers = [];
            state.projects = [];
            state.activities = [];
            state.uploadStatus = {};
            state.nextApprovalWeek = "";
        }
    },
    extraReducers: {
        [fetchAllData.pending]: (state, action) => {
            state.status = 'loading'
        },
        [fetchAllData.fulfilled]: (state, action) => {
            state.status = 'succeeded';
            state.userId = action.payload.userId;
            state.customers = action.payload.customers;
            state.projects = action.payload.projects;
            state.activities = action.payload.activities;
            state.nextApprovalWeek = action.payload.nextApprovalWeek;
        },
        [fetchAllData.rejected]: (state, action) => {
            console.log(action);
            state.status = 'failed'
            state.error = action.error.message
        }
    },
})

// export const { } = kimaiSlice.actions // when actions are available, e.g. "addkimaiData" then use this

export default kimaiSlice.reducer
