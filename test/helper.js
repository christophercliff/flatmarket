var _ = require('lodash')
var Bluebird = require('bluebird')
var expect = require('chai').expect

exports.getSubscribeHandler = getSubscribeHandler

function getSubscribeHandler (handlers, done) {
    log('Initialized subscription handler')
    var isStopped = false
    function stop (_done) {
        if (isStopped) return undefined
        isStopped = true
        log('Subscription handling complete (future actions are not under test)')
        return _done()
    }
    return function () {
        return Bluebird.resolve()
            .then(handlers.shift())
            .caught(done)
            .then(function () {
                if (_.isEmpty(handlers)) return stop(done)
            })
    }
}

function log (msg) {
    if (process.env.NODE_ENV !== 'development') return
    console.warn(msg)
}
