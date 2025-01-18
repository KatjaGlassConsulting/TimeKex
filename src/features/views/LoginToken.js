import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { Grid, Segment, Icon, Input, Button } from 'semantic-ui-react'
import { useState } from 'react'

import ModalIssueNotify from '../../components/ModalIssueNotify'
import { globalConfigSet } from '../globalConfig/globalConfigSlice'
import { reset as resetKimaiSlice } from '../kimaiDB/kimaiSlice'

import 'semantic-ui-css/semantic.min.css'
import '../../css/globals.css'

function LoginToken(props) {
    const [token, setToken] = useState('')
    const dispatch = useDispatch()

    const config = useSelector((state) => state.config)
    const kimaiGeneralStatusError = useSelector(
        (state) => state.kimaiData.error
    )

    if (
        config.token &&
        (kimaiGeneralStatusError === null ||
            kimaiGeneralStatusError !== 'Invalid credentials')
    ) {
        return <Redirect to="/" />
    }

    const handleTokenChange = (event) => {
        setToken(event.target.value)
    }

    const handleLoginSubmit = () => {
        dispatch(
            globalConfigSet({
                ...config,
                token: token.trim(),
            })
        )
        localStorage.setItem(
            'token',
            JSON.stringify({ token: token.trim() })
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
        dispatch(globalConfigSet({ ...config, token: null }))
    }

    const invalidCredentialIssues =
        kimaiGeneralStatusError === 'Invalid credentials' ? true : false

    console.log("invalidCredentialIssues: ", invalidCredentialIssues)

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
                                            id="token"
                                            placeholder="API Token"
                                            fluid
                                            value={token}
                                            onChange={handleTokenChange}
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

export default LoginToken
