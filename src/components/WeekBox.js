import { useSelector, useDispatch } from 'react-redux'
import { Button, Icon } from "semantic-ui-react";
import { connect } from "react-redux";
import { selectedWeek } from "../features/excelImport/excelSlice";
import { reset } from '../features/updateTimesheets/updateTimesheetsSlice';
import { useEffect } from 'react';


export const WeekBox = () => {
    const dispatch = useDispatch();
    const excelData = useSelector((state) => state.excelData.data);
    const excelDataStatus = useSelector((state) => state.excelData.status);
    const excelSelectedWeek = useSelector((state) => state.excelData.selectedWeek);
    const isNewWeekBoolArray = excelData.map(item => { return item.week?.week }).map((v, i, a) => a.indexOf(v) === i);

    var weeks = [];
    isNewWeekBoolArray.forEach((item, index) => {
        if (item){
            return weeks.push(excelData[index].week);
        }
    });

    useEffect(() => {
        if (!excelSelectedWeek) {
            dispatch(selectedWeek(weeks[weeks.length - 1]?.week));
        }
    })

    if (excelDataStatus !== 'succeeded' || !excelSelectedWeek) {
        return null;
    }
    
    const nextWeek = () => {
        const currentPos = weeks.findIndex(item => item.week === excelSelectedWeek);
        const next = (currentPos + 1) >= weeks.length ? weeks[0] : weeks[currentPos + 1];
        dispatch(reset());
        dispatch(selectedWeek(next.week));
    }
    const prevWeek = () => {
        const currentPos = weeks.findIndex(item => item.week === excelSelectedWeek);
        const prev = (currentPos - 1) < 0 ? weeks[weeks.length - 1] : weeks[currentPos - 1];
        dispatch(reset());
        dispatch(selectedWeek(prev.week));
    }

    const displayWeek = weeks[weeks.findIndex(item => item.week === excelSelectedWeek)];
    const displayWeekString = displayWeek ? displayWeek.weekStartDay + "   " + displayWeek.weekEndDay + "  (" + displayWeek.week.toString() + ")" : "loading...";
    
    return (
        <div>
            <Button.Group>
                <Button icon onClick={prevWeek}>
                    <Icon name='angle left' />
                </Button>
                <Button>
                    {displayWeekString}
                </Button>
                <Button icon onClick={nextWeek}>
                    <Icon name='angle right' />
                </Button>
            </Button.Group>
        </div>
    );
}

export default connect()(WeekBox);