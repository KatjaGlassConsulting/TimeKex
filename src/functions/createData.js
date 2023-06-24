import { kimaiClientPostGeneric } from "../api/kimaiClientPostGeneric";
import { getIdFromKimaiData } from "../features/kimaiDB/kimaiSlice";

const getMeta = (data, config, scope) => {
    var result = [];
    config.meta.forEach(metaItem => {
        if (metaItem.scope?.localeCompare(scope) === 0 && data[metaItem.name]){
            result.push({
                "name": metaItem.dbname,
                "value": data[metaItem.name]
            })
        }
    })
    return result;
}

 
export async function createData(kimaiData, contentData, config, callback) {
    var updatedKimaiData = { ...kimaiData };
    var i;
    var response;
    var messagesResponse = [];

    const addKimaiData = (type, content = null) => {
        var toAdd = {}
        toAdd[content.id] = content;
        updatedKimaiData[type] = { ...updatedKimaiData[type], ...toAdd };
    }

    const addIfNotInArray = (fullArray, itemObject) => {
        var found = false;
        fullArray.forEach(item => {
            if (JSON.stringify(item) === JSON.stringify(itemObject)) {
                found = true;
                return;
            }
        })
        if (!found) {
            fullArray.push(itemObject)
        }
    }

    var data = { customers: [], projects: [], activities: [] }
    // customer list to loop through
    contentData.filter(item => item.customer && item.customer !== "").forEach(customer => {
        var newReturn = {};
        newReturn.name = customer.customer;
        newReturn.country = customer.customer_country;
        newReturn.currency = customer.customer_currency;
        newReturn.timezone = customer.customer_timezone;
        newReturn.comment = customer.customer_comment;
        addIfNotInArray(data.customers, newReturn);
    })
    // project list to loop through
    contentData.filter(item => item.project && item.project !== "").forEach(project => {
        var newReturn = {};
        newReturn.name = project.project;
        newReturn.customer = project.customer;
        if (project.project_start){
            newReturn.start = project.project_start + "T12:00:00";
        }
        if (project.project_end){
            newReturn.end = project.project_end + "T12:00:00";
        }
        if (project.project_comment){
            newReturn.comment = project.project_comment;
        }
        if (project.project_budget){
            newReturn.budget = project.project_budget;
        }
        if (project.project_color){
            newReturn.color = project.project_color;
        }
        if (config.meta){
            var projectMeta = getMeta(project, config, "project");
            if (projectMeta && projectMeta.length > 0){
                newReturn.meta = projectMeta;
            }
        }
        addIfNotInArray(data.projects, newReturn);
    })
    // activity list to loop through
    contentData.filter(item => item.activity && item.activity !== "").forEach(activity => {
        var newReturn = {};
        newReturn.name = activity.activity;
        if (activity.project) {
            newReturn.project = activity.project;
        }
        if (activity.customer) {
            newReturn.customer = activity.customer;
        }
        if (activity.activitiy_budget) {
            newReturn.budget = activity.activitiy_budget;
        }
        if (activity.activitiy_rate) {
            newReturn.rate = activity.activitiy_rate;
        }
        addIfNotInArray(data.activities, newReturn);
    })

    // add customers
    for (i = 0; i < data.customers.length; i++) {
        var customer = data.customers[i];
        if (getIdFromKimaiData(updatedKimaiData,customer.name, null, null)) {
            console.log("Customer is not created as already existing: ", customer.name);
            messagesResponse.push("Customer is not created as already existing: " + customer.name);
        }
        else {
            var thisCustomer = { ...customer, "visible": 1 }
            response = await kimaiClientPostGeneric("customers", config, thisCustomer);
            if (response.id) {
                addKimaiData("customers", { id: response.id, name: response.name })
                console.log("Customer created: ", customer.name);
                messagesResponse.push("Customer created: " + customer.name);
            }
            else {
                var allErrors = [];
                for (var item in response.errors.children) {
                    if (response.errors.children[item].errors) {
                        allErrors.push(item + ": " + response.errors.children[item].errors.join());
                    }
                }
                console.log("ISSUES: ", customer.name, response);
                messagesResponse.push("ISSUES: " + customer.name + " - " + response.message + " - " + allErrors.join(" - "));
            }
        }
    }

    // add projects
    for (i = 0; i < data.projects.length; i++) {
        var project = data.projects[i];
        
        if (getIdFromKimaiData(updatedKimaiData,project.customer, project.name, null)) {
            console.log("Project is not created as already existing: ", project.name);
            messagesResponse.push("Project is not created as already existing: " + project.name);
        }
        else if (!getIdFromKimaiData(updatedKimaiData,project.customer, null, null)) {
            console.log("ISSUE!!! Customer does not exist for project: ", project.name, project.customer);
            messagesResponse.push("ISSUE!!! Customer does not exist for project: " + project.name + " - " + project.customer);
        }
        else {
            var thisProject = { ...project, "customer": getIdFromKimaiData(updatedKimaiData,project.customer, null, null), "visible": 1, "billable": true }
            var thisProjectMeta = null;
            if (thisProject.meta){
                thisProjectMeta = thisProject.meta;
                delete thisProject.meta;
            }
            response = await kimaiClientPostGeneric("projects", config, thisProject);
            if (response.id) {
                addKimaiData("projects", { id: response.id, name: response.name, customer: updatedKimaiData.customers[response.customer] })
                console.log("Project created: ", project.name);
                messagesResponse.push("Project created: " + project.name);
                if (thisProjectMeta){
                    for (let i = 0; i < thisProjectMeta.length; i++){                        
                        var metaEntry = thisProjectMeta[i]
                        console.log(metaEntry);
                        var responseMeta = await kimaiClientPostGeneric("projects/" + response.id + "/meta", config, metaEntry, 'PATCH');
                        if (responseMeta.id) {
                            console.log("Project metadata created: ", metaEntry);
                            messagesResponse.push("Project metadata created: " + metaEntry.name);
                        }
                        else {
                            console.log("ISSUES: (project metadata) ", metaEntry, response);
                            messagesResponse.push("ISSUES: (project metadata) " + metaEntry.name + " - not created");
                        }
                    }
                }
            }
            else {
                console.log("ISSUES: ", project.name, response);
                messagesResponse.push("ISSUES: " + project.name + " - " + response.message);
            }
        }
    }

    // add activities
    for (i = 0; i < data.activities.length; i++) {
        var activity = data.activities[i];
        if (getIdFromKimaiData(updatedKimaiData,activity.customer, activity.project, activity.name)) {
            console.log("Activity is not created as already existing: ", activity.name);
            messagesResponse.push("Activity is not created as already existing: " + activity.name);
        }
        else if (activity.project && !getIdFromKimaiData(updatedKimaiData,activity.customer, activity.project, null)) {
            console.log("ISSUE!!! Project does not exist for activity: ", activity.name, activity.project);
            messagesResponse.push("ISSUE!!! Project does not exist for activity: " + activity.name + " - " + activity.project);
        }
        else {            
            var thisActivity;
            if (activity.project) {
                thisActivity = { ...activity, "project": getIdFromKimaiData(updatedKimaiData,activity.customer, activity.project, null), "visible": 1, "billable": true };
                if (thisActivity.customer){
                    delete thisActivity.customer;
                }
            }
            else {
                thisActivity = { ...activity, "visible": 1 };
            }     
            
            var rate = thisActivity.rate;
            if (thisActivity.rate){
                delete thisActivity.rate;
            }
            
            response = await kimaiClientPostGeneric("activities", config, thisActivity);
            if (response.id) {
                addKimaiData("activities",
                    {
                        id: response.id,
                        name: response.name,
                        project: updatedKimaiData.projects[response.project] ? updatedKimaiData.projects[response.project] : null
                    })
                console.log("Activity created: ", activity.name);
                messagesResponse.push("Activity created: " + activity.name);

                // create a separate API call for rates
                if (rate){
                    var thisRate = {"rate": rate, "isFixed": false}
                    var responseRate = await kimaiClientPostGeneric("activities/" + response.id + "/rates", config, thisRate);
                    if (responseRate.id) {
                        console.log("Activity rate created: ", activity.name);
                        messagesResponse.push("Activity rate created: " + activity.name);
                    }
                    else {
                        console.log("ISSUES: (rate) ", activity.name, response);
                        messagesResponse.push("ISSUES: (rate) " + activity.name + " - " + response.message);
                    }
                }
            }
            else {
                console.log("ISSUES: ", activity.name, response);
                messagesResponse.push("ISSUES: " + activity.name + " - " + response.message);
            }
        }
    }

    if (callback) {
        callback(messagesResponse);
    }
}