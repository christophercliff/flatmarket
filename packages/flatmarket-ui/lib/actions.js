var _ = require('lodash')
var Bluebird = require('bluebird')
var constants = require('./constants')
var Flatmarket = require('flatmarket-client')
var stripeCheckout = require('./stripe-checkout')

var TYPES = constants.types
var STRIPE_CHECKOUT_FIELDS = [
    'allowRememberMe',
    'billingAddress',
    'bitcoin',
    'capture',
    'currency',
    'image',
    'name',
    'panelLabel',
    'shippingAddress',
    'zipCode',
]
var PRODUCT_CHECKOUT_FIELDS = STRIPE_CHECKOUT_FIELDS.concat([
    'amount',
    'description',
])
var ERRORS = require('./constants').errors

exports.checkout = checkout
exports.reset = reset

function checkout(sku) {
    return function (dispatch, getState) {
        return Bluebird.resolve()
            .then(function () {
                return new Bluebird(function (resolve, reject) {
                    var stripePublishableKey = getState().getIn(['schema', 'stripe', 'publishableKey'])
                    var skuOptions = getState().getIn(['schema', 'products', sku])
                    if (!skuOptions) {
                        return dispatch({
                            type: TYPES.checkoutFailure.id,
                            payload: ERRORS.invalidSku.id,
                        })
                    }
                    var options = getState()
                        .getIn(['schema', 'stripe'])
                        .filter(function (val, key) {
                            return _.contains(STRIPE_CHECKOUT_FIELDS, key)
                        })
                        .merge(skuOptions.filter(function (val, key) {
                            return _.contains(PRODUCT_CHECKOUT_FIELDS, key)
                        }))
                    stripeCheckout.configure({ key: stripePublishableKey }).open(_.extend(options.toJS(), {
                        closed: function () {
                            return reject(new Bluebird.OperationalError(ERRORS.cancelled.id))
                        },
                        token: function () {
                            return resolve(_.toArray(arguments))
                        },
                    }))
                    dispatch({
                        type: TYPES.checkoutBegin.id,
                        payload: sku,
                    })
                })
            })
            .spread(function (token, addresses) {
                dispatch({
                    type: TYPES.checkoutCharge.id,
                    payload: {
                        addresses: addresses,
                        token: token,
                    },
                })
                return Flatmarket.create({
                    host: getState().getIn(['schema', 'server', 'host']),
                    pathname: getState().getIn(['schema', 'server', 'pathname']),
                }).createCharge(getState().get('charge').toJS())
                .then(function () {
                    dispatch({
                        type: TYPES.checkoutSuccess.id,
                        payload: undefined,
                    })
                })
            })
            .error(function (err) {
                switch (err.message) {
                    case ERRORS.cancelled.id:
                        return dispatch({
                            type: TYPES.checkoutCancel.id,
                            payload: undefined,
                        })
                    default:
                        return dispatch({
                            type: TYPES.checkoutFailure.id,
                            payload: err,
                        })
                }
            })
    }
}

function reset(schema) {
    return {
        type: TYPES.reset.id,
        payload: schema,
    }
}
