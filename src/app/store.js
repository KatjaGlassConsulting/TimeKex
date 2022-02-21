import { configureStore } from '@reduxjs/toolkit';
import excelDataReducer from '../features/excelImport/excelSlice';
import kimaiDataReducer from '../features/kimaiDB/kimaiSlice';
import kimaiTimesheetsReducer from '../features/kimaiTimesheets/kimaiTimesheetsSlice';
import updateTimesheetsReducer from '../features/updateTimesheets/updateTimesheetsSlice';
import { globalConfigReducer } from '../features/globalConfig/globalConfigSlice';
import {messagesReducer} from '../features/messages/messagesSlice';

export default configureStore({
    reducer: {
        excelData: excelDataReducer,
        kimaiData: kimaiDataReducer,
        config: globalConfigReducer,
        updateTimesheets: updateTimesheetsReducer,
        kimaiTimesheets : kimaiTimesheetsReducer,
        messages: messagesReducer
    },
})