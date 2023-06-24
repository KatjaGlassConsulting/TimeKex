import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { Grid, Segment, Icon, Input, Button } from 'semantic-ui-react'
import { useState } from 'react'

import ModalIssueNotify from '../../components/ModalIssueNotify'
import { globalConfigSet } from '../../features/globalConfig/globalConfigSlice'
import { reset as resetKimaiSlice } from '../../features/kimaiDB/kimaiSlice'

import 'semantic-ui-css/semantic.min.css'
import '../../css/globals.css'

function Login(props) {
    const [user, setUser] = useState('')
    const [password, setPassword] = useState('')
    const dispatch = useDispatch()

    const config = useSelector((state) => state.config)
    const kimaiGeneralStatusError = useSelector(
        (state) => state.kimaiData.error
    )

    if (
        config.username &&
        config.password &&
        (kimaiGeneralStatusError === null ||
            kimaiGeneralStatusError !== 'Invalid credentials')
    ) {
        return <Redirect to="/" />
    }

    const handleUserChange = (event) => {
        setUser(event.target.value)
    }

    const handlePWChange = (event) => {
        setPassword(event.target.value)
    }

    const handleLoginSubmit = () => {
        dispatch(
            globalConfigSet({
                ...config,
                username: user.trim(),
                password: password.trim(),
            })
        )
        localStorage.setItem(
            'User',
            JSON.stringify({ user: user.trim(), password: password.trim() })
        )
        if (props.location?.state?.from) {
            props.history.push(props.location.state.from)
        } else {
            props.history.push('/')
        }
    }

    const keyPress = (e) => {
        if (e.keyCode === 13) {
            handleLoginSubmit()
        }
    }

    const handleModalCloseClick = () => {
        dispatch(resetKimaiSlice())
        dispatch(globalConfigSet({ ...config, username: null, password: null }))
    }

    const invalidCredentialIssues =
        kimaiGeneralStatusError === 'Invalid credentials' ? true : false

    return (
        <div className="nearCenterScreen">
            <ModalIssueNotify
                open={invalidCredentialIssues}
                text="Invalid credentials"
                callback={handleModalCloseClick}
            />
            <Segment vertical>
                <Grid container stackable verticalAlign="top" centered>
                    <Grid.Row>
                        <h1>Login for TimeKEx</h1>
                    </Grid.Row>
                    <Grid.Row>
                        <table width="50%" align="center">
                            <tbody>
                                <tr>
                                    <td>
                                        <Input
                                            id="user"
                                            placeholder="Username"
                                            fluid
                                            value={user}
                                            onChange={handleUserChange}
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
                                            value={password}
                                            onChange={handlePWChange}
                                            onKeyDown={keyPress}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Button
                                            fluid
                                            onClick={handleLoginSubmit}
                                        >
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

export default Login
