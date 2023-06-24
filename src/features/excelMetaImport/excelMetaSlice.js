import {
    createSlice,
    createAsyncThunk,
    createEntityAdapter,
} from '@reduxjs/toolkit'

import readFile from '../../api/readFile'
import readXlsxFile from 'read-excel-file'
import { schema } from '../../components/CreateDBDataExcel/ExcelSchemaImports'
import { updateSchema } from '../../functions/excelSchemaFunctions';


const excelDataAdapter = createEntityAdapter({})

const initialState = excelDataAdapter.getInitialState({
    status: 'idle',
    error: null,
    data: [],
    validationError: []
})

export const fetchExcelMetaData = createAsyncThunk('excelMetaData/fetchExcelMetaData', async ({file, config}) => {
    const finalSchema = updateSchema(schema,config.meta);

    let contentBuffer = await readFile(file);    
    const result = await readXlsxFile(contentBuffer, { schema:finalSchema } );   

    if (result.errors.length > 0){
        result.errors.forEach(errorItem => {
            if (typeof errorItem.value === 'object'){
                errorItem.value = JSON.stringify(errorItem.value)
            }
            if (errorItem.type){
                delete errorItem.type; 
            } 
        })
    }

    return result;
})

export function reset() {
    return { type: "excelMetaData/reset", payload: {} };
};

const excelMetaDataSlice = createSlice({
    name: 'excelMetaData',
    initialState,
    reducers: {
        reset: (state) => {
            state.status = 'idle';
            state.error = null;
            state.data = [];
            state.validationError = [];
        },
    },
    extraReducers: {
        [fetchExcelMetaData.pending]: (state) => {
            state.status = 'loading'
        },
        [fetchExcelMetaData.fulfilled]: (state, action) => {
            state.status = 'succeeded';
            state.validationError = action.payload.errors;
            state.data = action.payload.rows;
        },
        [fetchExcelMetaData.rejected]: (state, action) => {
            state.status = 'failed'
            state.error = action.error.message
        }
    },
})

export default excelMetaDataSlice.reducer
