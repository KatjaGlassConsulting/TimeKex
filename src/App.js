import React from 'react'
import {
    HashRouter as Router,
    Routes,
    Route,
    Navigate,
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
                    <Routes>
                        <Route path="/" component={Main} />
                        <Route path="/admin" component={Admin} />
                        <Route path="/info" component={Info} />
                        <Route path="/login" component={Login} />
                        <Navigate to="/404" />
                    </Routes>
                </div>
            </Router>
        )
    }
}

export default connect()(App);
