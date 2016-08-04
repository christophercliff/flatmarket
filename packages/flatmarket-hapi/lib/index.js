var _ = require('lodash')
var Boom = require('boom')
var BPromise = require('bluebird')
var flatmarketSchema = require('flatmarket-schema')
var flatmarketValidation = require('flatmarket-validation')
var Joi = require('joi')
var pkg = require('../package.json')
var request = require('./request')
var createStripeClient = require('stripe')
var util = require('util')

var DEFAULT_CORS_ORIGINS = ['*']
var MISSING_SCHEMA_ERROR = 'Unable to load schema from "%s".'
var INVALID_SCHEMA_ERROR = 'Invalid schema at "%s".'
var PATH = '/'

var optionsSchema = Joi.object().keys({
    corsOrigins: Joi.array().min(1).items(Joi.string()).default(DEFAULT_CORS_ORIGINS),
    schemaUri: Joi.string().uri({ scheme: /^https/ }).required(),
    stripeSecretKey: Joi.string().token().required(),
})

exports.register = register
exports.optionsSchema = optionsSchema

register.attributes = {
    pkg: pkg,
}

function register(server, options, next) {
    var validation = Joi.validate(options, optionsSchema)
    if (validation.error) return next(validation.error)
    options = validation.value
    var stripe = createStripeClient(options.stripeSecretKey)
    server.route({
        config: {
            cors: {
                origin: options.corsOrigins,
            },
            id: 'flatmarket-charge',
            validate: {
                payload: flatmarketValidation.createCharge,
            },
        },
        method: 'POST',
        path: PATH,
        handler: function (req, reply) {
            return request.get(options.schemaUri, { rejectUnauthorized: false })
                .spread(function (res, schemaPayload) {
                    if (res.statusCode !== 200) throw Boom.serverTimeout(util.format(MISSING_SCHEMA_ERROR, options.schemaUri))
                    if (!flatmarketSchema.isValid(schemaPayload)) throw Boom.serverTimeout(util.format(INVALID_SCHEMA_ERROR, options.schemaUri))
                    if (!isValidRequest(schemaPayload, req.payload)) throw Boom.badRequest()
                    var schema = Joi.validate(schemaPayload, flatmarketSchema).value
                    var sku = schema.products[req.payload.sku]
                    var stripePayload = {
                        metadata: _.chain(req.payload.metadata)
                            .omit([
                                'email',
                                'sku',
                            ])
                            .extend(_.pick(req.payload, [
                                'email',
                                'sku',
                            ]))
                            .value(),
                        source: req.payload.token,
                    }
                    var needsShippingAddress = _.get(schema, [
                        'products',
                        req.payload.sku,
                        'shippingAddress',
                    ]) || _.get(schema, [
                        'stripe',
                        'shippingAddress',
                    ])
                    var shippingAddress = _.get(req.payload, 'shipping')
                    if (needsShippingAddress && !shippingAddress) throw Boom.badRequest('Requires shipping address.')
                    if (!needsShippingAddress && shippingAddress) throw Boom.badRequest('Invalid shipping address.')
                    if (shippingAddress) {
                        _.extend(stripePayload, {
                            shipping: shippingAddress,
                        })
                    }
                    var stripeResource
                    if (_.has(sku, 'plan')) {
                        stripePayload = _.chain(sku)
                            .pick('plan')
                            .extend(stripePayload)
                            .extend({
                                email: req.payload.email,
                            })
                            .value()
                        stripeResource = stripe.customers
                    } else {
                        stripePayload = _.chain(sku)
                            .pick('amount', 'currency')
                            .extend(stripePayload)
                            .defaults({
                                currency: schema.stripe.currency,
                            })
                            .value()
                        stripeResource = stripe.charges
                    }
                    return new BPromise(function (resolve, reject) {
                        stripeResource.create(stripePayload, function (err) {
                            if (err) return reject(Boom.badGateway(err.message))
                            return resolve()
                        })
                    })
                })
                .then(function () {
                    return reply({
                        code: 'ok',
                    })
                }, function (err) {
                    if (err.isBoom) return reply(err)
                    return reply(Boom.badImplementation())
                })
        },
    })
    server.route({
        config: {
            cors: {
                origin: options.corsOrigins,
            },
            id: 'flatmarket-status',
        },
        method: 'GET',
        path: PATH,
        handler: function (req, reply) {
            return request.get(options.schemaUri, { rejectUnauthorized: false })
                .spread(function (res, payload) {
                    if (res.statusCode !== 200) {
                        return {
                            code: 'missing_schema',
                            message: util.format(MISSING_SCHEMA_ERROR, options.schemaUri),
                        }
                    }
                    if (!flatmarketSchema.isValid(payload)) {
                        return {
                            code: 'invalid_schema',
                            message: util.format(INVALID_SCHEMA_ERROR, options.schemaUri),
                        }
                    }
                    return new BPromise(function (resolve) {
                        stripe.accounts.retrieve(function (err) {
                            if (err) {
                                return resolve({
                                    code: 'invalid_stripe_configuration',
                                    message: err.message,
                                })
                            }
                            return resolve({
                                code: 'ok',
                            })
                        })
                    })
                })
                .then(function (res) {
                    return reply(res)
                }, function () {
                    return reply(Boom.badImplementation())
                })
        },
    })
    return next()
}

function isValidRequest(obj, payload) {
    return _.has(obj, 'products') && _.has(obj.products, payload.sku)
}
