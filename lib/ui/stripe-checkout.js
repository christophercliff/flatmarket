/* global StripeCheckout */
var _ = require('lodash')

module.exports = (typeof StripeCheckout === 'object') ? StripeCheckout : {
    configure: function () {
        return {
            open: _.noop,
        }
    },
}
