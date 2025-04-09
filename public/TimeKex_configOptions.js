var config = {
    "kimaiAPI" : "https://demo-stable.kimai.org/api/",
    "ignoreActivities" : ["Vacation","Public Holiday"],
    "adminUser" : ["anna_admin","susan_super"],
    "approval" : false,
    "overtime" : false,
    "summary15mins" : false,
    "breakChecks" : false,
    "bundleApiUpdates" : true,
    "loginToken" : true,
    "logoMenuSmall" : "fischlogo_02_black_small.png",
    "logoMenuLarge" : "fischlogo_02_black_small.png",
    "logoURL" : "https://www.glacon.eu",
    "colorHeader" : "#B4A4DA",
    "durationCustomers": ['Absences'],
    "ignoreProjects": ['Private'],
    "metaTimeEntry": [
        {
            name: 'details',
            excelLabel: 'Details',
            type: 'text'
        }
    ],
    "meta": [
        {
            name: 'position',
            dbname: 'position_activity',
            type: 'text',
            scope: 'activity',
        }
    ]
}