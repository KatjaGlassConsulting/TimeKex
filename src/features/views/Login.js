import React from 'react';
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
import { Grid, Segment, Icon, Input, Button } from 'semantic-ui-react';

import ModalIssueNotify from '../../components/ModalIssueNotify'
import { globalConfigSet } from  '../../features/globalConfig/globalConfigSlice';
import { reset } from '../../features/kimaiDB/kimaiSlice';



import 'semantic-ui-css/semantic.min.css'
import '../../css/globals.css';


class Login extends React.Component {

    constructor(props) {
        super(props);
        this.state = { user: "", password: "", isLoading: false };

        this.handleUserChange = this.handleUserChange.bind(this);
        this.handlePWChange = this.handlePWChange.bind(this);
        this.handleLoginSubmit = this.handleLoginSubmit.bind(this);
        this.resetKimaiDataRead = this.resetKimaiDataRead.bind(this);

        this.keyPress = this.keyPress.bind(this);
    }

    handleUserChange(event) {
        this.setState({ user: event.target.value });
    }

    handlePWChange(event) {
        this.setState({ password: event.target.value });
    }

    handleLoginSubmit() {
        this.props.dispatch(globalConfigSet({...this.props.config, username: this.state.user.trim(), password: this.state.password.trim()}));
        if (this.props.location?.state?.from){
            this.props.history.push(this.props.location.state.from);    
        }
        else {
            this.props.history.push("/");
        }
    }

    keyPress(e) {
        if (e.keyCode === 13) {
            this.handleLoginSubmit();
        }
    }

    resetKimaiDataRead(){
        this.props.dispatch(reset());
    }

    render() {
        const invalidCredentialIssues = this.props.kimaiGeneralStatusError === "Invalid credentials" ? true : false;

        return (
            <div className="nearCenterScreen">
                <ModalIssueNotify open={invalidCredentialIssues} text="Invalid credentials" callback={this.resetKimaiDataRead}/>
                <Segment vertical>
                    <Grid container stackable verticalAlign='top' centered>
                        <Grid.Row>
                            <h1>Login for TimeKEx</h1>
                        </Grid.Row>
                        <Grid.Row>
                            <table width="50%" align="center" >
                                <tbody>
                                    <tr>
                                        <td>
                                            <Input
                                                id="user"
                                                placeholder="Username"
                                                fluid
                                                value={this.state.user}
                                                onChange={this.handleUserChange}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <Input
                                                id="password"
                                                placeholder="API Password"
                                                type="password"
                                                fluid
                                                value={this.state.password}
                                                onChange={this.handlePWChange}
                                                onKeyDown={this.keyPress}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <Button fluid onClick={this.handleLoginSubmit}>
                                                <Icon name="sign-in" /> Login
                                            </Button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </Grid.Row>
                    </Grid>
                </Segment>
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

export default withRouter(connect(
    mapStateToProps,
    null
)(Login));