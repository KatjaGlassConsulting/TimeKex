import React from 'react'
import { Table, Icon } from 'semantic-ui-react'

function WeekDataBreaks(props) {    
    const breaks = props.breaks

    const displayData = () => {
        return breaks.map((item) => {
            const rowColorCode =
                item.breakIssue +
                    item.overlapIssue +
                    item.restHoursIssue +
                    item.sixHourIssue +
                    item.tenHourIssue +
                    item.workSunday + 
                    item.workOffday >
                0
                    ? ''
                    : 'positive'
            return (
                <Table.Row key={item.date} className={rowColorCode}>
                    <Table.Cell width={1}>{item.date}</Table.Cell>
                    <Table.Cell width={1}>{item.start}</Table.Cell>
                    <Table.Cell width={1}>{item.end}</Table.Cell>
                    <Table.Cell width={1}>{item.workTime.hours + "h " + item.workTime.mins}</Table.Cell>
                    <Table.Cell width={1} negative={item.restHoursIssue}><Icon name={item.restHoursIssue ? 'thumbs down' : 'thumbs up'}/></Table.Cell>
                    <Table.Cell width={1} negative={item.breakIssue}><Icon name={item.breakIssue ? 'thumbs down' : 'thumbs up'}/></Table.Cell>
                    <Table.Cell width={1} negative={item.sixHourIssue}><Icon name={item.sixHourIssue ? 'thumbs down' : 'thumbs up'}/></Table.Cell>
                    <Table.Cell width={1} negative={item.tenHourIssue}><Icon name={item.tenHourIssue ? 'thumbs down' : 'thumbs up'}/></Table.Cell>
                    <Table.Cell width={1} negative={item.overlapIssue}><Icon name={item.overlapIssue ? 'thumbs down' : 'thumbs up'}/></Table.Cell>
                    <Table.Cell width={1} negative={item.workSunday}><Icon name={item.workSunday ? 'thumbs down' : 'thumbs up'}/></Table.Cell>
                    <Table.Cell width={1} negative={item.workOffday}><Icon name={item.workOffday ? 'thumbs down' : 'thumbs up'}/></Table.Cell>
                </Table.Row>
            )
        })
    } 

    return (
        <div>
        <Table celled>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Date</Table.HeaderCell>
                    <Table.HeaderCell>Start</Table.HeaderCell>
                    <Table.HeaderCell>End</Table.HeaderCell>
                    <Table.HeaderCell>Work Time</Table.HeaderCell>
                    <Table.HeaderCell>11h Rest</Table.HeaderCell>
                    <Table.HeaderCell>Break duration</Table.HeaderCell>
                    <Table.HeaderCell>Break after &gt;6h</Table.HeaderCell>
                    <Table.HeaderCell>&lt;=10h</Table.HeaderCell>
                    <Table.HeaderCell>Time overlap</Table.HeaderCell>
                    <Table.HeaderCell>Work Sunday</Table.HeaderCell>
                    <Table.HeaderCell>Work Day Off</Table.HeaderCell>
                </Table.Row>
            </Table.Header>

            <Table.Body>{displayData()}</Table.Body>
        </Table>
        <h3>Explanations:</h3>
        <ul>
            <li>11h Rest - You must rest at least for 11h from one day to another.</li>
            <li>Break Duration - You must pause at least 30 minutes when working more than 6h and 45 minutes when working more than 9 hours.</li>
            <li>Break after &gt;6h - You must not work more than 6h at a time - there must be a break in between.</li>
            <li>&lt;=10h - You must not work more than 10 hours per day</li>
            <li>Time overlap - You have entered times that overlap (see Entry Overview)</li>
            <li>Work Sunday - You must not work on Sunday</li>
            <li>Work Day Off - You must not work on Holiday or Vacation</li>
        </ul>
    </div>
    )
}

export default WeekDataBreaks
