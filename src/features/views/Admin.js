import React from 'react'
import { useSelector } from 'react-redux'
import { Redirect } from 'react-router-dom';

import { KimaiRawStatusDisplay } from '../kimaiRawData/KimaiRawStatusDisplay'
import { ExcelMetaReadIn } from '../../features/excelMetaImport/ExcelMetaReadIn'
import HeaderTop from '../../components/HeaderTop';
import AdminContentBox from '../../components/AdminContentBox'

import 'semantic-ui-css/semantic.min.css'
import '../../css/globals.css';

function Admin () {
    const config = useSelector((state) => state.config);
    const kimaiGeneralStatusError = useSelector((state) => state.kimaiData.error);    

    if (!(config.username && config.password) ||
        (kimaiGeneralStatusError && kimaiGeneralStatusError === "Invalid credentials")) {
        return <Redirect to={{
            pathname: '/login',
            state: { from: '/admin' }
        }} />;
    }

    return (
        <div>
            <HeaderTop />
            <div className="padding8">
                <h1>Administration</h1>
                <table>
                    <tbody>
                        <tr>
                            <td><KimaiRawStatusDisplay /></td>
                            <td><ExcelMetaReadIn /></td>
                        </tr>
                    </tbody>
                </table>
                <hr />
                <AdminContentBox />
            </div>            
        </div>
    )
}

export default Admin;