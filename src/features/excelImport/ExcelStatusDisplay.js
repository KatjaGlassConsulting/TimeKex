import { useSelector } from 'react-redux'
import StatusButton from '../../components/StatusButton'

export const ExcelStatusDisplay = () => {
    const excelDataStatus = useSelector((state) => state.excelData.status)
    const error = useSelector((state) => state.excelData.error)

    return StatusButton("Excel File Status", excelDataStatus, "file excel", error );
}
