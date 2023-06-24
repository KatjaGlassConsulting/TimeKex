import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import StatusButton from '../../components/StatusButton';

import { fetchRawData } from './kimaiRawSlice';

export const KimaiRawStatusDisplay = () => {
    const dispatch = useDispatch()

    const kimaiRawDataStatus = useSelector((state) => state.kimaiRawData.status)
    const config = useSelector((state) => state.config)
    const error = useSelector((state) => state.kimaiRawData.error)

    useEffect(() => {
        if (kimaiRawDataStatus === 'idle') {
            dispatch(fetchRawData({config}))
        }
    }, [kimaiRawDataStatus, dispatch, config])

    return StatusButton("Kimai Raw Data Status", kimaiRawDataStatus, "database", error );
}
