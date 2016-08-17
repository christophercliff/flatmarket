var Joi = require('joi')

var PREFIX_RE = /^x-/

var stripeBase = Joi.object().keys({
    allowRememberMe: Joi.boolean(),
    billingAddress: Joi.boolean(),
    bitcoin: Joi.boolean(),
    capture: Joi.boolean(),
    currency: Joi.string(),
    image: Joi.string(),
    panelLabel: Joi.string(),
    receiptEmail: Joi.boolean(),
    shippingAddress: Joi.any().when('billingAddress', {
        is: true,
        then: Joi.boolean(),
        otherwise: Joi.any().forbidden(),
    }),
    zipCode: Joi.boolean(),
})
var product = stripeBase.keys({
    amount: Joi.number().integer().positive().required(),
    description: Joi.string(),
    images: Joi.array().items(Joi.string()),
    metadata: Joi.object(),
    name: Joi.string(),
    plan: Joi.string(),
}).pattern(PREFIX_RE, Joi.any()).required()
var flatmarket = Joi.object().keys({
    info: Joi.object().keys({
        name: Joi.string().required(),
        description: Joi.string(),
    }).pattern(PREFIX_RE, Joi.any()).required(),
    products: Joi.object().pattern(/.*/, product).required(),
    server: Joi.object().keys({
        host: Joi.string().required(),
        pathname: Joi.string(),
    }).required(),
    stripe: stripeBase.keys({
        currency: Joi.string().default('usd'),
        name: Joi.string(),
        publishableKey: Joi.string().token().required(),
    }).required(),
}).required()

module.exports = flatmarket

flatmarket.isValid = isValid

function isValid(obj) {
    return !flatmarket.validate(obj).error
}
