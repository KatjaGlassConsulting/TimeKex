import { Button } from "semantic-ui-react";
//import readXlsxFile from 'read-excel-file'
//import { schema } from './ExcelSchema'
import React from 'react';
import { connect, useDispatch, useSelector } from "react-redux";
import { fetchExcelData } from "./excelSlice";

export const ExcelFileReadIn = () => {
    const fileInputRef = React.createRef();
    const dispatch = useDispatch();

    const onImportExcel = async (file) => {
        const { files } = file.target;
        dispatch(fetchExcelData(files[0]));
    }

    const excelDataStatus = useSelector((state) => state.excelData.status)

    return (
        <div>
            {excelDataStatus === "loading" &&
                <Button
                    loading
                    content="Choose File"
                    labelPosition="left"
                    icon="file"
                    onClick={() => fileInputRef.current.click()}
                />
            }
            {excelDataStatus === "succeeded" &&
                <Button
                    disabled
                    content="Choose File"
                    labelPosition="left"
                    icon="file"
                    onClick={() => fileInputRef.current.click()}
                />
            }
            {excelDataStatus !== "succeeded" &&
                excelDataStatus !== "loading" &&
                <Button
                    content="Choose File"
                    labelPosition="left"
                    icon="file"
                    onClick={() => fileInputRef.current.click()}
                />
            }
            <input
                ref={fileInputRef}
                type="file"
                hidden
                onChange={onImportExcel}
            />
        </div>

    )
}

export default connect()(ExcelFileReadIn);