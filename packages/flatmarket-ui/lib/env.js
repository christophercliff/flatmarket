/* global StripeCheckout */
/* eslint no-process-env: 0 */
var _ = require('lodash')
var logger = require('redux-logger')

exports.getMiddleware = getMiddleware
exports.getStripeCheckout = getStripeCheckout

function getMiddleware() {
    return [
        (process.env.NODE_ENV === 'development') ? logger({ stateTransformer: stateTransformer }) : undefined,
    ]
}

function getStripeCheckout() {
    return (typeof StripeCheckout === 'object')
        ? StripeCheckout
        : {
            configure: function () {
                return {
                    open: _.noop,
                }
            },
        }
}

function stateTransformer(state) {
    return state.toJS()
}
