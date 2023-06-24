function ISO8601_week_no(aDate) {
    var tdt = new Date(aDate.valueOf(aDate))
    var dayn = (tdt.getDay() + 6) % 7
    tdt.setDate(tdt.getDate() - dayn + 3)
    var firstThursday = tdt.valueOf()
    tdt.setMonth(0, 1)
    if (tdt.getDay() !== 4) {
        tdt.setMonth(0, 1 + ((4 - tdt.getDay() + 7) % 7))
    }
    return 1 + Math.ceil((firstThursday - tdt) / 604800000)
}

export function includesCaseInsensitive (arrayItem, text) {
    const index = arrayItem.findIndex(element => {
        return element?.toLowerCase() === text?.toLowerCase()
    });
    return index >= 0;
}

export function uniq(stringArray) {
    var seen = {}
    return stringArray.filter(function (item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true)
    })
}

export function getWeekObject(dateString) {
    const aDate = dateString.length === 10 ? new Date(dateString + "T00:00:00") : new Date(dateString.valueOf())
    const week = ISO8601_week_no(aDate)
    var weekStartDay = new Date(aDate.valueOf())
    var weekEndDay = new Date(aDate.valueOf())
    const aDay = aDate.getDay() === 0 ? 7 : aDate.getDay()
    weekStartDay.setDate(weekStartDay.getDate() - aDay + 1)
    weekEndDay.setDate(weekEndDay.getDate() - aDay + 7)

    return {
        week: week,
        weekStartDay: getDateString(weekStartDay),
        weekEndDay: getDateString(weekEndDay),
    }
}

export function getDateString(date){
    // toISOString might cause time-zone-issues, use getTimezoneOffset
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0]
}

function includeMessage(item, message) {
    if (!item.message) {
        item.message = []
        item.message.push(message)
    } else if (!item.message.includes(message)) {
        item.message.push(message)
    }
}

function checkExcelTimeOverlayPerDay(oneDayItems) {
    // sort by start date
    const sorted = oneDayItems.sort((a, b) => a.start?.localeCompare(b.start))
    // compare with previous, start at second element
    var maxPrevEndValue = sorted[0].end
    for (var i = 1; i < sorted.length; i++) {
        if (sorted[i].start?.localeCompare(maxPrevEndValue) < 0) {
            sorted[i].overlayIssue = true
            sorted[i - 1].overlayIssue = true
            includeMessage(sorted[i], 'Time overlap available!')
            includeMessage(sorted[i - 1], 'Time overlap available!')
        }
        if (maxPrevEndValue.localeCompare(sorted[i].end) < 0) {
            maxPrevEndValue = sorted[i].end
        }
    }
}

export function checkExcelTimeOverlays(content) {
    const checkArray = content.filter(
        (item) =>
            item.action === 'none' ||
            item.action === 'add' ||
            item.action === 'added'
    )
    const checkDays = uniq(checkArray.map((item) => item.date))
    checkDays.forEach((checkDay) => {
        checkExcelTimeOverlayPerDay(
            checkArray.filter((item) => item.date === checkDay)
        )
    })
}

function getTimeFromMsec(timeInMsec) {
    var msec = timeInMsec
    var hh = Math.floor(msec / 1000 / 60 / 60)
    msec -= hh * 1000 * 60 * 60
    var mm = Math.floor(msec / 1000 / 60)
    return { hours: hh, mins: mm }
}

export function getTimeFromMsecFormatted(timeInMsec) {
    var msec = timeInMsec
    var hh = Math.floor(msec / 1000 / 60 / 60)
    msec -= hh * 1000 * 60 * 60
    var mm = Math.floor(msec / 1000 / 60)

    let returnString = hh > 0 ? hh.toString() + ":" : "0:";
    returnString += mm > 9 ? mm.toString() : "0" + mm.toString();
    return returnString;
}

export function getDurationFormatted(duration) {
    const formattedString = getTimeFromMsecFormatted(Math.abs(duration*1000));
    return duration >= 0 ? formattedString : "-" + formattedString;
}

export function investigateHours(content) {
    const checkArray = content.filter(
        (item) =>
            item.action === 'none' ||
            item.action === 'add' ||
            item.action === 'added'
    )
    var sumMsec = 0
    var sumMsecBillable = 0
    checkArray.forEach((item) => {
        const msec = getTimeDiff(item.date, item.start, item.end)
        sumMsec += msec
        if (item.billable) {
            sumMsecBillable += msec
        }
    })
    return {
        sumTimes: getTimeFromMsec(sumMsec),
        sumTimesBillable: getTimeFromMsec(sumMsecBillable),
    }
}

function getTimeFromDay(content) {
    var sumMsec = 0
    content.forEach((item) => {
        sumMsec += getTimeDiff(item.date, item.start, item.end)
    })
    return sumMsec
}

export function getTimeDiff(date, start, end) {
    const date1 = new Date(date + 'T' + start)
    const date2 = new Date(date + 'T' + end)
    return date2 - date1
}

function getSixHourIssue(content) {
    const date = content[0].date
    let block = { start: content[0].start, end: content[0].end }
    for (let i = 1; i < content.length; i++) {
        // if the working-block continues
        if (content[i].start === block.end) {
            block.end = content[i].end
        } else {
            // break is available - check if previous block is > 6h
            if (
                getTimeDiff(date, block.start, block.end) / 1000 / 60 / 60 >
                6
            ) {
                return true
            } else {
                block.start = content[i].start
                block.end = content[i].end
            }
        }
    }

    if (getTimeDiff(date, block.start, block.end) / 1000 / 60 / 60 > 6) {
        return true
    } else {
        return false
    }
}

