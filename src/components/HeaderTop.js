import React, { useEffect, useState } from 'react'
import { Menu, Icon, Dropdown } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { reset as resetUpdated } from '../features/updateTimesheets/updateTimesheetsSlice'
import { reset as resetExcel } from '../features/excelImport/excelSlice'
import { reset as resetKimai } from '../features/kimaiDB/kimaiSlice'
import { reset as resetTimesheet } from '../features/kimaiTimesheets/kimaiTimesheetsSlice'
import { reset as resetApproval } from '../features/approvalSlice'
import { reset as resetOvertime } from '../features/overtimeSlice'
import { messagesReset as resetMessages } from '../features/messages/messagesSlice'
import { globalConfigSet } from '../features/globalConfig/globalConfigSlice'

function HeaderTop(props) {
    const kimaiAPIURL = useSelector((state) => state.config.kimaiAPI);
    const config = useSelector((state) => state.config);

    const [smallMenuEnlarge, setSmallMenuEnlarge] = useState(false)
    const [width, setWidth] = useState(0)

    const dispatch = useDispatch()

    useEffect(() => {
        setWidth(window.innerWidth)
        window.addEventListener('resize', updateWindowDimensions, false)

        return () => {
            window.removeEventListener("resize", updateWindowDimensions);
        }
    }, [])

    const onLogoutClick = () => {
        const newConfig = {...config, username : null, password : null }
        dispatch(globalConfigSet(newConfig));
        dispatch(resetUpdated())
        dispatch(resetExcel())
        dispatch(resetKimai())
        dispatch(resetTimesheet())
        dispatch(resetMessages())
        dispatch(resetApproval())
        dispatch(resetOvertime())
        localStorage.removeItem("User");
        
    }

    const updateWindowDimensions = () => {
        setWidth(window.innerWidth)
    }

    const handleSmallMenuEnlargeToggle = () => {
        setSmallMenuEnlarge(!smallMenuEnlarge)
    }

    const menu = (
        <Menu.Menu position="left" className="menu_items_group">
            <Menu.Item name="Home">
                <Link to="/">Home</Link>
            </Menu.Item>
            {(config.overtime !== false) && (
            <Menu.Item name="Overtime">
                <Link to="/overtime">Overtime</Link>
            </Menu.Item>)}
            {(!config.adminUser ||
                config.adminUser.includes(config.username?.toLowerCase())) && (
                <Menu.Item name="Admin">
                    <Link to="/admin">Admin</Link>
                </Menu.Item>
            )}
            {kimaiAPIURL &&
                <Menu.Item name="Kimai">
                    <a
                        href={kimaiAPIURL.substring(
                            0,
                            kimaiAPIURL.length - 5
                        )}
                        target="_blank"
                        rel="noreferrer"
                    >
                        <Icon name="external alternate" />
                        Kimai
                    </a>
                </Menu.Item>
            }
            <Menu.Item name="Info">
                <Link to="/info">Info V{process.env.REACT_APP_VERSION}</Link>
            </Menu.Item>
        </Menu.Menu>
    )

    const userMenu = (
        <Menu.Menu position="right" className="menu_items_group">
            <Dropdown item text={config.username} position="left">
                <Dropdown.Menu>
                    <Dropdown.Item onClick={onLogoutClick}>
                        Logout
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        </Menu.Menu>
    )

    const renderSmallMenu = () => {
        const head = (
            <div className="ui container fluid" align="left">
                <table align="center">
                    <tbody>
                        <tr>
                            <td valign="middle"><a href="https://www.glacon.eu" rel="noopener noreferrer" target="_blank">
                                <img src='./images/fischlogo_02_black_small.png' alt="Logo" style={{ height: "60px" }}/>
                            </a></td>
                            <td></td>
                            <td valign="middle">
                                <Icon
                                    name="sidebar"
                                    size="big"
                                    onClick={handleSmallMenuEnlargeToggle}
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
        if (smallMenuEnlarge === false) {
            return <div>{head}</div>
        }
        return (
            <div className="ui centered grid">
                <div className="hideContentOnLargeWidth">
                    {head}
                    <hr />
                    <div className="color_medium_light">
                        <div className="ui container float" align="left">
                            <Menu inverted secondary fluid vertical>
                                {menu}
                            </Menu>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const renderLargeMenu = () => {
        return (
            <Menu inverted secondary className="hideContentOnSmallWidth">
                <div className="ui"><a href="https://www.glacon.eu" rel="noopener noreferrer" target="_blank">
                        <img src='./images/fischlogo_02_black_small.png' alt="Logo" style={{ height: "60px" }} className="padding_left_right"/>
                    </a></div>
                {menu}
                {userMenu}
            </Menu>
        )
    }

    return (
        <div className="padding_top_bottom color_medium_light">
            {width >= 1000 && renderLargeMenu()}
            {width < 1000 && renderSmallMenu()}
        </div>
    )
}

export default HeaderTop