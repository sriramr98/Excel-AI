const XlsxPopulate = require('xlsx-populate');

/**
 * Creates a subsheet with the given title
 * @param { title: str } info 
 */
module.exports = async info => {
    return XlsxPopulate.fromFileAsync(info.path)
        .then(sheet => {
            return sheet.addSheet(info.title)
        });
}