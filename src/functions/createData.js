import { kimaiClientPostGeneric } from "../api/kimaiClientPostGeneric";
import { getIdFromKimaiData } from "../features/kimaiDB/kimaiSlice";

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
    contentData.filter(item => item.customer && item.customer !== "").forEach(customer => {
        var newReturn = {};
        newReturn.name = customer.customer;
        newReturn.country = customer.customer_country;
        newReturn.currency = customer.customer_currency;
        newReturn.timezone = customer.customer_timezone;
        newReturn.comment = customer.customer_comment;
        addIfNotInArray(data.customers, newReturn);
    })
    contentData.filter(item => item.project && item.project !== "").forEach(project => {
        var newReturn = {};
        newReturn.name = project.project;
        newReturn.customer = project.customer;
        addIfNotInArray(data.projects, newReturn);
    })
    contentData.filter(item => item.activity && item.activity !== "").forEach(activity => {
        var newReturn = {};
        newReturn.name = activity.activity;
        if (activity.project) {
            newReturn.project = activity.project;
        }
        if (activity.customer) {
            newReturn.customer = activity.customer;
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
            var thisProject = { ...project, "customer": getIdFromKimaiData(updatedKimaiData,project.customer, null, null), "visible": 1 }
            response = await kimaiClientPostGeneric("projects", config, thisProject);
            if (response.id) {
                addKimaiData("projects", { id: response.id, name: response.name, customer: updatedKimaiData.customers[response.customer] })
                console.log("Project created: ", project.name);
                messagesResponse.push("Project created: " + project.name);
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
                thisActivity = { name: activity.name, "project": getIdFromKimaiData(updatedKimaiData,activity.customer, activity.project, null), "visible": 1 };
            }
            else {
                thisActivity = { ...activity, "visible": 1 };
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