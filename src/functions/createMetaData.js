import { kimaiClientPostGeneric } from "../api/kimaiClientPostGeneric";
// import { getIdFromKimaiData } from "../features/kimaiDB/kimaiSlice";


const pushErrorsFromChildren = (allErrors, errors, prefix) => {
    if (errors){
        if (errors.children){
            for (var item in errors.children) {
                if (errors.children[item].errors) {
                    allErrors.push(prefix + ":" + item + ": " + errors.children[item].errors.join());
                }
            }
        }
        else if (errors.message){
            allErrors.push(prefix + ":" + errors.message);
        }
    }
}

const getAllErrorsOnCreate = (result) => {
    const finalReturn = []
    if (result.customer && result.customer.errors){
        pushErrorsFromChildren(finalReturn, result.customer.errors, "customer")
    }
    if (result.project && result.project.errors){
        pushErrorsFromChildren(finalReturn, result.project.errors, "project")
    }
    if (result.projectMeta){
        pushErrorsFromChildren(finalReturn, result.projectMeta.errors, "projectMeta")
    }
    if (result.activity && result.activity.errors){
        pushErrorsFromChildren(finalReturn, result.activity.errors, "activity")
    }
    
    if (result.activityRate && result.activityRate.errors){
        pushErrorsFromChildren(finalReturn, result.activityRate.errors, "activityMeta")
    }
    return finalReturn
}

const getAllErrors = (errors) => {
    var allErrors = [];
    for (var item in errors.children) {
        if (errors.children[item].errors) {
            allErrors.push(item + ": " + errors.children[item].errors.join());
        }
    }
    return allErrors
}

const processResponse = (response) => {
    if ( !response.id && response.errors) {
        return getAllErrors(response.errors)
    } else if ( !response.id ) {
        return response.message
    }
    return null
}

const getString = (text) => {
    return typeof text === "string" ? text : ""
}

export async function createMetaData(data, config, callback, index, batch) {
    if (data.action === "change"){
        const result = await processMetaChange(data, config)
        callback(result, index, batch)
        return
    } else {
        const result = await processMetaCreate(data, config)
        callback(getAllErrorsOnCreate(result), index, batch)
    }
}

async function processMetaCreate (data, config) {
    const finalResult = {}
    const projectMetaItems = config.meta.filter(element => element.scope === "project")
    const activityMetaItems = config.meta.filter(element => element.scope === "activity")
    
    // create customer
    if (isNaN(data.customerID)){
        finalResult.customer = await createCustomer(
            config, 
            data.customer, 
            getString(data.customer_country), 
            getString(data.customer_currency), 
            getString(data.customer_timezone), 
            getString(data.customer_comment))

    }
    // create project
    if (isNaN(data.projectID)){
        const customerID = data.customerID ? data.customerID : finalResult.customer.id
        if (customerID !== undefined && customerID !== null){
            finalResult.project = await createProject(
                config, 
                data.project, 
                customerID,
                getString(data.project_comment), 
                data.project_start ? getString(data.project_start + "T00:00:00") : "", 
                data.project_end ? getString(data.project_end + "T23:59:59") : "", 
                data.abrechenbar, 
                data.project_budget,
                data.visible)
            // create project metadata
            const projectID = finalResult.project.id
            if (projectID) {
                finalResult.projectMeta = []
                for (let i = 0; i < projectMetaItems.length; i++){
                    const value = projectMetaItems[i].type === 'text' ? getString(data[projectMetaItems[i].name]) : data[projectMetaItems[i].name]
                    if (value !== undefined && value !== null && value !== ""){
                        const result = await updateProjectMeta(
                            config, 
                            projectID, 
                            projectMetaItems[i].dbname, 
                            value)
                        finalResult.projectMeta.push(result)
                    }
                }
            }
        }
    }

    // create activity
    const projectID = data.projectID ? data.projectID : finalResult.project?.id
    if (!isNaN(projectID)){
        finalResult.activity = await createActivity(
            config, 
            data.activity,
            projectID,
            data.abrechenbar)
        if (finalResult.activity.id){
            // update activityRate
            finalResult.activityRate = await createActivityRate(
                config, 
                finalResult.activity.id,
                data.activitiy_rate)

            // update activityMeta
            finalResult.activityMeta = []
            for (let i = 0; i < activityMetaItems.length; i++){
                const value = activityMetaItems[i].type === 'text' ? getString(data[activityMetaItems[i].name]) : data[activityMetaItems[i].name]
                if (value !== undefined && value !== null && value !== ""){
                    const result = await updateActivityMeta(
                        config, 
                        finalResult.activity.id, 
                        activityMetaItems[i].dbname, 
                        value)
                    finalResult.activityMeta.push(result)
                }
            }
        }
    }
    return finalResult
}

