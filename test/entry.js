var _ = require('lodash')
var chai = require('chai')

chai.config.truncateThreshold = 0
global.StripeCheckout = {
    configure: function () {
        return {
            open: _.noop,
        }
    },
}

require('./store.spec')
