import React, { useState, useEffect } from 'react';
import { Table, Button } from 'semantic-ui-react';
import { uniq, getTimeFromMsecFormatted } from '../functions/general';

import '../css/weekDataDisplay.css';

export function WeekDataSummary(props){     
    const [showDetails, setShowDetails] = useState(false);
    const [dailySum, setDailySum] = useState(null);

    const summary = props.summary
    const excelDisplayData = props.excelDisplayData;

    const checkArray = excelDisplayData.filter(
        (item) =>
            item.action !== 'delete' &&
            item.action !== 'deleted' 
    )
    const checkDays = uniq(checkArray.map((item) => item.date))

    useEffect(() => {        
        let calcSums = {};
        for (const nameLong in summary){
            for (const description in summary[nameLong]){
                if (description !== 'action'){
                    for (const day in summary[nameLong][description]){
                        if (calcSums[day] === undefined){
                            calcSums[day] = 0
                        }
                        calcSums[day] += summary[nameLong][description][day].reduce((a, b) => a + b, 0)
                    }
                }                
            }
        }
        calcSums['total'] = Object.values(calcSums).reduce((a, b) => a + b, 0);
        setDailySum(calcSums);
    }, [summary]);

    const renderThreeLevel = () => {
        // Sort activities by name
        const activityLong = Object.keys(summary).sort()
        // push all ignore to the end
        Object.keys(summary).forEach(item => {
            if (summary[item].action === 'ignore'){
                activityLong.push(activityLong.splice(activityLong.indexOf(item), 1)[0]);
            }
        })
        return activityLong.map(item => {
            let finalSummary = {};
            let finalDetailsSummary = {};
            for (const description in summary[item]){
                if (description !== 'action'){
                    for (const date in summary[item][description]){
                        if (finalDetailsSummary[description] === undefined){
                            finalDetailsSummary[description] = {}
                        }
                        if (finalDetailsSummary[description][date] === undefined){
                            finalDetailsSummary[description][date] = []
                        } 
                        if (finalSummary[date] === undefined){
                            finalSummary[date] = []                        
                        }                    
                        finalSummary[date] = finalSummary[date].concat(summary[item][description][date]);
                        finalDetailsSummary[description][date] = finalDetailsSummary[description][date].concat(summary[item][description][date]);
                    }
                }
            }       
            
            let rowColorCode = "";
            if (summary[item].action === "ignore"){
                rowColorCode = "lightGrey";
            } else if (summary[item].action === "error"){
                rowColorCode = "orange ";
            }

            const getSummAll = () => {
                let sum = 0;
                for (const day in finalSummary){
                    sum += finalSummary[day].reduce((a, b) => a + b, 0)
                }
                return sum;
            }
            const sumAll = getSummAll();
            const negative15Mins = (sumAll / 1000 / 60 ) % 15 === 0 ? false : true;
         
            return (
                <React.Fragment key={item}>
                    <Table.Row className={rowColorCode}>
                        <Table.Cell>{item}</Table.Cell>
                        <Table.Cell negative={negative15Mins}>{getTimeFromMsecFormatted(sumAll)}</Table.Cell>
                        {checkDays.map(day => {
                            if (showDetails === true){
                                return <Table.Cell key={item + day} positive={true}></Table.Cell>
                            } else if (finalSummary[day] === undefined){
                                return <Table.Cell key={item + day}></Table.Cell>
                            }
                            return (
                                <Table.Cell key={item + day}>{getTimeFromMsecFormatted(finalSummary[day].reduce((a, b) => a + b, 0))}</Table.Cell>
                            )
                        })}
                    </Table.Row>
                    {showDetails === true && Object.keys(finalDetailsSummary).sort().map(description => {
                        const sumAllDescriptions = checkDays.map(day => {
                            if (finalDetailsSummary[description][day] === undefined){
                                return 0;
                            }
                            return (finalDetailsSummary[description][day].reduce((a, b) => a + b, 0));
                        }).reduce((a, b) => { return (a + b) });                        

                        return (
                            <Table.Row key={description}>
                                <Table.Cell style={{textIndent: "50px"}}>{description === "" ? "n.a." : description}</Table.Cell>
                                <Table.Cell >{getTimeFromMsecFormatted(sumAllDescriptions)}</Table.Cell>
                                {checkDays.map(day => {
                                    if (finalDetailsSummary[description][day] === undefined){
                                        return <Table.Cell key={item + day}></Table.Cell>
                                    }
                                    return (
                                        <Table.Cell key={item + day}>{getTimeFromMsecFormatted(finalDetailsSummary[description][day].reduce((a, b) => a + b, 0))}</Table.Cell>
                                    )
                                })}
                            </Table.Row>
                        )
                    })}
                    
                </React.Fragment>
            )
        })
    }

    const detailsButton = () => {
        const text = showDetails ? "Summary" : "Details"
        return <Button onClick={() => setShowDetails(!showDetails)}>{text}</Button>
    }

    // return core elements
    return (
        <div>
            <Table celled>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>{detailsButton()}</Table.HeaderCell>
                        <Table.HeaderCell></Table.HeaderCell>
                        {checkDays.map(item => {                            
                            return <Table.HeaderCell key={item}>{item}</Table.HeaderCell>
                        })}
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {renderThreeLevel()}
                    <Table.Row>
                        <Table.Cell></Table.Cell>
                        <Table.Cell>{getTimeFromMsecFormatted(dailySum?.total)}</Table.Cell>
                        {checkDays.map(item => {                            
                            return <Table.Cell key={item}>{dailySum ? getTimeFromMsecFormatted(dailySum[item]) : ''}</Table.Cell>
                        })}
                    </Table.Row>
                </Table.Body>
            </Table>
        </div>
    );
}

export default WeekDataSummary;