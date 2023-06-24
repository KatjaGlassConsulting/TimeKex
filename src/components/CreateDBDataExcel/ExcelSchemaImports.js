import { excelString, excelDateToString, excelBooleanNoYes} from '../../functions/excelSchemaFunctions'

export const schema = {
    'customer': {
        prop: 'customer',
        type: excelString
    },
    'project': {
        prop: 'project',
        type: excelString
    },
    'activity': {
        prop: 'activity',
        type: excelString
    },
    'customer_country': {
        prop: 'customer_country',
        type: excelString
    },
    'customer_currency': {
        prop: 'customer_currency',
        type: excelString
    },
    'customer_timezone': {
        prop: 'customer_timezone',
        type: excelString
    },
    'customer_comment': {
        prop: 'customer_comment',
        type: excelString
    },
    'project_start': {
        prop: 'project_start',
        type: excelDateToString
    },
    'project_end': {
        prop: 'project_end',
        type: excelDateToString
    },
    'project_comment': {
        prop: 'project_comment',
        type: excelString
    },
    'project_budget': {
        prop: 'project_budget',
        type: Number
    },
    'activitiy_budget' : {
        prop: 'activitiy_budget',
        type: Number
    },
    'activitiy_rate' : {
        prop: 'activitiy_rate',
        type: Number
    },
    'abrechenbar' : {
        prop: 'abrechenbar',
        type: excelBooleanNoYes
    },
    'visible' : {
        prop: 'visible',
        type: excelBooleanNoYes
    }
}