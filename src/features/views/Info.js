import React from 'react';
import HeaderTop from '../../components/HeaderTop';
import { Grid, Segment, Icon } from 'semantic-ui-react';

import 'semantic-ui-css/semantic.min.css'
import '../../css/globals.css';

class Info extends React.Component {

    render() {
        return (
            <div>
                <HeaderTop />
                <Segment vertical>
                    <Grid container stackable verticalAlign='top' centered>
                        <Grid.Row>

                            <div className="padding8 left">
                                <h1>Information</h1>
                                <h2>TimeKex - Timetracking, Kimai meets Excel</h2>
                                <p>This WebApplication is designed to allow the tracking of working hours in Excel which can then be uploaded to the Kimai Timetracking application.</p>
                                <p><a href="https://www.kimai.org/" target="_blank" rel="noreferrer">Kimai <Icon name="external alternate"/></a> 
                                is an open-source free time-tracking application which comes with a lot of functionality and capabilities. There might be
                                situations where the times should be tracked in Excel and finally be uploaded to Kimai. TimeKex is designed to support this process.
                                </p>
                                <b>Prerequisites:</b>
                                <p>To be able to run TimeKex, a running instance of Kimai is required together with a user and an API key of this user. 
                                    The API password can be set in Kimai via "profile", "API" and then "API Password".<br/>
                                    There is a stable demonstration version available for Kimai which
                                    can be used for demonstration purposes (<a href="https://demo-stable.kimai.org/de/login" target="_blank" rel="noreferrer">linked here</a>).
                                    To checkout demo users and specifically the API password of a demo user, check the <a href="https://www.kimai.org/demo/" 
                                    target="_blank" rel="noreferrer">demo information page</a>.
                                </p>
                                <b>TimeKex:</b>
                                <p>TimeKex is an open-source tool using the MIT licenses. The source code is available in GitHub: <a href="https://github.com/KatjaGlassConsulting/TimeKex" 
                                    target="_blank" rel="noreferrer">https://github.com/KatjaGlassConsulting/TimeKex</a>. Addional documentation and a demonstration instance is available 
                                    on GitHub Pages: <a href="https://katjaglassconsulting.github.io/TimeKex/" 
                                    target="_blank" rel="noreferrer">https://katjaglassconsulting.github.io/TimeKex/</a>.
                                </p>
                                <b>Third Party Software:</b>
                                <p>Please check the <a href="https://github.com/KatjaGlassConsulting/TimeKex/blob/main/package.json" 
                                    target="_blank" rel="noreferrer">package.json</a> for detailed information which packages are used. Addional 
                                    a <a href="https://github.com/KatjaGlassConsulting/TimeKex/blob/main/third-party-licenses.txt" 
                                    target="_blank" rel="noreferrer">third party license file</a> is included in the
                                    repository to show which third-party-software might be used by this project.
                                </p>
                            </div>
                        </Grid.Row>
                    </Grid>
                </Segment>
            </div>
        )
    }
}

export default Info;