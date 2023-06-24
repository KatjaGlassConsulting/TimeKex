import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Table, Loader, Segment, Dimmer, Button } from 'semantic-ui-react'

import HeaderTop from '../../components/HeaderTop'
import { loadOvertimeOverviewYear } from '../overtimeOverviewSlice'
import { getDurationFormatted } from '../../functions/general'

import 'semantic-ui-css/semantic.min.css'
import '../../css/globals.css'

function OvertimeOverview() {
    const config = useSelector((state) => state.config)
    const overtimeOverview = useSelector((state) => state.overtimeOverview)

    const [year, setYear] = useState(0)

    const dispatch = useDispatch()

    useEffect(() => {
        setYear(new Date().getFullYear())
    }, [])

    useEffect(() => {
        if (
            overtimeOverview.status !== 'loading' &&
            year > 0 &&
            overtimeOverview.overtimeOverviewData[year] === undefined
        ) {
            dispatch(
                loadOvertimeOverviewYear({
                    dateString: year + '-01-01',
                    config,
                })
            )
        }
    }, [year, config, dispatch, overtimeOverview])

    const displayLoader = () => {
        if (overtimeOverview.status === 'loading') {
            return (
                <Segment>
                    <Dimmer active>
                        <Loader content="Loading" />
                    </Dimmer>
                    <br />
                    <br />
                    <br />
                </Segment>
            )
        }
        return null
    }

    const displayTable = () => {
        if (overtimeOverview.overtimeOverviewData[year] === undefined) {
            return
        }

        if (overtimeOverview.overtimeOverviewData[year] === null) {
            return <h2>No data available for the selected year</h2>
        }

        return (
            <Table celled>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Week Start</Table.HeaderCell>
                        <Table.HeaderCell>Week End</Table.HeaderCell>
                        <Table.HeaderCell>Expected Duration</Table.HeaderCell>
                        <Table.HeaderCell>Actual Duration</Table.HeaderCell>
                        <Table.HeaderCell>Overtime</Table.HeaderCell>
                        <Table.HeaderCell>Overtime (Year)</Table.HeaderCell>
                        <Table.HeaderCell>Status</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {overtimeOverview.overtimeOverviewData[year]
                        .map((item) => {
                            return (
                                <Table.Row key={item.startDate}>
                                    <Table.Cell>{item.startDate}</Table.Cell>
                                    <Table.Cell>{item.endDate}</Table.Cell>
                                    <Table.Cell className={'rightTextTable'}>
                                        {getDurationFormatted(
                                            item.expectedDuration
                                        )}
                                    </Table.Cell>
                                    <Table.Cell className="rightTextTable">
                                        {getDurationFormatted(
                                            item.actualDuration
                                        )}
                                    </Table.Cell>
                                    <Table.Cell
                                        className={
                                            item.actualDuration -
                                                item.expectedDuration <
                                            0
                                                ? 'rightTextTable redText'
                                                : 'rightTextTable'
                                        }
                                    >
                                        {getDurationFormatted(
                                            item.actualDuration -
                                                item.expectedDuration
                                        )}
                                    </Table.Cell>
                                    <Table.Cell
                                        className={
                                            item.overtimeYearly < 0
                                                ? 'rightTextTable redText'
                                                : 'rightTextTable'
                                        }
                                    >
                                        {getDurationFormatted(
                                            item.overtimeYearly
                                        )}
                                    </Table.Cell>
                                    <Table.Cell>{item.status}</Table.Cell>
                                </Table.Row>
                            )
                        })
                        .reverse()}
                </Table.Body>
            </Table>
        )
    }

    const displayYearButton = () => {
        const currentYear = new Date().getFullYear()
        return (
            <Button.Group>
                <Button
                    positive={currentYear !== year}
                    onClick={() => setYear(currentYear - 1)}
                >
                    {currentYear - 1}
                </Button>
                <Button
                    positive={currentYear === year}
                    onClick={() => setYear(currentYear)}
                >
                    {currentYear}
                </Button>
            </Button.Group>
        )
    }

    return (
        <div>
            <HeaderTop />
            <div className="padding8">
                <h1>Overtime Overview</h1>
                {displayYearButton()}
                <hr />
                {displayLoader()}
                {displayTable()}
            </div>
        </div>
    )
}

export default OvertimeOverview
