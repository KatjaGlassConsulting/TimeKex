import React, {useEffect} from 'react'
import { useDispatch } from 'react-redux'
import {
    HashRouter as Router,
    Switch,
    Route,
    Redirect,
} from 'react-router-dom'

import Main from './features/views/Main';
import OvertimeOverview from './features/views/OvertimeOverview';
import Admin from './features/views/Admin';
import Info from './features/views/Info';
import Login from './features/views/Login';
import { globalConfigSet } from './features/globalConfig/globalConfigSlice';

function App (props) {
    const dispatch = useDispatch();

    useEffect(()=>{
        const user = JSON.parse(localStorage.getItem("User"));
        if (!props._config.username && !props._config.password && user){
            dispatch(globalConfigSet({...props._config, username: user.user, password: user.password}));
        } else {
            dispatch(globalConfigSet(props._config));
        }
    },[props._config, dispatch])
    
    return (
        <Router>
            <div className="App">                                        
                <Switch>
                    <Route exact path="/" component={Main} />
                    <Route exact path="/overtime" component={OvertimeOverview} />
                    <Route exact path="/admin" component={Admin} />
                    <Route exact path="/info" component={Info} />
                    <Route exact path="/login" component={Login} />
                    <Redirect to="/" />
                </Switch>
            </div>
        </Router>
    )
}

export default App;
