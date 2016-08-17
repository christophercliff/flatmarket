var Boom = require('boom')
var createHandler = require('flatmarket-service')
var Joi = require('joi')

var optionsSchema = Joi.object().keys({
    schemaUri: Joi.string().uri({ scheme: /^https/ }).required(),
    stripeSecretKey: Joi.string().token().required(),
}).required()

exports.handler = handler

function handler(e, ctx, next) {
    Promise.resolve()
        .then(function () {
            var validation = Joi.validate(e.env, optionsSchema)
            if (validation.error) throw Boom.badRequest(validation.error.message)
            var options = validation.value
            return createHandler(options.stripeSecretKey, options.schemaUri)(e.body)
        })
        .then(function (res) {
            next(undefined, res)
        })
        .catch(function (err) {
            return next(JSON.stringify(((err.isBoom) ? err : Boom.badImplementation()).output.payload))
        })
}
