const XlsxPopulate = require('xlsx-populate');

module.exports = async info => {
    return XlsxPopulate.fromFileAsync(info.path)
        .then(workbook => {
            // write header
            const sheet = workbook.sheet(info.sheet);
            sheet.cell(info.headerCell).value(info.header)

            sheet.cell(info.cell).formula(info.formula)
            return workbook.toFileAsync(info.path);
        })
        .catch(err => {
            console.error(err)
        })
}