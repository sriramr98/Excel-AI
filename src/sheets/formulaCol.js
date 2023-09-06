const XlsxPopulate = require("xlsx-populate");

// Structure of Info - {"action": "formula_col", "formula": "D{row}/SUM(D2:D11)", "column": "E", "sheet": 0  }
module.exports = async (info, sheetMeta) => {
    console.log({ info, sheetMeta })
    const totalRows = sheetMeta[info.sheet].noOfRows;

    XlsxPopulate.fromFileAsync(info.path)
        .then(worksheet => {

            // write header
            const sheet = worksheet.sheet(info.sheet);
            sheet.cell(info.headerCell).value(info.header)

            const formulaRange = `${info.column}2:${info.column}${totalRows}`;
            console.log({ formulaRange })
            sheet.range(formulaRange).forEach((cell, ci, ri, range) => {
                // we add +2 since our formula starts from 2nd row, but the loop indexes always start from 0 irrespective of the range
                const formulaToApply = info.formula.replace("{row}", ci+2)
                console.log({ cell, ri, ci, formulaToApply })
                cell.formula(formulaToApply)
            })
            return worksheet.toFileAsync(info.path);
        })
        .catch(ex => {
            console.error(ex)
        })
}