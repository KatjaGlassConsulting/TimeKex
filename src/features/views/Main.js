import React from 'react'
import { useSelector } from 'react-redux'
import { Redirect } from 'react-router-dom'

import { ExcelStatusDisplay } from '../excelImport/ExcelStatusDisplay'
import { KimaiStatusDisplay } from '../kimaiDB/KimaiStatusDisplay'
import { KimaiStatusTimesheetsDisplay } from '../kimaiTimesheets/KimaiStatusTimesheetsDisplay'
import ExcelFileReadIn from '../excelImport/ExcelFileReadIn'
import WeekBox from '../../components/WeekBox'
import WeekDataPreparation from '../../components/WeekDataPreparation'
import HeaderTop from '../../components/HeaderTop'

import 'semantic-ui-css/semantic.min.css'
import '../../css/globals.css'

function Main(props) {
    const config = useSelector((state) => state.config);
    const kimaiGeneralStatusError = useSelector((state) => state.kimaiData.error);

    if (
        !((config.username && config.password) || (config.loginToken === true && config.token)) ||
        (kimaiGeneralStatusError &&
            kimaiGeneralStatusError === 'Invalid credentials')
    ) {
        return <Redirect to="/login" />
    }

    return (
        <div>
            <HeaderTop />
            <div className="padding8">
                <h1>Excel Sheet to Kimai Import</h1>
                <table>
                    <tbody>
                        <tr>
                            <td>
                                <ExcelFileReadIn />
                            </td>
                            <td>
                                <ExcelStatusDisplay />
                            </td>
                            <td>
                                <KimaiStatusDisplay />
                            </td>
                            <td>
                                <KimaiStatusTimesheetsDisplay />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <hr />
                <WeekBox />
                <br></br>
                <WeekDataPreparation />
            </div>
        </div>
    )
}

export default Main
