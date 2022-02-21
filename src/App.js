import React from 'react'
import {
    HashRouter as Router,
    Switch,
    Route,
    Redirect,
} from 'react-router-dom'
import { connect } from "react-redux";

import Main from './features/views/Main';
import Admin from './features/views/Admin';
import Info from './features/views/Info';
import Login from './features/views/Login';
import { globalConfigSet } from './features/globalConfig/globalConfigSlice';

class App extends React.Component {
    constructor(props) {
        super(props)
        this.props.dispatch(globalConfigSet(this.props._config));
    }

    render() {
        return (
            <Router>
                <div className="App">                                        
                    <Switch>
                        <Route exact path="/" component={Main} />
                        <Route exact path="/admin" component={Admin} />
                        <Route exact path="/info" component={Info} />
                        <Route exact path="/login" component={Login} />
                        <Redirect to="/" />
                    </Switch>
                </div>
            </Router>
        )
    }
}

export default connect()(App);
