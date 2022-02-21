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
    uploadStatus: {}
})

export const fetchAllData = createAsyncThunk('kimaiData/fetchAllData', async (config) => {
    
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

    const responseCustomers = await kimaiClient('customers', config);
    result.customers = {};
    responseCustomers.forEach(item => {
        result.customers[item.id] = { id: item.id, name: item.name };
    });

    const responseProjects = await kimaiClient('projects', config);
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
            if (metadata.customers[key].name === customer) {
                returnId = key;
                return;
            }
        })
    }
    else if (!activity) {
        Object.keys(metadata.projects).forEach(key => {
            if (metadata.projects[key].name === project &&
                metadata.projects[key].customer.name === customer) {
                returnId = key;
                return;
            }
        })
    }
    else {
        Object.keys(metadata.activities).forEach(key => {
            if (metadata.activities[key].name === activity) {
                if (!project && !metadata.activities[key].project) {
                    returnId = key;
                    return;
                }
                else if (project &&
                    metadata.activities[key].project?.name === project &&
                    metadata.activities[key].project?.customer.name === customer) {
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
            state.status = 'idle';
            state.error = null;
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
