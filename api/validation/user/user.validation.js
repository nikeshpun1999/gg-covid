const response_codes = require('../../../language/responsecodes')
const fs = require('fs');
const { register, login } = require('./user.schema');

module.exports = {
    RegisterUserValidation: async (req, res, next) => {

        const value = await register.validate(req.body)
        if (value.error) {

            res.json({
                code: response_codes.VALIDATION_FAILED,
                message: value.error.details[0].message
            });
        }
        else {
            next();
        }
    },
    UserLoginValidation: async (req, res, next) => {

        const value = await login.validate(req.body)
        if (value.error) {

            res.json({
                message: value.error.details[0].message,
                code: response_codes.VALIDATION_FAILED
            });
        }
        else {
            next();
        }
    },

}