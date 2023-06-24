export const excelString = (value) => {
    return value.replaceAll('\u00A0', ' ').trim().replace(/\s\s+/g, ' ')
}

export const excelBooleanNoYes = (value) => {
    if (value === 'ja' || value === 'yes') {
        return true
    } else if (value === 'nein' || value === 'no') {
        return false
    } else if (value === undefined || value === '' || value === null) {
        return null
    } else {
        return undefined
    }
}

export const excelTimeToStringFromNumber = (time) => {
    const basenumber = time * 24
    var hour = Math.floor(basenumber).toString()
    if (hour.length < 2) {
        hour = '0' + hour
    }

    var minute = Math.round((basenumber % 1) * 60).toString()
    if (minute.length < 2) {
        minute = '0' + minute
    }
    return hour + ':' + minute
}

export const excelDateToString = (value) => {
    if (typeof value.getMonth === 'function'){
        return value.toISOString().split('T')[0];
    }
    const jsDateFromExcel = new Date(Math.round((value - 25569) * 86400 * 1000))
    return jsDateFromExcel.toISOString().split('T')[0]
}

export const excelTimeToString = (value) => {
    if (typeof value.getMonth === 'function'){
        return value.toISOString().split('T')[1].substr(0,5);
    }
    return excelTimeToStringFromNumber(value)
}

export const updateSchema = (baseSchema, configSchema) => {
    if (!configSchema) {
        return baseSchema
    }

    var configResultSchema = {}
    configSchema.forEach((item) => {
        configResultSchema[item.name] = {}
        configResultSchema[item.name].prop = item.name
        if (item.type.localeCompare('text') === 0) {
            configResultSchema[item.name].type = excelString
        } else if (
            item.type.localeCompare('number') === 0 ||
            item.type.localeCompare('integer') === 0
        ) {
            configResultSchema[item.name].type = Number
        } else if (item.type.localeCompare('boolean') === 0) {
            configResultSchema[item.name].type = excelBooleanNoYes
        } else {
            console.log(
                'ERROR: the type of the meta field is not supported, use string, number or boolean.'
            )
            configResultSchema[item.name].type = String
        }
    })

    return { ...baseSchema, ...configResultSchema }
}
