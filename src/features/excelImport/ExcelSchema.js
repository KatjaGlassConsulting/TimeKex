const excelTimeToString = (time) => {
    const basenumber = (time * 24)
    var hour = Math.floor(basenumber).toString();
    if (hour.length < 2) {
        hour = '0' + hour;
    }

    var minute = Math.round((basenumber % 1) * 60).toString();
    if (minute.length < 2) {
        minute = '0' + minute;
    }
    return (hour + ':' + minute);
};

export const schema = {
    'Line number': {
        prop: 'lineNumber',
        type: Number
    },
    'Date': {
        prop: 'date',
        type: (value) => {
            const jsDateFromExcel = new Date(Math.round((value - 25569) * 86400 * 1000))
            return jsDateFromExcel.toISOString().split('T')[0]
        }
    },
    'Client': {
        prop: 'customer',
        type: (value) => {return value.replaceAll("\u00A0", " ")}
    },
    'Project': {
        prop: 'project',
        type: (value) => {return value.replaceAll("\u00A0", " ")}
    },
    'Activity': {
        prop: 'activity',
        type: (value) => {return value.replaceAll("\u00A0", " ")}
    },
    'chargeable': {
        prop: 'chargeable',
        type: (value) => {
            if (value === "ja" || value === "yes") {
                return true;
            }
            else if (value === "nein" || value === "no") {
                return false;
            }
            else if (value === undefined || value === "" || value === null) {
                return null;
            }
            else {
                return undefined;
            }
        }
    },
    'chargeable (correction)': {
        prop: 'chargeableCorrected',
        type: (value) => {
            if (value === "ja") {
                return true;
            }
            else if (value === "nein") {
                return false;
            }
            else if (value === undefined || value === "" || value === null) {
                return null;
            }
            else {
                return undefined;
            }
        }
    },
    'Tasks': {
        prop: 'tasks',
        type: (value) => {return value.replaceAll("\u00A0", " ")}
    },
    'Details': {
        prop: 'details',
        type: (value) => {return value.replaceAll("\u00A0", " ")}
    },
    'Start': {
        prop: 'start',
        type: (value) => {
            return excelTimeToString(value);
        }
    },
    'End': {
        prop: 'end',
        type: (value) => {
            return excelTimeToString(value);
        }
    }
}