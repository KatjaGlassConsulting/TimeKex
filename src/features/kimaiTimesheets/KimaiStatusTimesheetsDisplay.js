import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import StatusButton from '../../components/StatusButton';

import { fetchAllTimesheets } from './kimaiTimesheetsSlice';

export const KimaiStatusTimesheetsDisplay = () => {

    const dispatch = useDispatch()

    const KimaiTimesheetsDisplay = useSelector((state) => state.kimaiTimesheets.status)
    const userId = useSelector((state) => state.kimaiData.userId)
    const config = useSelector((state) => state.config)
    const error = useSelector((state) => state.kimaiTimesheets.error)

    useEffect(() => {
        if (KimaiTimesheetsDisplay === 'idle' && userId) {
            dispatch(fetchAllTimesheets({ ...config, userId: userId }))
        }
    }, [KimaiTimesheetsDisplay, dispatch, config, userId])
    
    return StatusButton("Kimai Timesheets Status", KimaiTimesheetsDisplay, "database", error );
}
