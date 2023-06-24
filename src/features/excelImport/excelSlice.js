import {
    createSlice,
    createAsyncThunk,
    createEntityAdapter,
} from '@reduxjs/toolkit'

import readFile from '../../api/readFile'
import readXlsxFile from 'read-excel-file'
import { schema } from './ExcelSchema'
import { getWeekObject, includesCaseInsensitive } from '../../functions/general';

const excelDataAdapter = createEntityAdapter({})

const initialState = excelDataAdapter.getInitialState({
    status: 'idle',
    error: null,
    data: [],
    validationError: [],
    selectedWeek: null
})

export const fetchExcelData = createAsyncThunk('excelData/fetchExcelData', async ({file, config}) => {
    let contentBuffer = await readFile(file);    
    const result = await readXlsxFile(contentBuffer, { schema });    
    if (result.rows){
        var issueItem = result.rows.find(item => !(item.date && (item.customer || item.project || item.activity)) )
        if (issueItem){
            console.log("There had been empty rows, these cannot be considered:")
            console.log(issueItem)
        }
        result.rows = result.rows.filter(item => item.date && (item.customer || item.project || item.activity));
        // update information, include week and chargeable, update start/end for durationCustomers
        result.rows.forEach(item => {
            if (item.date){
                item.week = getWeekObject(item.date);
            }
            if (item.chargeable === undefined){
                item.chargeable = true;
            }
            // support duration for specific configured customers
            if (!item.start && !item.end && item.duration){
                if (includesCaseInsensitive(config.durationCustomers, item.customer)){                    
                    let hours = parseInt(item.duration.split(":")[0])
                    let mins = item.duration.split(":")[1]
                    if (mins === "60"){
                        mins = "00"
                        hours += 1 
                    }
                    if (hours !== undefined && mins !== undefined){
                        item.start = "08:00"
                        item.end = (hours+8).toString() + ":" + mins
                        if (item.end.length === 4){
                            item.end = "0" + item.end
                        }
                    }
                }
            }
            // check for midnight end-time and set it to 24 instead of 0
            if (item.end === "00:00"){
                item.end = "24:00"
            }
        })
    }
    return result;
})

export function reset() {
    return { type: "excelData/reset", payload: {} };
};

const excelDataSlice = createSlice({
    name: 'excelData',
    initialState,
    reducers: {
        selectedWeek(state, action) {
            state.selectedWeek = action.payload
        },
        reset: (state, action) => {
            state.status = 'idle';
            state.error = null;
            state.data = [];
            state.validationError = [];
            state.selectedWeek = null;
        },
    },
    extraReducers: {
        [fetchExcelData.pending]: (state, action) => {
            state.status = 'loading'
        },
        [fetchExcelData.fulfilled]: (state, action) => {
            state.status = 'succeeded';
            state.validationError = action.payload.errors;
            state.data = action.payload.rows;
        },
        [fetchExcelData.rejected]: (state, action) => {
            state.status = 'failed'
            state.error = action.error.message
        }
    },
})

export const { selectedWeek } = excelDataSlice.actions 

export default excelDataSlice.reducer
