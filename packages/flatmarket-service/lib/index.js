var _ = require('lodash')
var Bluebird = require('bluebird')
var Boom = require('boom')
var createStripeClient = require('stripe')
var flatmarketSchema = require('flatmarket-schema')
var Joi = require('joi')
var Wreck = require('wreck')

var MISSING_SCHEMA_ERROR = 'Unable to load schema.'
var INVALID_SCHEMA_ERROR = 'Invalid schema.'

module.exports = function (stripeSecretKey, schemaUri) {
    var stripe = createStripeClient(stripeSecretKey)
    return function (payload) {
        return get(schemaUri, { rejectUnauthorized: false })
            .spread(function (res, schemaPayload) {
                if (res.statusCode !== 200) return Bluebird.reject(Boom.serverTimeout(MISSING_SCHEMA_ERROR))
                if (!flatmarketSchema.isValid(schemaPayload)) return Bluebird.reject(Boom.serverTimeout(INVALID_SCHEMA_ERROR))
                if (!isValidRequest(schemaPayload, payload)) return Bluebird.reject(Boom.badRequest())
                var schema = Joi.validate(schemaPayload, flatmarketSchema).value
                var sku = schema.products[payload.sku]
                var stripePayload = {
                    metadata: _.chain(payload.metadata)
                        .omit([
                            'email',
                            'sku',
                        ])
                        .extend(_.pick(payload, [
                            'email',
                            'sku',
                        ]))
                        .value(),
                    source: payload.token,
                }
                var needsShippingAddress = _.get(schema, [
                    'products',
                    payload.sku,
                    'shippingAddress',
                ]) || _.get(schema, [
                    'stripe',
                    'shippingAddress',
                ])
                var shippingAddress = _.get(payload, 'shipping')
                if (needsShippingAddress && !shippingAddress) return Bluebird.reject(Boom.badRequest('Requires shipping address.'))
                if (!needsShippingAddress && shippingAddress) return Bluebird.reject(Boom.badRequest('Invalid shipping address.'))
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
                            email: payload.email,
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
                return new Bluebird(function (resolve, reject) {
                    stripeResource.create(stripePayload, function (err) {
                        if (err) return reject(Boom.badGateway(err.message))
                        return resolve()
                    })
                })
            })
            .then(function () {
                return { code: 'ok' }
            })
    }
}

function get(uri, options) {
    options = _.extend({ json: true }, options)
    return new Bluebird(function (resolve, reject) {
        Wreck.get(uri, options, function (err, res, payload) {
            if (err) return reject(Boom.serverTimeout(MISSING_SCHEMA_ERROR))
            return resolve([
                res,
                payload,
            ])
        })
    })
}

function isValidRequest(obj, payload) {
    return _.has(obj, 'products') && _.has(obj.products, payload.sku)
}
