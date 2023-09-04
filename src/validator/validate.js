module.exports = (schema) => {
    return async (req, res, next) => {
        const {error} = schema.validate(req.body)
        if (!error) {
            // if no error, the request body is valid
            next()
            return
        }

        const { context } = error.details[0]; // only show first validation error
        return res.status(400).json({
            message: `Invalid value ${context.value} for key ${context.key}`
        })
    }
}