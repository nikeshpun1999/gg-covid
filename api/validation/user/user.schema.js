const joi = require('joi');

const Schema = {
    register: joi.object({
        email: joi.string().max(100).required(),
        password: joi.string().max(100).required(),
        name: joi.string().max(100).required(),
        phone: joi.number().min(1000000000).max(9999999999).required()
    }),
    login: joi.object({
        email: joi.string().max(100).required(),
        password: joi.string().max(100).required()
    }),
}

module.exports = Schema;