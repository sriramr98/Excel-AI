const xlsx = require('node-xlsx')

/**
 * Returns the headers and the number of rows in the sheet
 */
module.exports = (path = '') => {
    const sheets = xlsx.parse(path);
    if (!sheets) {
        throw new Error("Sheet not found")
    }

    const sheetsMeta = sheets.map(sheet => ({
        name: sheet.name,
        headers: sheet.data[0],
        noOfRows: sheet.data.length
    }))

    return sheetsMeta 

}