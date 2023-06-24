import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch  } from 'react-redux'
import { Table, Button, Icon } from 'semantic-ui-react';

import { schema } from './CreateDBDataExcel/ExcelSchemaImports'
import { updateSchema } from '../functions/excelSchemaFunctions'

import '../css/adminContentTable.css';
import { createMetaData } from '../functions/createMetaData';
import { fetchRawData } from '../features/kimaiRawData/kimaiRawSlice';
import ConfirmSendGeneric from './ConfirmSendGeneric';

export function AdminContentBox(props) {
    const excelMetaDataStatus = useSelector((state) => state.excelMetaData.status)
    const excelMetaData = useSelector((state) => state.excelMetaData)
    const kimaiRawDataStatus = useSelector((state) => state.kimaiRawData.status)
    const kimaiRawData = useSelector((state) => state.kimaiRawData)
    const kimaiRawDataFinishedByTriggerRow = useSelector((state) => state.kimaiRawData.trigger)
    const config = useSelector((state) => state.config)

    const dispatch = useDispatch()

    const [kimaiList, setKimaiList] = useState([])
    const [excelList, setExcelList] = useState([])
    const [displayData, setDisplayData] = useState([])
    const [submitErrors, setSubmitErrors] = useState({})
    const [height, setHeigth] = useState({})
    const [displayConfirmSend, setDisplayConfirmSend] = useState(false);
    const [processPrevRowIndex, setprocessPrevRowIndex] = useState(-1);

    useEffect(() => {
        setHeigth(window.innerHeight)
        window.addEventListener('resize', updateWindowDimensions, false)

        return () => {
            window.removeEventListener("resize", updateWindowDimensions);
        }
    }, [])

    const updateWindowDimensions = () => {
        setHeigth(window.innerHeight)
    }

    // not available from Kimai API: customer_country, customer_timezone, project_budget, activitiy_budget, activitiy_rate
    // create kimaiList
    useEffect(() => {
        if (kimaiRawData.status !== 'succeeded') {
            return
        }
        const kimaiRawActivities = kimaiRawData.activitiesFull
        const kimaiRawProjects = kimaiRawData.projectsFull
        const kimaiRawCustomers = kimaiRawData.customersFull
        const finalResult = []
        kimaiRawActivities.forEach((activitiy) => {
            const result = {}
            const projectList = kimaiRawProjects.filter(
                (element) => element.id === activitiy.project
            )
            const project = projectList.length === 1 ? projectList[0] : null
            let customer = null
            if (project) {
                const customersList = kimaiRawCustomers.filter(
                    (element) => element.id === project.customer
                )
                if (customersList.length === 1) {
                    customer = customersList[0]
                }
            }

            result.customer = project?.parentTitle
            result.customerID = project?.customer
            result.project = project?.name
            result.projectID = activitiy.project
            result.activity = activitiy.name
            result.activityID = activitiy.id
            result.a_abrechenbar = activitiy.billable
            result.customer_currency = customer?.currency
            result.customer_comment = customer?.comment
            if (project) {                
                result.project_start = project?.start?.split('T')[0]
                result.project_end = project?.end?.split('T')[0]
                result.project_comment = project?.comment
                result.abrechenbar = project?.billable
                result.visible = project?.visible

                const projectMetaItems = config.meta.filter(element => element.scope === "project")
                for (let i = 0; i < projectMetaItems.length; i++) {
                    const metaItem = projectMetaItems[i]
                    const value = project.metaFields.filter(
                        (e) => e.name === metaItem.dbname
                    )
                    if (value.length === 1) {
                        result[metaItem.name] = value[0].value
                    }
                }
            }
            const activityMetaItems = config.meta.filter(element => element.scope === "activity")
            for (let i = 0; i < activityMetaItems.length; i++) {                
                const metaItem = activityMetaItems[i]
                const value = activitiy.metaFields.filter(
                    (e) => e.name === metaItem.dbname
                )
                if (value.length === 1) {
                    result[metaItem.name] = value[0].value
                }
            }
            finalResult.push(result)
        })
        finalResult.sort((a, b) =>
            a.customer > b.customer ? 1 : b.customer > a.customer ? -1 : 0
        )
        setKimaiList(finalResult)
    }, [config.meta, kimaiRawData])

    // create excelList
    useEffect(() => {
        if (excelMetaData.status !== 'succeeded') {
            setSubmitErrors({})
            return
        }

        const finalResult = []
        excelMetaData.data.forEach((excelItem, index) => {
            if (excelItem.customer !== 'DELETE') {
                const itemReturn = { ...excelItem }
                const itemErrors = excelMetaData.validationError.filter(
                    (item) => item.row === index
                )
                itemReturn.errors = itemErrors
                finalResult.push(itemReturn)
            }
        })
        finalResult.sort((a, b) =>
            a.customer > b.customer ? 1 : b.customer > a.customer ? -1 : 0
        )
        setExcelList(finalResult)
    }, [config.meta, excelMetaData])

    // create displayList
    useEffect(() => {
        if (
            excelMetaDataStatus === 'succeeded' &&
            kimaiRawDataStatus === 'succeeded'
        ) {
            const finalSchema = updateSchema(schema, config.meta)            

            // add all items from Excel - update if also in kimaiList
            const finalResult = []
            excelList.forEach((item) => {
                item.a_abrechenbar = item.abrechenbar
                const itemReturn = { ...item }
                const kimaiPendant = kimaiList.filter(
                    (el) =>
                        el.customer === item.customer &&
                        el.project === item.project &&
                        el.activity === item.activity
                )
                if (kimaiPendant.length !== 1) {
                    itemReturn.action = 'create'
                    const customer = kimaiList.filter(el => el.customer === item.customer)
                    if (customer.length > 0){
                        itemReturn.customerID = customer[0].customerID
                    }
                    const project = kimaiList.filter(el => el.customer === item.customer && el.project === item.project)
                    if (project.length > 0){
                        itemReturn.projectID = project[0].projectID
                    }
                } else {
                    itemReturn.customerID = kimaiPendant[0].customerID
                    itemReturn.projectID = kimaiPendant[0].projectID
                    itemReturn.activityID = kimaiPendant[0].activityID

                    itemReturn.differences = []
                    const fullKeyList = Object.keys(finalSchema).concat(["a_abrechenbar"])
                    fullKeyList.forEach((attrib) => {
                        if (
                            item[attrib] !== kimaiPendant[0][attrib] &&
                            item[attrib]?.toString() !== kimaiPendant[0][attrib]?.toString() &&
                            [
                                'customer_country',
                                'customer_timezone',
                                'project_budget',
                                'activitiy_budget',
                                'activitiy_rate',
                            ].indexOf(attrib) < 0
                        ) {
                            if (
                                !(
                                    item[attrib] === undefined &&
                                    kimaiPendant[0][attrib] === null
                                ) &&
                                !(
                                    item[attrib] === undefined &&
                                    kimaiPendant[0][attrib] === ''
                                ) &&
                                !(
                                    item[attrib] === 0 &&
                                    kimaiPendant[0][attrib] === false
                                ) &&
                                !(
                                    item[attrib] === 1 &&
                                    kimaiPendant[0][attrib] === true
                                ) &&
                                !(
                                    item[attrib] === false &&
                                    kimaiPendant[0][attrib] === '0'
                                ) &&
                                !(
                                    item[attrib] === true &&
                                    kimaiPendant[0][attrib] === '1'
                                )
                            ) {
                                itemReturn.differences.push({
                                    column: attrib,
                                    value: kimaiPendant[0][attrib],
                                })
                            }
                        }
                    })
                    if (itemReturn.differences.length > 0) {
                        itemReturn.action = 'change'
                    } else {
                        itemReturn.action = 'ok'
                    }
                }
                finalResult.push(itemReturn)
            })
            setDisplayData(finalResult)
        }
    }, [
        excelMetaDataStatus,
        kimaiRawDataStatus,
        kimaiList,
        excelList,
        config.meta,
    ])

    if (
        excelMetaDataStatus !== 'succeeded' ||
        kimaiRawDataStatus !== 'succeeded'
    ) {
        return null
    }

    const schemaList = updateSchema(schema, config.meta)
    const fullKeyList = Object.keys(schemaList).concat(["a_abrechenbar"])

    const noDataList = [
        'customer_country',
        'customer_timezone',
        'project_budget',
        'activitiy_budget',
        'activitiy_rate',
    ]  

    const renderTable = () => {
        return(
            <Table celled compact singleLine>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>
                            Action
                            <Button icon size='mini' onClick={processAllRows} loading={processPrevRowIndex >= 0}>
                                <Icon name='sync'/>
                            </Button>
                        </Table.HeaderCell>
                        {fullKeyList.map( attrib => {
                            const label = attrib.replace('customer_comment','c_comment')
                                                .replace('project_comment','p_comment')
                                                .replace('activity_comment','a_comment')
                                                .replace('project_budget','p_budget')
                                                .replace('activitiy_budget','a_budget')
                                                .replace('activitiy_rate','a_rate')
                                                .replace('customer_','')
                                                .replace('MP_','')
                                                .replace('project_','')
                                                .replace('meta_','');
                            return (<Table.HeaderCell key={attrib}>{label}</Table.HeaderCell>)
                        })}
                    </Table.Row>
                </Table.Header>

                <Table.Body>{renderTableContent()}</Table.Body>
            </Table>
        )
    }

    const processAllRows = () => {
        setDisplayConfirmSend(true)
    }

    const performUpdateAllRows = () => {
        setDisplayConfirmSend(false)
        startNextProcessingRow(0)
    }

    const abortUpdateAllRows = () => {
        setDisplayConfirmSend(false)
    }

    const processRow = (index) => {
        if (displayData[index].action === 'create' || displayData[index].action === 'change') {
            createMetaData(displayData[index], config, finishProcessRow, index)
        }
    }

    const finishProcessRow = (result, index) => {
        if (Array.isArray(result) && result.length > 0){
            const errors = {...submitErrors}            
            errors[index] = result
            setSubmitErrors(errors)
        }
        dispatch(fetchRawData({config:config, trigger:index}))
    }

    const startNextProcessingRow = (index) => {
        let nextRow = index + 1
        while ( nextRow < displayData.length && 
                displayData[nextRow].action !== 'create' && 
                displayData[nextRow].action !== 'change'){
            nextRow++;
        }
        if (nextRow < displayData.length){
            processRow(nextRow)
            setprocessPrevRowIndex(nextRow)
        } else {
            setprocessPrevRowIndex(-1)
        }
    }

    // process one-by-one row processing
    if (kimaiRawDataFinishedByTriggerRow === processPrevRowIndex && 
        kimaiRawDataFinishedByTriggerRow > -1 &&
        displayData[processPrevRowIndex].action === "ok"){
            startNextProcessingRow(processPrevRowIndex)        
    }

    // display error message text in DIV elements with <BR>s
    const displayMessages = (messages) => {
        return (
            messages.map((item, index) => { return (<div key={"displayMessage" + index}>{item}<br /></div>); })
        );
    }

    const renderAction = (rowData, index) => {
        if (submitErrors[index] === undefined) {
            return (
                <Table.Cell>
                    { rowData.action === "ok" &&
                        rowData.action
                    }
                    { rowData.action !== "ok" &&
                        <Button
                            content={rowData.action}
                            onClick={() => processRow(index)}
                        />
                    }
                </Table.Cell>
            )
        }
        else {
            return (
                <Table.Cell className="cellOuterComment" disabled={false}>
                    ERROR
                    <Icon name='info' />
                    <span className="cellComment">{displayMessages(submitErrors[index])}</span>
                </Table.Cell>
            )
        }
    }

    const renderTableContent = () => {        
        return displayData.map((rowData,index) => {
            const rowColor = rowData.action === "change" ? "colorLight1" : rowData.action === "create" ? "colorLight2" : "";
            return(
                <Table.Row key={'ExcelContent' + index} className={rowColor}>
                    {renderAction(rowData, index)}
                    {fullKeyList.map( attrib => {
                        let colorClass = ''
                        let hintText = ''
                        let changesText = null
                        let content = ''
                        if (noDataList.indexOf(attrib) >= 0) {
                            colorClass = 'lightGreyBg'
                        }
                        if (rowData.errors && rowData.errors.filter(el => el.column === attrib).length > 0){
                            colorClass = 'redBg'
                            hintText = rowData.errors.filter(el => el.column === attrib)[0].error
                        }
                        const rowDiff = rowData.differences?.filter(el => el.column === attrib)
                        if (rowData.differences && rowDiff.length > 0){
                            colorClass = 'orangeBg'
                            if (rowDiff[0].value === undefined || rowDiff[0].value === null){
                                changesText = <div>missing</div>
                            } else if (rowDiff[0].value === '0' || rowDiff[0].value === false) {
                                changesText = <div>{'0 / nein'}</div>
                            } else if (rowDiff[0].value === '1' || rowDiff[0].value === true) {
                                changesText = <div>{'1 / ja'}</div>
                            } else {
                                changesText = <div>{rowDiff[0].value}</div>
                            }
                        }
                        if (typeof rowData[attrib] === 'boolean'){
                            content = rowData[attrib] ? 'ja' : 'nein'
                        } else {
                            content = rowData[attrib]
                        }

                        if ((content === undefined || content === null) && changesText){
                            content = 'missing'
                        }

                        return (
                            <Table.Cell key={'contentRow_' + index + attrib} className={colorClass}>
                                {content}{changesText}{hintText}
                            </Table.Cell>
                        )
                    })}                    
                </Table.Row>
            )

            
        })
    }
    
    const maxHeight = height - 220 > 50 ? height - 220 : 200
    return (
        <div className='scrollXY' style={{"maxHeight" : maxHeight + "px"}} >
            {renderTable()}
            <ConfirmSendGeneric
                open={displayConfirmSend}
                callbackYes={performUpdateAllRows}
                callbackNo={abortUpdateAllRows}
                header='Update or create all Customers/Projects/Activities'
                text='Do you really want to update everything? This takes some time.'
            />
        </div>
    )
}

export default AdminContentBox
