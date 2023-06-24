import { Button } from "semantic-ui-react";
import React from 'react';
import { useDispatch, useSelector } from "react-redux";
import { fetchExcelMetaData } from "./excelMetaSlice";
import { reset } from './excelMetaSlice'

export const ExcelMetaReadIn = () => {
    const fileInputRef = React.createRef();
    const dispatch = useDispatch();    

    const excelMetaDataStatus = useSelector((state) => state.excelMetaData.status)
    const config = useSelector((state) => state.config)

    const isLoading = excelMetaDataStatus === "loading";

    const onImportExcel = async (file) => {
        const { files } = file.target;
        
        if (files.length > 0){
            if (excelMetaDataStatus !== "idle"){
                dispatch(reset())
            }
            dispatch(fetchExcelMetaData({file:files[0], config:config}));
        }
    }

    return (
        <div>
            <Button
                loading={isLoading}
                content="Choose Meta File"
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

export default ExcelMetaReadIn;