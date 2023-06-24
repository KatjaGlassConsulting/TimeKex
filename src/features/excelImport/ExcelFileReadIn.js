import { Button } from "semantic-ui-react";
import React from 'react';
import { useDispatch, useSelector } from "react-redux";
import { fetchExcelData } from "./excelSlice";
import { reset as resetUpdated } from '../updateTimesheets/updateTimesheetsSlice'
import { reset as resetExcel } from '../excelImport/excelSlice'
import { reset as resetTimesheet } from '../kimaiTimesheets/kimaiTimesheetsSlice'
import { reset as resetApproval} from "../approvalSlice";
import { messagesReset as resetMessages } from '../messages/messagesSlice'

export const ExcelFileReadIn = () => {
    const fileInputRef = React.createRef();
    const dispatch = useDispatch();    

    const excelDataStatus = useSelector((state) => state.excelData.status)
    const kimaiDataStatus = useSelector((state) => state.kimaiTimesheets.status);
    const config = useSelector((state) => state.config);

    const isLoading = excelDataStatus === "loading";
    const isDisabled = excelDataStatus === "succeeded" && kimaiDataStatus !== "succeeded";

    const onImportExcel = async (file) => {
        const { files } = file.target;
        
        if (files.length > 0){
            if (excelDataStatus !== "idle"){
                dispatch(resetUpdated())
                dispatch(resetExcel())
                dispatch(resetTimesheet())
                dispatch(resetMessages())
                dispatch(resetApproval())
            }
            dispatch(fetchExcelData({file:files[0], config:config}));
        }
    }

    return (
        <div>
            <Button
                loading={isLoading}
                disabled={isDisabled}
                content="Choose File"
                labelPosition="left"
                icon="file"
                onClick={() => fileInputRef.current.click()}
            />
            <input
                ref={fileInputRef}
                type="file"
                hidden
                onClick={(e) => e.target.value = null}
                onChange={onImportExcel}
            />
        </div>

    )
}

export default ExcelFileReadIn;