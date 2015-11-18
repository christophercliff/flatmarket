var _ = require('lodash')
var Bluebird = require('bluebird')
var constants = require('./constants')
var Flatmarket = require('flatmarket-client')

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

exports.checkout = checkout
exports.checkoutCancel = checkoutCancel
exports.createCharge = createCharge
exports.reset = reset
exports.updateStatus = updateStatus

function checkout(sku) {
    return function (dispatch, getState) {
        if (getState().get('error')) return Bluebird.resolve()
        return Bluebird.resolve()
            .then(function () {
                dispatch(checkoutBegin(sku))
                if (getState().get('error')) return dispatch(checkoutCancel())
                return new Bluebird(function (resolve) {
                    var stripe = getState()
                        .getIn([
                            'schema',
                            'stripe',
                        ])
                        .toJS()
                    var product = getState()
                        .getIn([
                            'schema',
                            'products',
                            sku,
                        ])
                        .toJS()
                    var options = _.chain({})
                        .extend(_.pick(stripe, STRIPE_CHECKOUT_FIELDS))
                        .extend(_.pick(product, PRODUCT_CHECKOUT_FIELDS))
                        .extend({
                            closed: function () {
                                return resolve(_.toArray(arguments))
                            },
                            token: function () {
                                return resolve(_.toArray(arguments))
                            },
                        })
                        .value()
                    getState().get('stripeCheckout').open(options)
                })
                .spread(function (token, addresses) {
                    if (!token) return dispatch(checkoutCancel())
                    createCharge(token, addresses)(dispatch, getState)
                })
            })
    }
}

function checkoutBegin(sku) {
    return {
        type: TYPES.checkoutBegin.id,
        payload: sku,
    }
}

function checkoutCancel() {
    return {
        type: TYPES.checkoutCancel.id,
    }
}

function createCharge(token, addresses) {
    return function (dispatch, getState) {
        if (getState().get('error')) return Bluebird.resolve()
        return Bluebird.resolve()
            .then(function () {
                dispatch(createChargeBegin(token, addresses))
            })
            .then(function () {
                var state = getState()
                return Flatmarket.create({
                    host: state.getIn([
                        'schema',
                        'server',
                        'host',
                    ]),
                    pathname: state.getIn([
                        'schema',
                        'server',
                        'pathname',
                    ]),
                }).createCharge(state.get('charge').toJS())
            })
            .then(function () {
                dispatch(createChargeSuccess())
            })
            .caught(function (err) {
                dispatch(createChargeFailure(err))
            })
    }
}

function createChargeBegin(token, addresses) {
    return {
        type: TYPES.createChargeBegin.id,
        payload: {
            addresses: addresses,
            token: token,
        },
    }
}

function createChargeFailure() {
    return {
        type: TYPES.createChargeFailure.id,
    }
}

function createChargeSuccess() {
    return {
        type: TYPES.createChargeSuccess.id,
    }
}

function reset(schema) {
    return {
        type: TYPES.reset.id,
        payload: schema,
    }
}

function updateStatus() {
    return function (dispatch, getState) {
        if (getState().get('error')) return Bluebird.resolve()
        dispatch(updateStatusBegin())
        return Bluebird.resolve()
            .then(function () {
                var state = getState()
                return Flatmarket.create({
                    host: state.getIn([
                        'schema',
                        'server',
                        'host',
                    ]),
                    pathname: state.getIn([
                        'schema',
                        'server',
                        'pathname',
                    ]),
                }).getStatus()
            })
            .then(function () {
                dispatch(updateStatusSuccess())
            })
            .caught(function () {
                dispatch(updateStatusFailure())
            })
    }
}

function updateStatusBegin() {
    return {
        type: TYPES.updateStatusBegin.id,
    }
}

function updateStatusFailure() {
    return {
        type: TYPES.updateStatusFailure.id,
    }
}

function updateStatusSuccess() {
    return {
        type: TYPES.updateStatusSuccess.id,
    }
}
