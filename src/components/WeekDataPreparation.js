import React from 'react'
import { useSelector } from 'react-redux'

import { getIdFromKimaiData } from '../features/kimaiDB/kimaiSlice'
import WeekDataDisplay from './WeekDataDisplay'
import WeekDataBreaks from './WeekDataBreaks'
import WeekDataSummary from './WeekDataSummary'
import { checkExcelTimeOverlays, investigateBreaks, investigateSummary, investigateMinIssue, includesCaseInsensitive } from '../functions/general'
import { Tab } from 'semantic-ui-react'

export const WeekDataPreparation = () => {
    // Get all information from the store (nearly all)
    const excelDataStatus = useSelector((state) => state.excelData.status)
    const excelData = useSelector((state) => state.excelData.data)
    const excelValidationError = useSelector(
        (state) => state.excelData.validationError
    )
    const excelSelectedWeek = useSelector(
        (state) => state.excelData.selectedWeek
    )

    const kimaiData = useSelector((state) => state.kimaiData)
    const config = useSelector((state) => state.config)
    const kimaiDataStatus = useSelector((state) => state.kimaiData.status)

    const kimaiTimesheets = useSelector((state) => state.kimaiTimesheets.data)
    const kimaiTimesheetsStatus = useSelector(
        (state) => state.kimaiTimesheets.status
    )

    const kimaiSubmittedTimesheets = useSelector(
        (state) => state.updateTimesheets.data
    )
    const deletedTimesheets = useSelector(
        (state) => state.updateTimesheets.deletedData
    )
    const kimaiSubmittedStatus = useSelector(
        (state) => state.updateTimesheets.status
    )

    // investigate enabled/disabled button
    const onSendDisabled =
        kimaiSubmittedStatus === 'idle' &&
        excelDataStatus === 'succeeded' &&
        kimaiDataStatus === 'succeeded' &&
        kimaiTimesheetsStatus === 'succeeded'
            ? false
            : true

    const printHints = (errors) => {
        return errors.map((item, index) => {
            return (
                <li key={index}>
                    {item.error +
                        ' - ExcelRow: ' +
                        item.row +
                        ' - ExcelColumn: ' +
                        item.column}
                </li>
            )
        })
    }

    // When there had been an Excel Error, print information
    if (
        excelDataStatus === 'succeeded' &&
        (excelData.length === 0 || excelValidationError.length !== 0)
    ) {
        return (
            <div>
                <h2>ISSUE WITH EXCEL FILE:</h2>
                <br />
                <p>
                    Please make sure that first tab in Excel contains the
                    Timesheet data.
                </p>
                <p>The column titles must be available in the first row.</p>
                <p>
                    Please check also the column title names are as
                    pre-specified - additional columns are supported, order does
                    not matter.
                </p>
                {printHints(excelValidationError)}
            </div>
        )
    }

    // If busy, process first and doe not return anything (reading information first)
    if (
        excelDataStatus !== 'succeeded' ||
        kimaiSubmittedTimesheets.length === 0 ||
        !excelSelectedWeek ||
        kimaiDataStatus !== 'succeeded' ||
        (kimaiTimesheetsStatus !== 'succeeded' &&
            kimaiSubmittedStatus === 'idle')
    ) {
        return null
    }

    // Excel: select CALENDERWEEK - get ID numbers for user, project and activity
    var excelDisplayData = [
        ...excelData.filter((item) => item.week.weekStartDay === excelSelectedWeek.weekStartDay),
    ]
    excelDisplayData = excelDisplayData.map((item) => {
        var description = item.description ? item.description : ""
        var activityId = null
        if (item.activity) {
            activityId = getIdFromKimaiData(
                kimaiData,
                item.customer,
                item.project,
                item.activity
            )
            if (!activityId) {
                activityId = getIdFromKimaiData(
                    kimaiData,
                    null,
                    null,
                    item.activity
                )
            }
        }

        return {
            ...item,
            userId: kimaiData.userId,
            projectId: getIdFromKimaiData(
                kimaiData,
                item.customer,
                item.project,
                null
            ),
            activityId: activityId,
            customerId: getIdFromKimaiData(
                kimaiData,
                item.customer,
                null,
                null
            ),
            description: description,
            billable:
                item.chargeableCorrected !== undefined
                    ? item.chargeableCorrected
                    : item.chargeable,
            timesheetId: null,
        }
    })

    // Kimai: select data of corresponding calenderweek
    const startDay = excelDisplayData[0].week.weekStartDay
    const endDay = excelDisplayData[0].week.weekEndDay
    var kimaiDisplayData = kimaiTimesheets.filter(
        (item) =>
            item.begin.split('T')[0] >= startDay &&
            item.end?.split('T')[0] <= endDay
    )

    // loop through DB data and update Sheet link if available, otherwise include into display data
    const timeSheetsAlreadyMatched = []
    kimaiDisplayData.forEach((item) => {
        const entry = {
            timesheetId: item.id,
            date: item.begin.split('T')[0],
            start: item.begin.substring(11, 16),
            end: item.end.substring(11, 16),
            project: kimaiData.projects[item.project]?.name || 'ERROR - invalid/invisable project',
            projectId: item.project,
            customer:
                kimaiData.projects[item.project]?.customer.name ||
                'ERROR - invalid customer',
            customerId:
                kimaiData.projects[item.project]?.customer.id ||
                'ERROR - invalid project',
            activity:
                kimaiData.activities[item.activity]?.name ||
                'ERROR - invalid activity',
            activityId: item.activity,
            description: item.description ? item.description : '',
            billable: item.billable,
        }

        // check whether entry is available
        var found = false
        excelDisplayData.forEach((excelItem) => {
            if (
                !excelItem.timesheetId &&
                excelItem.date === entry.date &&
                excelItem.start === entry.start &&
                excelItem.end === entry.end &&
                excelItem.project?.toLowerCase() ===
                    entry.project?.toLowerCase() &&
                excelItem.activity?.toLowerCase() ===
                    entry.activity?.toLowerCase() &&
                excelItem.description === entry.description &&
                excelItem.billable === entry.billable &&
                !timeSheetsAlreadyMatched.includes(entry.timesheetId)
            ) {
                excelItem.timesheetId = entry.timesheetId
                found = true
                timeSheetsAlreadyMatched.push(entry.timesheetId)
            }
        })
        if (!found) {
            excelDisplayData.push(entry)
        }
    })

    // included previously deleted entries
    if (deletedTimesheets?.length > 0) {
        const deletedIDs = deletedTimesheets.map((item) => item.timesheetId)
        excelDisplayData = excelDisplayData
            .filter((item) => !deletedIDs.includes(item.timesheetId))
            .concat(deletedTimesheets)
    }

    // supporter function to include error message text
    const includeError = (item, message) => {
        item.action = 'error'
        if (!item.message) {
            item.message = []
            item.message.push(message)
        } else {
            item.message.push(message)
        }
    }

    // loop through excel data and investigate action
    excelDisplayData.forEach((item) => {        
        if (!item.action) {
            // set actions and provide message if applicable
            if ( 
                config.ignoreActivities &&
                includesCaseInsensitive(config.ignoreActivities, item.activity)
            ) {
                item.action = 'ignore'
                item.message = [
                    "Activity '" +
                        item.activity +
                        "' is always ignored by configuration.",
                ]
            }
            else if (
                config.ignoreProjects &&
                includesCaseInsensitive(config.ignoreProjects, item.project)
            ) {
                item.action = 'ignore'
                item.message = [
                    "Project '" +
                        item.project +
                        "' is always ignored by configuration.",
                ]
            } else if (item.lineNumber && item.timesheetId) {
                item.action = 'none'
            } else if (item.lineNumber && !item.timesheetId) {
                // available in Excel, but not in Kimai
                item.action = !kimaiSubmittedTimesheets[item.lineNumber]
                    ? 'add'
                    : 'added'
            } else if (!item.lineNumber && item.timesheetId) {
                // available in Kimai, but not in Excel
                item.action = 'delete'
                item.message = [
                    'This item is available in Kimai, but not in the ExcelSheet. It will be deleted from Kimai.',
                ]
            }

            // perform checks on Excel content, update messages
            if (item.lineNumber && item.action === 'add') {                
                if (!item.activityId) {
                    includeError(item, 'Activitiy not found in Kimai.')
                }
                if (!item.projectId) {
                    includeError(item, 'Project not found in Kimai.')
                }
                if (!item.customerId) {
                    includeError(item, 'Customer not found in Kimai.')
                }
                if (!item.start) {
                    includeError(item, 'Start time must not be missing.')
                }
                if (!item.end) {
                    includeError(item, 'End time must not be missing.')
                }
            }
        }
    })

    // check whether there are time overlay conflicts
    checkExcelTimeOverlays(excelDisplayData)

    // check break conflicts
    const breaks = investigateBreaks(excelDisplayData, config.durationCustomers)

    // create summmary / check 15-min sum
    // const summary = investigateSummary(excelDisplayData)
    const summary= investigateSummary(excelDisplayData);

    let breakMenu = 'Breaks';
    if (breaks && breaks.map(item => item.anyIssue).includes(true)){
        breakMenu = { key: 'breaks', icon: 'exclamation triangle', content: 'Breaks' }
    }

    let summaryMenu = 'Summary';
    if (investigateMinIssue(summary)){
        summaryMenu = { key: 'summary', icon: 'exclamation triangle', content: 'Summary' }
    }
    
    let panes = [
        {
            menuItem: 'Entry Overview',
            render: () => (
                <Tab.Pane>
                    <WeekDataDisplay
                        excelDisplayData={excelDisplayData}
                        onSendDisabled={onSendDisabled}
                    />
                </Tab.Pane>
            ),
        }]
    if (config.breakChecks !== false){
        panes.push(
        {
            menuItem: breakMenu,
            render: () => (
                <Tab.Pane>
                    <WeekDataBreaks breaks={breaks} />
                </Tab.Pane>
            ),
        });
    }
    if (config.summary15mins !== false){
        panes.push(
        {
            menuItem: summaryMenu,
            render: () => (
                <Tab.Pane>
                    <WeekDataSummary summary={summary} excelDisplayData={excelDisplayData}/>
                </Tab.Pane>
            ),
        });
    }
    

    return (
        <div>
            <Tab panes={panes} />
        </div>
    )
}

export default WeekDataPreparation
