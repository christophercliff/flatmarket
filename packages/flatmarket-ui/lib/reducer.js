var _ = require('lodash')
var constants = require('./constants')
var createReducer = require('crispy-redux/createReducer')
var flatmarketSchema = require('flatmarket-schema')
var Immutable = require('immutable')

var SHIPPING_ADDRESS_PREFIX = 'shipping_address_'
var SHIPPING_NAME_PREFIX = 'shipping_name'
var SHIPPING_ZIP = 'shipping_address_zip'
var SHIPPING_COUNTRY_CODE = 'shipping_address_country_code'
var TYPES = constants.types
var ERRORS = require('./constants').errors

module.exports = createReducer(_.object([
    [TYPES.checkoutBegin.id, checkoutBegin],
    [TYPES.checkoutCancel.id, checkoutCancel],
    [TYPES.checkoutCharge.id, checkoutCharge],
    [TYPES.checkoutFailure.id, checkoutFailure],
    [TYPES.checkoutSuccess.id, checkoutSuccess],
    [TYPES.reset.id, reset],
]), function () {
    return Immutable.fromJS({
        charge: undefined,
        error: undefined,
        schema: undefined,
        status: undefined,
    })
})

function checkoutBegin(state, sku) {
    return state.set('charge', Immutable.fromJS({
        sku: sku,
    }))
}

function checkoutCancel(state) {
    return state.set('charge', undefined)
}

function checkoutCharge(state, payload) {
    var needsShippingAddress = state.getIn([
        'schema',
        'products',
        payload.token.sku,
        'shippingAddress',
    ]) || state.getIn([
        'schema',
        'stripe',
        'shippingAddress',
    ])
    return state.withMutations(function (_state) {
        _state
            .setIn(['charge', 'email'], payload.token.email)
            .setIn(['charge', 'token'], payload.token.id)
        if (needsShippingAddress) {
            _.forEach(payload.addresses, function (val, key) {
                if (key.indexOf('shipping') < 0) return
                if (key === SHIPPING_COUNTRY_CODE) return
                if (key === SHIPPING_NAME_PREFIX) {
                    return _state.setIn([
                        'charge',
                        'shipping',
                        'name',
                    ], val)
                }
                var target = (key === SHIPPING_ZIP)
                    ? 'postal_code'
                    : key.replace(SHIPPING_ADDRESS_PREFIX, '')
                return _state.setIn([
                    'charge',
                    'shipping',
                    'address',
                    target,
                ], val)
            })
        }
        return _state
    })
}

function checkoutFailure(state, err) {
    var error = _.includes(_.pluck(ERRORS, 'id'), err) ? err : ERRORS.chargeFailed.id
    return module.exports().merge({
        error: error,
        schema: state.get('schema'),
    })
}

function checkoutSuccess(state) {
    return state.set('charge', undefined)
}

function reset(state, payload) {
    if (!flatmarketSchema.isValid(payload)) return state.set('error', ERRORS.invalidSchema.id)
    return module.exports().set('schema', Immutable.fromJS(payload))
}
