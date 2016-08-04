var Joi = require('joi')

module.exports = Joi.object({
    email: Joi.string().email().required(),
    metadata: Joi.any(),
    shipping: Joi.object().keys({
        name: Joi.string().required(),
        address: Joi.object().keys({
            city: Joi.string().required(),
            country: Joi.string().required(),
            line1: Joi.string().required(),
            state: Joi.string().required(),
            postal_code: Joi.string().required(),
        }).required(),
    }),
    sku: Joi.string().required(),
    token: Joi.string().token().required(),
})
