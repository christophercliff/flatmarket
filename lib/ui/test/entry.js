var Bluebird = require('bluebird')
var chai = require('chai')
var sinonChai = require('sinon-chai')

Bluebird.onPossiblyUnhandledRejection(function (err) {
    throw err
})

chai.config.truncateThreshold = 0
chai.use(sinonChai)

require('./store.spec')
require('./entry.spec')