async function processMetaChange (data, config) {
    const projectMetaItems = config.meta.filter(element => element.scope === "project")
    const activityMetaItems = config.meta.filter(element => element.scope === "activity")
    let finalResult = []

    const changeItems = data.differences.map(el => el.column)

    // update customer if updates in this area
    if (changeItems.some( el => ["customer_country", "customer_currency", "customer_timezone", "customer_comment"].includes(el))){
        const result = await updateCustomer(
            config, 
            data.customerID, 
            getString(data.customer_country), 
            getString(data.customer_currency), 
            getString(data.customer_timezone), 
            getString(data.customer_comment))  
        if (result !== null){
            finalResult = finalResult.concat(result)
        }
    }

    // update project if updates in this area
    if (changeItems.some( el => ["project_start", "project_end", "project_comment", "abrechenbar", "project_budget", "visible"].includes(el))){
        const result = await updateProject(
            config, 
            data.projectID, 
            getString(data.project_comment),
            data.project_start ? getString(data.project_start + "T00:00:00") : "", 
            data.project_end ? getString(data.project_end + "T23:59:59") : "", 
            data.abrechenbar, 
            data.project_budget,
            data.visible)
        if (result !== null){
            finalResult = finalResult.concat(result)
        }
    }

    // update project metadata if available
    for (let i = 0; i < changeItems.length; i++){
        const metaItem = projectMetaItems.filter(el => el.name === changeItems[i])
        if (metaItem.length === 1){
            const value = metaItem[0].type === 'text' ? getString(data[changeItems[i]]) : data[changeItems[i]]
            const result = await updateProjectMeta(
                config, 
                data.projectID, 
                metaItem[0].dbname, 
                value)
            if (result !== null){
                finalResult = finalResult.concat(result)
            }
        }
    }

    // update activity
    if (changeItems.some( el => ["a_abrechenbar"].includes(el))){        
        const result = await updateActivity(
            config, 
            data.activityID, 
            data.a_abrechenbar)
        if (result !== null){
            finalResult = finalResult.concat(result)
        }
    }

    // update activity Meta
    for (let i = 0; i < changeItems.length; i++){
        const metaItem = activityMetaItems.filter(el => el.name === changeItems[i])
        if (metaItem.length === 1){
            const value = metaItem[0].type === 'text' ? getString(data[changeItems[i]]) : data[changeItems[i]]
            const result = await updateActivityMeta(
                config, 
                data.activityID, 
                metaItem[0].dbname, 
                value)
            if (result !== null){
                finalResult = finalResult.concat(result)
            }
        }
    }

    return finalResult
}

async function updateCustomer(config, id, country, currency, timezone, comment) {
    const updatedCustomer = {country, currency, timezone, comment}  
    const response = await kimaiClientPostGeneric("customers/" + id, config, updatedCustomer, "PATCH");    
    return processResponse(response)
}

async function updateProject(config, id, comment, start, end, billable, budget, visible) {
    const updatedProject = {comment, start, end, billable, budget, visible}    
    const response = await kimaiClientPostGeneric("projects/" + id, config, updatedProject, "PATCH");
    return processResponse(response)
}

async function updateProjectMeta(config, id, name, value) {
    const metaItem = {name, value}
    const response = await kimaiClientPostGeneric("projects/" + id + "/meta", config, metaItem, "PATCH");
    return processResponse(response)
}

async function updateActivity(config, id, billable) {
    const metaItem = {billable}
    const response = await kimaiClientPostGeneric("activities/" + id, config, metaItem, "PATCH");
    return processResponse(response)
}

async function updateActivityMeta(config, id, name, value) {
    const metaItem = {name, value}
    const response = await kimaiClientPostGeneric("activities/" + id + "/meta", config, metaItem, "PATCH");
    return processResponse(response)
}

async function createCustomer(config, name, country, currency, timezone, comment) {
    const customer={name, country, currency, timezone, comment, visible:true}
    const response = await kimaiClientPostGeneric("customers", config, customer);
    return response
}

async function createProject(config, name, customer, comment, start, end, billable, budget, visible) {
    const project = {name, customer, comment, start, end, billable, budget, visible}    
    const response = await kimaiClientPostGeneric("projects", config, project);
    return response
}

async function createActivity(config, name, project, billable) {
    const activity = {name, project, billable, visible:true}    
    const response = await kimaiClientPostGeneric("activities", config, activity);
    return response
}

async function createActivityRate(config, id, rate) {
    const activity = {rate, isFixed: false}    
    const response = await kimaiClientPostGeneric("activities/" + id + "/rates", config, activity);
    return response
}