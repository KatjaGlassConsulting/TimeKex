import React, { useState } from 'react';
import { useSelector } from 'react-redux'
import { Button, Table, Icon } from 'semantic-ui-react';
import { connect } from "react-redux";

import { pushAllTimesheets, deleteTimesheets } from '../features/updateTimesheets/updateTimesheetsSlice';
import { fetchAllTimesheets } from '../features/kimaiTimesheets/kimaiTimesheetsSlice';
import ConfirmDeleteInKimai from './ConfirmDeleteInKimai';
import { checkExcelTimeOverlays, investigateHours } from '../functions/general';
import {getIdFromKimaiData} from '../features/kimaiDB/kimaiSlice';

import '../css/weekDataDisplay.css';

export const WeekDataDisplay = ({ dispatch }) => {
    // Get all information from the store (nearly all)
    const excelDataStatus = useSelector((state) => state.excelData.status);
    const excelData = useSelector((state) => state.excelData.data);
    const excelValidationError = useSelector((state) => state.excelData.validationError);
    const excelSelectedWeek = useSelector((state) => state.excelData.selectedWeek);

    const kimaiData = useSelector((state) => state.kimaiData);
    const config = useSelector((state) => state.config);
    const userId = useSelector((state) => state.kimaiData.userId);
    const kimaiDataStatus = useSelector((state) => state.kimaiData.status);

    const kimaiTimesheets = useSelector((state) => state.kimaiTimesheets.data);
    const kimaiTimesheetsStatus = useSelector((state) => state.kimaiTimesheets.status);

    const kimaiSubmittedTimesheets = useSelector((state) => state.updateTimesheets.data);
    const deletedTimesheets = useSelector((state) => state.updateTimesheets.deletedData);
    const deleteIssues = useSelector((state) => state.updateTimesheets.deleteError);
    const kimaiSubmittedStatus = useSelector((state) => state.updateTimesheets.status);

    // investigate enabled/disabled button
    const onSendDisabled = (kimaiSubmittedStatus === "idle" &&
        excelDataStatus === 'succeeded' &&
        kimaiDataStatus === 'succeeded' &&
        kimaiTimesheetsStatus === 'succeeded') ? false : true;

    const [displayConfirmDeleteInKimai, setDisplayConfirmDeleteInKimai] = useState(false);

    const printHints = (errors) => {
        return (errors.map(item => {
            return (<li>{item.error + " - ExcelRow: " + item.row + " - ExcelColumn: " + item.column}</li>)
        }))
    }

    // When there had been an Excel Error, print information
    if (excelDataStatus === 'succeeded' && (excelData.length === 0 || excelValidationError.length !== 0)){
        return(
            <div>
                <h2>ISSUE WITH EXCEL FILE:</h2><br/>
                <p>Please make sure that first tab in Excel contains the Timesheet data.</p>
                <p>The column titles must be available in the first row.</p>
                <p>Please check also the column title names are as pre-specified - additional columns are supported, order does not matter.</p>
                {printHints(excelValidationError)}
            </div>
        )
    }

    // If busy, process first and doe not return anything (reading information first)
    if (excelDataStatus !== 'succeeded' || kimaiSubmittedTimesheets.length === 0 || !excelSelectedWeek ||
        kimaiDataStatus !== 'succeeded' ||
        (kimaiTimesheetsStatus !== 'succeeded' &&
            kimaiSubmittedStatus === 'idle')) {
        return null;
    }

    // Excel: select CALENDERWEEK - get ID numbers for user, project and activity
    var excelDisplayData = [...excelData.filter(item => item.week.week === excelSelectedWeek)];
    excelDisplayData = excelDisplayData.map((item) => {
        var description = [item.tasks, item.details].filter(Boolean).join(" - ");
        var activityId = null;
        if (item.activity){
            activityId = getIdFromKimaiData(kimaiData,item.customer, item.project, item.activity);
            if (!activityId){
                activityId = getIdFromKimaiData(kimaiData, null, null, item.activity);
            }
        }

        return ({
            ...item,
            userId: kimaiData.userId,
            projectId: getIdFromKimaiData(kimaiData,item.customer, item.project, null),
            activityId: activityId,
            description: description,
            billable: item.chargeableCorrected !== undefined ? item.chargeableCorrected : item.chargeable,
            timesheetId: null
        }
        );
    });

    // Kimai: select data of corresponding calenderweek
    const startDay = excelDisplayData[0].week.weekStartDay;
    const endDay = excelDisplayData[0].week.weekEndDay;
    var kimaiDisplayData = kimaiTimesheets.filter(item => item.begin.split('T')[0] >= startDay && item.end?.split('T')[0] <= endDay);

    // loop through DB data and update Sheet link if available, otherwise include into display data
    kimaiDisplayData.forEach(item => {  
        const entry = {
            timesheetId: item.id,
            date: item.begin.split('T')[0],
            start: item.begin.substring(11, 16),
            end: item.end.substring(11, 16),
            project: kimaiData.projects[item.project].name,
            projectId: item.project,
            customer: kimaiData.projects[item.project].customer.name || "ERROR - invalid customer",
            customerId: kimaiData.projects[item.project]?.customer.id || "ERROR - invalid project",
            activity: kimaiData.activities[item.activity]?.name || "ERROR - invalid activity",
            activityId: item.activity,
            description: item.description ? item.description : "",
            billable: item.billable
        };

        // check whether entry is available
        var found = false;
        excelDisplayData.forEach(excelItem => {
            if (!excelItem.timesheetId &&
                excelItem.date === entry.date &&
                excelItem.start === entry.start &&
                excelItem.end === entry.end &&
                excelItem.project === entry.project &&
                excelItem.activity === entry.activity &&
                excelItem.description === entry.description &&
                excelItem.billable === entry.billable
            ) {
                excelItem.timesheetId = entry.timesheetId;
                found = true;
            }
        })
        if (!found) {
            excelDisplayData.push(entry);
        }
    })

    // included previously deleted entries
    if (deletedTimesheets?.length > 0) {
        const deletedIDs = deletedTimesheets.map(item => item.timesheetId);
        excelDisplayData = excelDisplayData.filter(item => !deletedIDs.includes(item.timesheetId)).concat(deletedTimesheets);
    }

    // supporter function to include error message text
    const includeError = (item, message) => {
        item.action = "error";
        if (!item.message) {
            item.message = []
            item.message.push(message);
        }
        else {
            item.message.push(message);
        }
    }

    // loop through excel data and investigate action
    excelDisplayData.forEach(item => {
        if (!item.action) {
            // set actions and 
            if (config.ignoreActivities && config.ignoreActivities.includes(item.activity)) {
                item.action = "ignore";
                item.message = ["Activity '" + item.activity + "' is always ignored by configuration."];
            }
            else if (item.lineNumber && item.timesheetId) {
                item.action = "none";
            }
            else if (item.lineNumber && !item.timesheetId) {
                // available in Excel, but not in Kimai
                item.action = (!kimaiSubmittedTimesheets[item.lineNumber]) ? "add" : "added";
            }
            else if (!item.lineNumber && item.timesheetId) {
                // available in Kimai, but not in Excel
                item.action = "delete";
                item.message = ["This item is available in Kimai, but not in the ExcelSheet. It will be deleted from Kimai."];
            }

            // perform checks on Excel content, update messages
            if (item.lineNumber && item.action === "add") {
                if (!item.activityId) {
                    includeError(item, "Activitiy not found in Kimai.");
                }
                if (!item.projectId) {
                    includeError(item, "Project not found in Kimai.");
                }
                if (!item.start) {
                    includeError(item, "Start time must not be missing.");
                }
                if (!item.end) {
                    includeError(item, "End time must not be missing.");
                }
            }
        }
    });

    // check whether there are time overlay conflicts
    checkExcelTimeOverlays(excelDisplayData);
    // investigate hours
    var hours = investigateHours(excelDisplayData);

    // display error message text in DIV elements with <BR>s
    const displayMessages = (messages) => {
        return (
            messages.map((item, index) => { return (<div key={"displayMessage" + index}>{item}<br /></div>); })
        );
    }

    // create action display
    const displayAction = (item, submittedTimesheet, deleteIssues) => {
        if (!submittedTimesheet && !deleteIssues) {
            if (item.message) {
                return (
                    <Table.Cell className="cellOuterComment" disabled={false}>
                        {item.action}
                        <Icon name='info' />
                        <span className="cellComment">{displayMessages(item.message)}</span>
                    </Table.Cell>
                );
            }
            else {
                return <Table.Cell>{item.action}</Table.Cell>
            }
        }
        if (submittedTimesheet) {
            if (submittedTimesheet.hasIssue === false) {
                return <Table.Cell positive>added</Table.Cell>
            }
            else {
                return (
                    <Table.Cell negative className="cellOuterComment">
                        Failure (add)
                        <Icon name='info' />
                        <span className="cellComment">{submittedTimesheet.errorMessage}</span>
                    </Table.Cell>
                );
            }
        }
        else {
            return (
                <Table.Cell negative className="cellOuterComment">
                    Failure (del)
                    <Icon name='info' />
                    <span className="cellComment">{deleteIssues.errorMessage}</span>
                </Table.Cell>
            );
        }

    }

    // create row display
    const displayData = () => {
        return (
            excelDisplayData.map((item) => {
                if (deleteIssues[item.timesheetId] && item.action === "delete") {
                    return null;
                }

                var rowColorCode = "";
                var overlayColorCode = "";

                if (item.action === "none" || item.action === "ignore") {
                    rowColorCode = "lightGrey";
                }
                if (kimaiSubmittedTimesheets[item.lineNumber]) {
                    rowColorCode = kimaiSubmittedTimesheets[item.lineNumber].hasIssue === false ? "positive" : "negative"
                }
                if (item.action === "deleted") {
                    rowColorCode = "positive"
                }

                if (item.overlayIssue) {
                    overlayColorCode = "orange";
                }

                const negativeProject = !kimaiData.projects[item.projectId] && item.action !== "ignore" ? true : false;
                const negativeActivity = !kimaiData.activities[item.activityId] && item.action !== "ignore" ? true : false;
                const negativeStart = !item.start && item.action !== "ignore" ? true : false;
                const negativeEnd = !item.end && item.action !== "ignore" ? true : false;

                return (
                    <Table.Row key={[item.lineNumber, item.timesheetId].join()} className={rowColorCode}>

                        {displayAction(item, kimaiSubmittedTimesheets[item.lineNumber], deleteIssues[item.timesheetId])}
                        <Table.Cell>{item.lineNumber}</Table.Cell>
                        <Table.Cell>{item.timesheetId}</Table.Cell>
                        <Table.Cell className={overlayColorCode}>{item.date}</Table.Cell>
                        <Table.Cell negative={negativeStart} className={overlayColorCode}>{item.start}</Table.Cell>
                        <Table.Cell negative={negativeEnd} className={overlayColorCode}>{item.end}</Table.Cell>
                        <Table.Cell>{item.customer}</Table.Cell>
                        <Table.Cell negative={negativeProject}>{item.project}</Table.Cell>
                        <Table.Cell negative={negativeActivity}>{item.activity}</Table.Cell>
                        <Table.Cell>{item.description}</Table.Cell>
                        {
                            (item.billable)
                                ? <Table.Cell><Icon name='checkmark' /></Table.Cell>
                                : <Table.Cell><Icon name='close' /></Table.Cell>
                        }
                    </Table.Row>
                );
            })
        );
    }

    // perform update actions and afterwards trigger re-read from Kimai
    const performSendToKimaiClick = () => {
        setDisplayConfirmDeleteInKimai(false);

        // add new timeSheets to Kimai
        var submitExcelData = excelDisplayData.filter(item => item.action === "add");
        dispatch(pushAllTimesheets({ data: submitExcelData, config: config }));

        // remove timeSheets in Kimai
        var removeAccordingExcelData = excelDisplayData.filter(item => item.action === "delete");
        dispatch(deleteTimesheets({ data: removeAccordingExcelData, config: config }));

        // update information - fetch from database
        setTimeout(function () {
            dispatch(fetchAllTimesheets({ ...config, userId: userId }))
        }, 5000);
    }

    const abortSendToKimaiClick = () => {
        setDisplayConfirmDeleteInKimai(false);
    }

    // display modal to check to really remove items from Kimai
    const onSendToKimaiClick = () => {
        var removeAccordingExcelData = excelDisplayData.filter(item => item.action === "delete");
        if (removeAccordingExcelData.length === 0) {
            performSendToKimaiClick();
        }
        else {
            setDisplayConfirmDeleteInKimai(true);
        }
    }

    const niceTimeDisplay = (times) => {
        const mins = times.mins > 9 ? times.mins : "0" + times.mins;
        return times.hours.toString() + ":" + mins;
    }

    // return core elements
    return (
        <div>
            <table>
                <tbody>
                    <tr>
                        <td><Button onClick={onSendToKimaiClick} disabled={onSendDisabled}>Send to Kimai</Button></td>
                        <td>Hours: {niceTimeDisplay(hours.sumTimes)}</td>
                        <td>/</td>
                        <td>Billable hours: {niceTimeDisplay(hours.sumTimesBillable)}</td>
                    </tr>                
                </tbody>
            </table>            
            <ConfirmDeleteInKimai
                open={displayConfirmDeleteInKimai}
                callbackYes={performSendToKimaiClick}
                callbackNo={abortSendToKimaiClick}
            />
            <Table celled>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Action</Table.HeaderCell>
                        <Table.HeaderCell>Line</Table.HeaderCell>
                        <Table.HeaderCell>ID</Table.HeaderCell>
                        <Table.HeaderCell>Date</Table.HeaderCell>
                        <Table.HeaderCell>Start</Table.HeaderCell>
                        <Table.HeaderCell>End</Table.HeaderCell>
                        <Table.HeaderCell>Customer</Table.HeaderCell>
                        <Table.HeaderCell>Project</Table.HeaderCell>
                        <Table.HeaderCell>Activity</Table.HeaderCell>
                        <Table.HeaderCell>Description</Table.HeaderCell>
                        <Table.HeaderCell>Billable</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {displayData()}

                </Table.Body>
            </Table>
        </div>
    );
}

export default connect()(WeekDataDisplay);