import { useSelector, useDispatch } from 'react-redux'
import { Button, Icon } from 'semantic-ui-react'
import { selectedWeek } from '../features/excelImport/excelSlice'
import { loadAll } from '../features/approvalSlice'
import { loadOvertimeWeek } from '../features/overtimeSlice'
import { reset } from '../features/updateTimesheets/updateTimesheetsSlice'
import { useEffect } from 'react'

export const WeekBox = () => {
    const dispatch = useDispatch()
    const excelData = useSelector((state) => state.excelData.data)
    const excelDataStatus = useSelector((state) => state.excelData.status)
    const excelSelectedWeek = useSelector((state) => state.excelData.selectedWeek)
    const approval = useSelector((state) => state.approval)
    const overtime = useSelector((state) => state.overtime)
    const config = useSelector((state) => state.config);

    const isNewWeekBoolArray = excelData
        .map((item) => {
            return item.week?.weekStartDay
        })
        .map((v, i, a) => a.indexOf(v) === i)

    var weeks = []
    isNewWeekBoolArray.forEach((item, index) => {        
        if (item) {
            return weeks.push(excelData[index].week)
        }
    })

    useEffect(() => {
        const currentWeek = weeks[weeks.length - 1]
        if (!excelSelectedWeek && currentWeek !== undefined) {
            dispatch(selectedWeek(currentWeek))
            if (overtime.overtimeStatus[currentWeek.weekEndDay] === undefined){
                dispatch(loadOvertimeWeek({week:currentWeek, config:config}))
            }
        }
        if (weeks.length > 0 && approval.status === 'idle') {
            dispatch(loadAll({weeks:weeks, config:config}))
        }
    })

    if (excelDataStatus !== 'succeeded' || !excelSelectedWeek) {
        return null
    }

    const nextWeek = () => {
        const currentPos = weeks.findIndex(
            (item) => item.weekStartDay === excelSelectedWeek.weekStartDay
        )
        const next =
            currentPos + 1 >= weeks.length ? weeks[0] : weeks[currentPos + 1]
        dispatch(reset())
        dispatch(selectedWeek(next))
        if (overtime.overtimeStatus[next.weekEndDay] === undefined){
            dispatch(loadOvertimeWeek({week:next, config:config}))
        }
    }
    const prevWeek = () => {
        const currentPos = weeks.findIndex(
            (item) => item.weekStartDay === excelSelectedWeek.weekStartDay
        )
        const prev =
            currentPos - 1 < 0 ? weeks[weeks.length - 1] : weeks[currentPos - 1]
        dispatch(reset())
        dispatch(selectedWeek(prev))
        if (overtime.overtimeStatus[prev.weekEndDay] === undefined){
            dispatch(loadOvertimeWeek({week:prev, config:config}))
        }
    }

    const displayWeek =
        weeks[weeks.findIndex((item) => item.weekStartDay === excelSelectedWeek.weekStartDay)]
    const displayWeekString = displayWeek
        ? displayWeek.weekStartDay +
          ' - ' +
          displayWeek.weekEndDay +
          '  (Week ' +
          displayWeek.week.toString() +
          ')'
        : 'loading...'

    return (
        <div>
            <Button.Group>
                <Button icon onClick={prevWeek}>
                    <Icon name="angle left" />
                </Button>
                <Button>
                    <span style={displayWeek.weekStartDay === weeks[weeks.length - 1].weekStartDay ? {"textDecoration":"underline" } : {}}>
                        {displayWeekString}
                    </span>                    
                </Button>
                <Button icon onClick={nextWeek}>
                    <Icon name="angle right" />
                </Button>
            </Button.Group>
        </div>
    )
}

export default WeekBox
