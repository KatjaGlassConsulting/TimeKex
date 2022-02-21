import React from 'react';
import { connect, useSelector, useDispatch } from "react-redux";
import { Button } from "semantic-ui-react";
import { createData } from '../functions/createData';
import { messagesSet } from '../features/messages/messagesSlice';
import readFile from '../api/readFile'
import readXlsxFile from 'read-excel-file'

export const CreateDBDataExcel = () => {
    const fileInputRef = React.createRef();
    const dispatch = useDispatch()

    const kimaiData = useSelector((state) => state.kimaiData)
    const config = useSelector((state) => state.config)

    const columns = ["customer", "project", "activity", "customer_country", "customer_currency", "customer_timezone", "customer_comment"]
    var excelSchema = {};
    columns.forEach(item => {
        excelSchema[item] = {};
        excelSchema[item].prop = item;
        excelSchema[item].type = (value) => {return value.replaceAll("\u00A0", " ")};
    });
    
    const finishedFunction = (returnMessages) => {
        dispatch(messagesSet(returnMessages));
    }

    const createDBData = (contentData) => {
        createData(kimaiData, contentData, config, finishedFunction);
    }

    const onImportExcel = async (file) => {
        const { files } = file.target;
        let contentBuffer = await readFile(files[0]);
        const result = await readXlsxFile(contentBuffer, { schema:excelSchema } );
        createDBData(result.rows);
    }

    var disabled = false;
    if (kimaiData.status !== "succeeded") {
        disabled = true;
    }

    return (
        <div>
            <Button
                disabled={disabled}
                content="Create DB Data"
                labelPosition="left"
                icon="hdd"
                onClick={() => fileInputRef.current.click()}
            />
            <input
                ref={fileInputRef}
                type="file"
                hidden
                onChange={onImportExcel}
            />
        </div>
    );

}

export default connect()(CreateDBDataExcel);