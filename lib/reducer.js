var constants = require('./constants')
var Immutable = require('immutable')
var schema = require('flatmarket-schema')
var stripeCheckout = require('./stripe-checkout')

var TYPES = constants.types
var STATUSES = constants.statuses
var ERRORS = {
    chargeFailed: {
        id: 'charge_failed',
    },
    invalidSku: {
        id: 'invalid_sku',
    },
    invalidSchema: {
        id: 'invalid_schema',
    },
}

module.exports = reducer
module.exports.getInitialState = getInitialState

function reducer(state, action) {
    state = state || getInitialState()
    if (process.env.NODE_ENV !== 'production') console.log('DISPATCHING', action.type)
    switch (action.type) {
        case TYPES.checkoutBegin.id:
            return handleCheckoutBegin(state, action.payload)
        case TYPES.checkoutCancel.id:
            return handleCheckoutCancel(state)
        case TYPES.createChargeBegin.id:
            return handleCreateChargeBegin(state, action.payload)
        case TYPES.createChargeFailure.id:
            return handleCreateChargeFailure(state)
        case TYPES.createChargeSuccess.id:
            return handleCreateChargeSuccess(state)
        case TYPES.reset.id:
            return handleReset(state, action.payload)
        case TYPES.updateStatusBegin.id:
            return handleUpdateStatusBegin(state)
        case TYPES.updateStatusFailure.id:
            return handleUpdateStatusFailure(state)
        case TYPES.updateStatusSuccess.id:
            return handleUpdateStatusSuccess(state)
        default:
            return state
    }
}

function getInitialState() {
    return Immutable.fromJS({
        charge: undefined,
        error: undefined,
        schema: undefined,
        status: undefined,
    })
}

function handleCheckoutBegin(state, payload) {
    if (state.get('error')) return state
    var hasProduct = state.hasIn([
        'schema',
        'products',
        payload,
    ])
    if (!hasProduct) return state.set('error', ERRORS.invalidSku.id)
    return state.set('charge', Immutable.fromJS({
        sku: payload,
    }))
}

function handleCheckoutCancel(state) {
    return state.set('charge', undefined)
}

function handleCreateChargeBegin(state, payload) {
    return state
        .setIn(['charge', 'email'], payload.email)
        .setIn(['charge', 'token'], payload.id)
}

function handleCreateChargeFailure(state) {
    return state
        .set('error', ERRORS.chargeFailed.id)
        .set('charge', undefined)
}

function handleCreateChargeSuccess(state) {
    return state.set('charge', undefined)
}

function handleReset(state, payload) {
    if (!schema.isValid(payload)) return state.set('error', ERRORS.invalidSchema.id)
    return getInitialState()
        .set('schema', Immutable.fromJS(payload))
        .set('stripeCheckout', stripeCheckout.configure({
            key: payload.stripe.publishableKey,
        }))
}

function handleUpdateStatusBegin(state) {
    return state.set('status', STATUSES.begin.id)
}

function handleUpdateStatusFailure(state) {
    return state.set('status', STATUSES.failure.id)
}

function handleUpdateStatusSuccess(state) {
    return state.set('status', STATUSES.success.id)
}
