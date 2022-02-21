import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import StatusButton from '../../components/StatusButton';

import { fetchAllData } from './kimaiSlice';

export const KimaiStatusDisplay = () => {

    const dispatch = useDispatch()
    //const kimaiData = useSelector((state) => state.kimaiData);

    const kimaiDataStatus = useSelector((state) => state.kimaiData.status)
    const config = useSelector((state) => state.config)
    const error = useSelector((state) => state.kimaiData.error)

    useEffect(() => {
        if (kimaiDataStatus === 'idle') {
            dispatch(fetchAllData(config))
        }
    }, [kimaiDataStatus, dispatch, config])

    return StatusButton("Kimai General Data Status", kimaiDataStatus, "database", error );
}
