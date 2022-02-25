import React from 'react';
import { connect } from "react-redux";
import { Navigate } from 'react-router-dom';

import { ExcelStatusDisplay } from '../excelImport/ExcelStatusDisplay';
import { KimaiStatusDisplay } from '../kimaiDB/KimaiStatusDisplay';
import { KimaiStatusTimesheetsDisplay } from '../kimaiTimesheets/KimaiStatusTimesheetsDisplay';
import ExcelFileReadIn from '../excelImport/ExcelFileReadIn';
import WeekBox from '../../components/WeekBox';
import WeekDataDisplay from '../../components/WeekDataDisplay';
import HeaderTop from '../../components/HeaderTop';
// import CreateDBData from './CreateDBData';


import 'semantic-ui-css/semantic.min.css'
import '../../css/globals.css';

class Main extends React.Component {

    componentDidMount() {
        //createData();

        /*
        var url = "https://kimai.glacon.eu/api/customers";

        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);

        xhr.setRequestHeader("Content-Type", "application/json");
        //xhr.setRequestHeader('X-AUTH-USER', "katja");
        xhr.setRequestHeader('X-AUTH-USER', "api_admin_user");
        xhr.setRequestHeader('X-AUTH-TOKEN', "topSecretAPISomethingUnicorn564");

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                console.log(xhr.status);
                console.log(xhr.responseText);
            }
        };

        var data = {
            "name": "ChrestosA",
            "country": "DE",
            "currency": "EUR",
            "timezone": "Europe/Berlin",
            "comment": "Used for internal tasks",
            "visible": true
        };

        xhr.send(JSON.stringify(data));
        */
    }

    render() {
        if (!(this.props.config.username && this.props.config.password) || 
            (this.props.kimaiGeneralStatusError && this.props.kimaiGeneralStatusError === "Invalid credentials")) {
            return <Navigate to="/login" />;
        }

        return (
            <div>
                <HeaderTop />
                <div className="padding8">
                    <h1>Excel Sheet to Kimai Import</h1>
                    <table>
                        <tbody>
                            <tr>
                                <td><ExcelFileReadIn /></td>
                                <td><ExcelStatusDisplay /></td>
                                <td><KimaiStatusDisplay /></td>
                                <td><KimaiStatusTimesheetsDisplay /></td>
                            </tr>
                        </tbody>
                    </table>
                    <hr />
                    <WeekBox />
                    <br></br>
                    <WeekDataDisplay />
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        config: state.config,
        kimaiGeneralStatusError: state.kimaiData.error
    };
};

export default connect(mapStateToProps,null)(Main);