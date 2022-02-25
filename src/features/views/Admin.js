import React from 'react';
import { connect } from 'react-redux';
import { Navigate } from 'react-router-dom';

import CreateDBDataExcel from '../../components/CreateDBDataExcel';
import { KimaiStatusDisplay } from '../kimaiDB/KimaiStatusDisplay';
import HeaderTop from '../../components/HeaderTop';

import 'semantic-ui-css/semantic.min.css'
import '../../css/globals.css';

class Admin extends React.Component {

    displayMessages() {
        return (
            this.props.messages.map((message, index) => {
                return (
                    <li key={index}>
                        {message}
                    </li>
                )
            })
        );
    }

    render() {
        if (!(this.props.config.username && this.props.config.password) ||
            (this.props.kimaiGeneralStatusError && this.props.kimaiGeneralStatusError === "Invalid credentials")) {
            return <Navigate to={{
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
                                <td><KimaiStatusDisplay /></td>
                                <td><CreateDBDataExcel /></td>
                            </tr>
                        </tbody>
                    </table>
                    <hr />
                    {this.displayMessages()}
                </div>
            </div>
        )
    }
}


const mapStateToProps = state => {

    return {
        messages: state.messages,
        config: state.config,
        kimaiGeneralStatusError: state.kimaiData.error
    };
};

export default connect(
    mapStateToProps,
    null
)(Admin);

//export default Admin;