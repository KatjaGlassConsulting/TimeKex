import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { Button, Table, Icon, Segment } from 'semantic-ui-react';

import { processTimesheets } from '../features/updateTimesheets/updateTimesheetsSlice';
import { fetchAllTimesheets } from '../features/kimaiTimesheets/kimaiTimesheetsSlice';
import ConfirmDeleteInKimai from './ConfirmDeleteInKimai';
import { investigateHours } from '../functions/general';
import ButtonSubmitToApprobal from './ButtonSubmitToApprobal';
import { updateExcelWeekStatus } from '../features/approvalSlice';
import { loadOvertimeWeek } from '../features/overtimeSlice'

import '../css/weekDataDisplay.css';

export function WeekDataDisplay(props){     
    const excelDisplayData = props.excelDisplayData;
    const onSendDisabled = props.onSendDisabled;
    
    // Get all information from the store (nearly all)    
    const config = useSelector((state) => state.config);
    const userId = useSelector((state) => state.kimaiData.userId);
    const kimaiSubmittedTimesheets = useSelector((state) => state.updateTimesheets.data);
    const deleteIssues = useSelector((state) => state.updateTimesheets.deleteError);
    const addedIssues = useSelector((state) => state.updateTimesheets.error);
    const kimaiSubmittedStatus = useSelector((state) => state.updateTimesheets.status);
    const canBeSubmittedForApprovalStore = useSelector((state) => state.approval.excelWeekStatus);
    const excelSelectedWeek = useSelector((state) => state.excelData.selectedWeek);
    const approvalData = useSelector((state) => state.approval.data);
    const overtimeStatus = useSelector((state) => state.overtime.overtimeStatus);

    const dispatch = useDispatch()

    const [displayConfirmDeleteInKimai, setDisplayConfirmDeleteInKimai] = useState(false);
    const [isModificationAvailable, setIsModificationAvailable] = useState(false);

    useEffect(() => {        
        // Following actions are available: ignore, none, add, added, delete, deleted, error
        // To allow for "Submit for approval", action must not contain any add, delete or error actions
        const isNoModificationAvailable = excelDisplayData.filter(
                (item) =>
                    item.action === 'add' ||
                    item.action === 'delete' ||
                    item.action === 'error'
            ).length === 0;
        setIsModificationAvailable(!isNoModificationAvailable)
        if (canBeSubmittedForApprovalStore[excelSelectedWeek.weekStartDay] !== isNoModificationAvailable && 
            approvalData[excelSelectedWeek.weekStartDay] === 'Not submitted'){
                if (addedIssues !== true) {
                    dispatch(updateExcelWeekStatus({ weekStartDay: excelSelectedWeek.weekStartDay, status: isNoModificationAvailable }))
                }
        }
    }, [excelDisplayData, excelSelectedWeek.weekStartDay, dispatch, canBeSubmittedForApprovalStore, approvalData, addedIssues]);

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

                const negativeCustomer = !item.customerId && item.action !== "ignore" ? true : false;
                const negativeProject = !item.projectId && item.action !== "ignore" ? true : false;
                const negativeActivity = !item.activityId && item.action !== "ignore" ? true : false;
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
                        <Table.Cell negative={negativeCustomer}>{item.customer}</Table.Cell>
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

    const updateTimesheetInformation = () => {
        dispatch(fetchAllTimesheets({ ...config, userId: userId }))
        dispatch(loadOvertimeWeek({week:excelSelectedWeek, config:config}))
    }

    // perform update actions and afterwards trigger re-read from Kimai
    const performSendToKimaiClick = () => {
        setDisplayConfirmDeleteInKimai(false);

        // remove timeSheets in Kimai
        const removeAccordingExcelData = excelDisplayData.filter(item => item.action === "delete");
        const submitExcelData = excelDisplayData.filter(item => item.action === "add");
        dispatch(processTimesheets({ addData: submitExcelData, deleteData: removeAccordingExcelData, config: config, callback: updateTimesheetInformation}))
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

    const renderOvertime = () => {
        if (config.overtime === false){
            return null;
        }
        var returnText = "";
        if (!overtimeStatus[excelSelectedWeek.weekStartDay]){
            return null;
        }
        if (approvalData[excelSelectedWeek.weekStartDay] !== 'Not submitted'){
            returnText = "Overtime end of week: " + overtimeStatus[excelSelectedWeek.weekStartDay].overtimeFormatted;
        } else {
          returnText = "Overtime end of week (Kimai entries): " + overtimeStatus[excelSelectedWeek.weekStartDay].overtimeFormatted;
        }
        return (<div>{returnText}</div>);
    }

    // return core elements
    return (
        <div>
            <table>
                <tbody>
                    <tr>
                        <td>
                            <Button 
                                onClick={onSendToKimaiClick} 
                                disabled={onSendDisabled || (approvalData[excelSelectedWeek.weekStartDay] !== 'Not submitted' && config.approval !== false)}
                                loading={kimaiSubmittedStatus==='loading'}>
                                Send to Kimai
                            </Button>
                        </td>
                        {(config.approval !== false &&
                            <td>{ButtonSubmitToApprobal()}</td>)}
                        <td>Hours: {niceTimeDisplay(hours.sumTimes)} / Billable hours: {niceTimeDisplay(hours.sumTimesBillable)}
                            {renderOvertime()}
                        </td>
                    </tr>
                </tbody>
            </table>
            {approvalData[excelSelectedWeek.weekStartDay] !== 'Not submitted' &&
                    approvalData[excelSelectedWeek.weekStartDay] !== undefined && 
                    config.approval !== false &&
                    isModificationAvailable === true &&
                <Segment>
                    <Icon name='exclamation triangle' size='large' color='red' className='marginText'/>
                    <span style={{margin: "0 5px"}}>
                        <b>ERROR:</b> There are discrepancies between submitted hours and the hours of your Excel file! 
                        Please correct your Excel file or ask your teamlead to cancel the approval workflow to update your hours!
                    </span>
                    <Icon name='exclamation triangle' size='large' color='red'/>
                </Segment>         
            }
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

export default WeekDataDisplay;