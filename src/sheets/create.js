const xlsx = require('node-xlsx');
const fs = require('fs')

module.exports = async (title, data = [], outputPath) => {
    const buffer = xlsx.build([ { name: title, data } ])
    fs.writeFileSync(outputPath, buffer)
}