import React from 'react';
import { Menu, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

class HeaderTop extends React.Component {
    state = {
        smallMenuEnlarge: false,
        width: 0,
        height: 0
    }

    constructor(props) {
        super(props);

        this.goToLink = this.goToLink.bind(this)
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
        this.handleSmallMenuEnlargeToggle = this.handleSmallMenuEnlargeToggle.bind(this);
    }

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    updateWindowDimensions() {
        this.setState({ width: window.innerWidth, height: window.innerHeight });
    }

    handleSmallMenuEnlargeToggle = () => { this.setState({ smallMenuEnlarge: !this.state.smallMenuEnlarge }) }

    menu = <Menu.Menu position='left'>
        <Menu.Item name='Home' component={Link} to="/" />
        {(!this.props.config.adminUser || (this.props.config.adminUser.includes(this.props.config.username))) &&
        <Menu.Item name='Admin' component={Link} to="/admin" />}
        <Menu.Item name='Kimai' component={Link} to="/kimaiExternal" icon='external alternate'/> 
        <Menu.Item name='Info' component={Link} to="/info" /> 
    </Menu.Menu>;

    renderSmallMenu() {
        const head =
            <div className="ui container fluid" align="left">
                <table align="center">
                    <tbody>
                        <tr>
                            <td valign="middle"><a href="https://www.glacon.eu" rel="noopener noreferrer" target="_blank">
                                <img src='./images/fischlogo_02_black_small.png' alt="Logo" style={{ height: "60px" }}/>
                            </a></td>                            
                            <td></td>
                            <td valign="middle"><Icon name='sidebar' size="big" onClick={this.handleSmallMenuEnlargeToggle} /></td>
                        </tr>
                    </tbody>
                </table>
            </div>;
        if (this.state.smallMenuEnlarge === false) {
            return (<div>{head}</div>);
        }
        return (
            <div className="ui centered grid">
                <div className="hideContentOnLargeWidth">
                    {head}
                    <hr />
                    <div className="color_medium_light" >
                        <div className="ui container float" align="left">
                            <Menu inverted secondary fluid vertical>
                                {this.menu}
                            </Menu>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    renderLargeMenu() {
        return (            
                <Menu inverted secondary className="hideContentOnSmallWidth">
                    <div className="ui"><a href="https://www.glacon.eu" rel="noopener noreferrer" target="_blank">
                        <img src='./images/fischlogo_02_black_small.png' alt="Logo" style={{ height: "60px" }} className="padding_left_right"/>
                    </a></div>                    
                    {this.menu}
                </Menu>
        );
    }

    render() {
        return (
            <div className="padding_top_bottom color_medium_light">
                {this.state.width >= 1000 && this.renderLargeMenu()}
                {this.state.width < 1000 && this.renderSmallMenu()}
            </div >
        );
    }
}

const mapStateToProps = state => {
    return {
        kimaiAPIURL: state.config.kimaiAPI,
        config: state.config
    };
};

export default connect(
    mapStateToProps,
    null
)(HeaderTop);
