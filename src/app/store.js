import { configureStore } from '@reduxjs/toolkit'
import excelDataReducer from '../features/excelImport/excelSlice'
import excelMetaDataReducer from '../features/excelMetaImport/excelMetaSlice'
import kimaiDataReducer from '../features/kimaiDB/kimaiSlice'
import kimaiRawDataReducer from '../features/kimaiRawData/kimaiRawSlice'
import kimaiTimesheetsReducer from '../features/kimaiTimesheets/kimaiTimesheetsSlice'
import updateTimesheetsReducer from '../features/updateTimesheets/updateTimesheetsSlice'
import approvalReducer from '../features/approvalSlice'
import overtimeReducer from '../features/overtimeSlice'
import overtimeOverviewReducer from '../features/overtimeOverviewSlice'
import { globalConfigReducer } from '../features/globalConfig/globalConfigSlice'
import { messagesReducer } from '../features/messages/messagesSlice'

export default configureStore({
    reducer: {
        excelData: excelDataReducer,
        kimaiData: kimaiDataReducer,
        config: globalConfigReducer,
        updateTimesheets: updateTimesheetsReducer,
        kimaiTimesheets: kimaiTimesheetsReducer,
        messages: messagesReducer,
        approval: approvalReducer,
        overtime: overtimeReducer,
        overtimeOverview: overtimeOverviewReducer,
        kimaiRawData: kimaiRawDataReducer,
        excelMetaData: excelMetaDataReducer,
    },
})
