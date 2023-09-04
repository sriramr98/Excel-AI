const Joi = require("joi");

module.exports = {
    createValidator: Joi.object({
        topic: Joi.string().required().min(5),
        rowCount: Joi.number().required().min(1),
        colCount: Joi.number().required().min(1),
        outputPath: Joi.string().required()
    })
}