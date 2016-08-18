var _ = require('lodash')
var Bluebird = require('bluebird')
var expect = require('chai').expect
var mockRequire = require('mock-require')
var startServer = require('../lib/').startServer

Bluebird.onPossiblyUnhandledRejection(function (err) {
    throw err
})

var OPTIONS = {
    port: 8000,
    schemaUri: 'https://just-a-test-server.com/flatmarket.json',
    stripeSecretKey: 'just_a_test_key',
}

describe('flatmarket-server', function () {

    beforeEach(function () {
        startServer = mockRequire.reRequire('../lib/').startServer
    })

    afterEach(function () {
        mockRequire.stopAll()
    })

    it('should reject on validation error', function (done) {
        var options = {
            foo: 'foo',
        }
        startServer(options)
            .then(function () {
                return done(new Error('success should not have been called'))
            })
            .error(function (err) {
                expect(err.name).to.equal('ValidationError')
                return done()
            })
    })

    it('should reject on register error', function (done) {
        mockRequire('hapi', {
            Server: function () {
                this.connection = _.noop
                this.register = function (options, callback) {
                    return callback(new Error('Register error'))
                }
            },
        })
        startServer = mockRequire.reRequire('../lib/').startServer
        startServer(OPTIONS)
            .then(function () {
                return done(new Error('success should not have been called'))
            })
            .error(function (err) {
                expect(err.message).to.equal('Register error')
                return done()
            })
    })

    it('should reject on start error', function (done) {
        mockRequire('hapi', {
            Server: function () {
                this.connection = _.noop
                this.register = function (options, callback) {
                    return callback()
                }
                this.start = function (callback) {
                    return callback(new Error('Start error'))
                }
            },
        })
        startServer = mockRequire.reRequire('../lib/').startServer
        startServer(OPTIONS)
            .then(function () {
                return done(new Error('success should not have been called'))
            })
            .error(function (err) {
                expect(err.message).to.equal('Start error')
                return done()
            })
    })

    it('should load the plugin and start', function (done) {
        startServer(OPTIONS)
            .then(function (server) {
                expect(server.lookup('flatmarket')).to.have.property('path', '/')
                expect(server.lookup('flatmarket-preflight')).to.have.property('path', '/')
                return done()
            })
    })

})
