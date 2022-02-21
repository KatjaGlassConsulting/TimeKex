function ISO8601_week_no(aDate) {
    var tdt = new Date(aDate.valueOf(aDate));
    var dayn = (tdt.getDay() + 6) % 7;
    tdt.setDate(tdt.getDate() - dayn + 3);
    var firstThursday = tdt.valueOf();
    tdt.setMonth(0, 1);
    if (tdt.getDay() !== 4) {
        tdt.setMonth(0, 1 + ((4 - tdt.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - tdt) / 604800000);
}

export function uniq(stringArray) {
    var seen = {};
    return stringArray.filter(function (item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}

export function getWeekObject(dateString) {
    const aDate = new Date(dateString.valueOf());
    const week = ISO8601_week_no(aDate);
    var weekStartDay = new Date(aDate.valueOf());
    var weekEndDay = new Date(aDate.valueOf());
    const aDay = aDate.getDay() === 0 ? 7 : aDate.getDay();
    weekStartDay.setDate(weekStartDay.getDate() - aDay + 1);
    weekEndDay.setDate(weekEndDay.getDate() - aDay + 7);

    return {
        week: week,
        weekStartDay: weekStartDay.toISOString().split('T')[0],
        weekEndDay: weekEndDay.toISOString().split('T')[0]
    }
}

function includeMessage(item, message) {
    if (!item.message) {
        item.message = []
        item.message.push(message);
    }
    else if (!item.message.includes(message)) {
        item.message.push(message);
    }
}

function checkExcelTimeOverlayPerDay(oneDayItems) {
    // sort by start date
    const sorted = oneDayItems.sort((a, b) => a.start?.localeCompare(b.start))

    // compare with previous, start at second element
    var maxPrevEndValue = sorted[0].end;
    for (var i = 1; i < sorted.length; i++) {
        if (sorted[i].start?.localeCompare(maxPrevEndValue) < 0) {
            sorted[i].overlayIssue = true;
            sorted[i - 1].overlayIssue = true;
            includeMessage(sorted[i], "Time overlap available!");
            includeMessage(sorted[i - 1], "Time overlap available!");
        }
        if (maxPrevEndValue.localeCompare(sorted[i].end) < 0) {
            maxPrevEndValue = sorted[i].end
        }
    }
}

export function checkExcelTimeOverlays(content) {
    const checkArray = content.filter(item => item.action === "none" || item.action === "add" || item.action === "added");
    const checkDays = uniq(checkArray).map(item => item.date);
    checkDays.forEach(checkDay => {
        checkExcelTimeOverlayPerDay(checkArray.filter(item => item.date === checkDay));
    })
}

function getTimeFromMsec(timeInMsec) {
    var msec = timeInMsec;
    var hh = Math.floor(msec / 1000 / 60 / 60);
    msec -= hh * 1000 * 60 * 60;
    var mm = Math.floor(msec / 1000 / 60);
    return { hours: hh, mins: mm }
}

export function investigateHours(content) {
    const checkArray = content.filter(item => item.action === "none" || item.action === "add" || item.action === "added");
    var sumMsec = 0;
    var sumMsecBillable = 0;
    checkArray.forEach(item => {
        const date1 = new Date(item.date + "T" + item.start);
        const date2 = new Date(item.date + "T" + item.end);
        const msec = date2 - date1;
        sumMsec += msec;
        if (item.billable) {
            sumMsecBillable += msec;
        }
    })
    return { sumTimes: getTimeFromMsec(sumMsec), sumTimesBillable: getTimeFromMsec(sumMsecBillable) };
}
