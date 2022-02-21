import {
    createSlice,
    createAsyncThunk,
    createEntityAdapter,
} from '@reduxjs/toolkit'

import readFile from '../../api/readFile'
import readXlsxFile from 'read-excel-file'
import { schema } from './ExcelSchema'
import { getWeekObject } from '../../functions/general';


const excelDataAdapter = createEntityAdapter({})

const initialState = excelDataAdapter.getInitialState({
    status: 'idle',
    error: null,
    data: [],
    validationError: [],
    selectedWeek: null
})

export const fetchExcelData = createAsyncThunk('excelData/fetchExcelData', async (file) => {
    let contentBuffer = await readFile(file);
    const result = await readXlsxFile(contentBuffer, { schema, dateFormat: 'yyyy-MM-dd' });    
    if (result.rows){
        result.rows.forEach(item => {
            if (item.date){
                item.week = getWeekObject(item.date);
            }
        })
    }    
    return result;
})

const excelDataSlice = createSlice({
    name: 'excelData',
    initialState,
    reducers: {
        selectedWeek(state, action) {
            state.selectedWeek = action.payload
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
