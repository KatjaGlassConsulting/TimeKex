export async function kimaiClientPostTimesheet(timesheet, config) {
    var req = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
        req.open("POST", config.kimaiAPI + 'timesheets', true);
        req.responseType = "json";
        req.setRequestHeader('Content-Type', 'application/json');
        req.setRequestHeader('X-AUTH-USER', config.username);
        req.setRequestHeader('Authorization', 'Bearer ' + config.password);
        req.setRequestHeader('Cache-Control', 'no-cache, no-store, max-age=0');
        
        req.onload = () => resolve(req.response);
        req.onerror = () => reject(req);

        var myData = {};
        myData.begin = timesheet.date + " " + timesheet.start;
        myData.end = timesheet.date + " " + timesheet.end;
        myData.project = timesheet.projectId;
        myData.activity = timesheet.activityId;
        myData.description = timesheet.description;
        myData.billable = timesheet.billable;

        req.send(JSON.stringify(myData));
    });
};
