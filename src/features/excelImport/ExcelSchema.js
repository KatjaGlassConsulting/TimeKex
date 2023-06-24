import { excelBooleanNoYes, excelString, excelDateToString, excelTimeToString } from '../../functions/excelSchemaFunctions'

export const schema = {
    'Line number': {
        prop: 'lineNumber',
        type: Number
    },
    'Date': {
        prop: 'date',
        type: excelDateToString
    },
    'Client': {
        prop: 'customer',
        type: excelString
    },
    'Project': {
        prop: 'project',
        type: excelString
    },
    'Activity': {
        prop: 'activity',
        type: excelString
    },
    'chargeable': {
        prop: 'chargeable',
        type: excelBooleanNoYes
    },
    'chargeable (correction)': {
        prop: 'chargeableCorrected',
        type: excelBooleanNoYes
    },
    'Start': {
        prop: 'start',
        type: excelTimeToString
    },
    'End': {
        prop: 'end',
        type: excelTimeToString
    },
    'Duration': {
        prop: 'duration',
        type: excelTimeToString
    },
    'Tasks': {
        prop: 'tasks',
        type: excelString
    },
    'Details': {
        prop: 'details',
        type: excelString
    },
    'Description': {
        prop: 'description',
        type: excelString
    },    
}
