var Joi = require('joi')

var product = Joi.object().keys({
    amount: Joi.number().integer().positive().required(),
    description: Joi.string(),
    metadata: Joi.object(),
    name: Joi.string(),
    plan: Joi.string(),
}).pattern(/^x-/, Joi.any()).required()
var validator = Joi.object().keys({
    products: Joi.object().pattern(/.*/, product).required(),
    server: Joi.object().keys({
        host: Joi.string().required(),
        pathname: Joi.string(),
    }).required(),
    stripe: Joi.object().keys({
        allowRememberMe: Joi.boolean(),
        billingAddress: Joi.boolean(),
        bitcoin: Joi.boolean(),
        currency: Joi.string().default('usd'),
        image: Joi.string(),
        name: Joi.string(),
        panelLabel: Joi.string(),
        publishableKey: Joi.string().token().required(),
        zipCode: Joi.boolean(),
    }).required(),
}).required()

module.exports = validator

validator.isValid = isValid

function isValid(obj) {
    return !validator.validate(obj).error
}