function getBreakIssues(workTime, workArea) {
    const workTimeHours = workTime / 1000 / 60 / 60
    const workAreaHours = workArea / 1000 / 60 / 60
    if (workTimeHours <= 6) {
        return false
    } else if (workTimeHours <= 9 && workAreaHours - workTimeHours >= 0.5) {
        return false
    } else if (workAreaHours - workTimeHours >= 0.75) {
        return false
    } else {
        return true
    }
}

function investigateBreaksForDay(dayArray) {
    let myReturn = {}
    myReturn.date = dayArray[0].date
    myReturn.start = dayArray.map((item) => item.start).sort()[0]
    myReturn.end = dayArray.map((item) => item.end).reverse()[0]
    myReturn.workTimeMSec = getTimeFromDay(dayArray)
    myReturn.workAreaMSec = getTimeFromDay([
        { date: dayArray[0].date, start: myReturn.start, end: myReturn.end },
    ])
    myReturn.workTime = getTimeFromMsec(myReturn.workTimeMSec)
    myReturn.workArea = getTimeFromMsec(myReturn.workAreaMSec)
    myReturn.overlapIssue = dayArray
        .map((item) => item.overlayIssue)
        .includes(true)
    myReturn.sixHourIssue = getSixHourIssue(dayArray)
    myReturn.breakIssue = getBreakIssues(
        myReturn.workTimeMSec,
        myReturn.workAreaMSec
    )
    const startDate = new Date(dayArray[0].date)
    myReturn.workSunday = startDate.getDay() === 0 ? true : false

    myReturn.tenHourIssue = myReturn.workTimeMSec / 1000 / 60 / 60 > 10
    return myReturn
}

export function investigateBreaks(content, durationCustomers) {    
    const checkArray = content.filter(
        (item) => ((item.action === 'none' ||
                item.action === 'add' ||
                item.action === 'added') &&
                !(includesCaseInsensitive(durationCustomers, item.customer)))
    )
    const checkDays = uniq(checkArray.map((item) => item.date))
    const duringDayBreak = checkDays.map((checkDay) => {
        return investigateBreaksForDay(
            checkArray.filter((item) => item.date === checkDay)
        )
    })

    // get Kimai ignoreActivities (Vacation/Holiday)
    const offDaysArray = uniq(content.filter(
      (item) => ((item.action === 'ignore' && item.timesheetId !== null))
    ).map((item) => item.date))
    for (let i = 0; i < duringDayBreak.length; i++) {
        duringDayBreak[i].workOffday = offDaysArray.includes(duringDayBreak[i].date)
    }

    // if nothing to check, return null
    if (duringDayBreak.length === 0){
        return null;
    }

    // check for 11 resting hours between the days
    duringDayBreak[0].restHoursIssue = false
    for (let i = 1; i < duringDayBreak.length; i++) {
        const date1 = new Date(
            duringDayBreak[i - 1].date + 'T' + duringDayBreak[i - 1].end
        )
        const date2 = new Date(
            duringDayBreak[i].date + 'T' + duringDayBreak[i].start
        )
        if ((date2 - date1) / 1000 / 60 / 60 < 11) {
            duringDayBreak[i].restHoursIssue = true
        } else {
            duringDayBreak[i].restHoursIssue = false
        }
    }

    for (let i = 0; i < duringDayBreak.length; i++) {
        const item = duringDayBreak[i]
        item.anyIssue = (item.breakIssue +
                    item.overlapIssue +
                    item.restHoursIssue +
                    item.sixHourIssue +
                    item.tenHourIssue + 
                    item.workSunday + 
                    item.workOffday ) > 0 ? true : false
    }

    return duringDayBreak
}

export function investigateSummary(content){
    // const checkArray = content.filter(
    //     (item) =>
    //         item.action === 'none' ||
    //         item.action === 'add' ||
    //         item.action === 'added'
    // )
    const checkArray = content.filter(
        (item) =>
            item.action !== 'delete' &&
            item.action !== 'deleted' 
    )
    let result = {}
    checkArray.forEach(item => {
        const text = item.customer + " - " + item.project + " - " + item.activity
        // create hierarchy if not available
        if (!result[text]){
            result[text] = {};
            result[text].action = item.action;
        }
        if (!result[text][item.description]){
            result[text][item.description] = {};            
        }
        if (!result[text][item.description][item.date]){
            result[text][item.description][item.date] = [];
        }
        // include value, if "ignore, include 0"
        if (item.action === 'ignore'){
            result[text][item.description][item.date].push(0)
        } else {
            result[text][item.description][item.date].push(getTimeDiff(item.date, item.start, item.end))
        }

        
    })
    return result
}

export function investigateMinIssue(content){
    for (const activityLong in content){
        for (const description in content[activityLong]){            
            if (description !== 'action'){
                const dateItem = content[activityLong][description]                        
                const sumInMsec = Object.keys(dateItem).map(item => dateItem[item].reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0)
                if ((sumInMsec / 1000 / 60) % 15 !== 0){
                    return true
                }
            }
        }
    }
    return false
}