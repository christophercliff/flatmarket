var _ = require('lodash')
var Bluebird = require('bluebird')
var Boom = require('boom')
var expect = require('chai').expect
var Hapi = require('hapi')
var mockRequire = require('mock-require')
var Plugin = require('../')
var url = require('url')
var Wreck = require('wreck')

var HOSTNAME = '127.0.0.1'
var PORT = 8000
var PROTOCOL = 'http'
var STRIPE_SECRET_KEY = 'sk_test_just_a_test'
var URI = url.format({
    hostname: HOSTNAME,
    pathname: '/',
    port: PORT,
    protocol: PROTOCOL,
})
var SCHEMA_URI = 'https://just_a_test.com/flatmarket.json'

Bluebird.onPossiblyUnhandledRejection(function (err) {
    throw err
})

describe('hapi-flatmarket', function () {

    var server

    beforeEach(function () {
        server = new Hapi.Server({ debug: false })
        server.connection({
            host: HOSTNAME,
            port: PORT,
        })
    })

    describe('register()', function () {

        it('should throw if invalid options', function (done) {
            server.register({
                register: Plugin,
                options: {
                    foo: 'foo',
                },
            }, function (err) {
                expect(err).to.be.an.instanceOf(Error)
                return done()
            })
        })

        it('should create the route', function (done) {
            server.register({
                register: Plugin,
                options: {
                    schemaUri: SCHEMA_URI,
                    stripeSecretKey: STRIPE_SECRET_KEY,
                },
            }, function (err) {
                if (err) throw err
                return done()
            })
        })

    })

    describe('handler()', function () {

        afterEach(function (done) {
            server.stop(done)
        })

        it('should invoke the handler', function (done) {
            mockRequire('flatmarket-service', function () {
                return function () {
                    return Bluebird.resolve({ foo: 'foo' })
                }
            })
            Plugin = mockRequire.reRequire('../')
            server.register({
                register: Plugin,
                options: {
                    schemaUri: SCHEMA_URI,
                    stripeSecretKey: STRIPE_SECRET_KEY,
                },
            }, function (registerErr) {
                if (registerErr) return done(registerErr)
                server.start(function (startErr) {
                    if (startErr) return done(startErr)
                    doPost().spread(function (res, payload) {
                        expect(res.statusCode).to.equal(200)
                        expect(payload).to.deep.equal({ foo: 'foo' })
                        return done()
                    })
                })
            })
        })

        it('should invoke preflight handler', function (done) {
            server.register({
                register: Plugin,
                options: {
                    corsOrigins: ['https://foo.com'],
                    schemaUri: SCHEMA_URI,
                    stripeSecretKey: STRIPE_SECRET_KEY,
                },
            }, function (registerErr) {
                if (registerErr) return done(registerErr)
                server.start(function (startErr) {
                    if (startErr) return done(startErr)
                    return new Bluebird(function (resolve, reject) {
                        Wreck.request('OPTIONS', URI, {}, function (err, res, payload) {
                            if (err) return reject(err)
                            return resolve([
                                res,
                                payload,
                            ])
                        })
                    })
                    .spread(function (res) {
                        expect(_.get(res, [
                            'headers',
                            'access-control-allow-origin',
                        ])).to.equal('https://foo.com')
                        return done()
                    })
                })
            })
        })

        it('should handle known errors', function (done) {
            mockRequire('flatmarket-service', function () {
                return function () {
                    return Bluebird.reject(Boom.create(400))
                }
            })
            Plugin = mockRequire.reRequire('../')
            server.register({
                register: Plugin,
                options: {
                    schemaUri: SCHEMA_URI,
                    stripeSecretKey: STRIPE_SECRET_KEY,
                },
            }, function (registerErr) {
                if (registerErr) return done(registerErr)
                server.start(function (startErr) {
                    if (startErr) return done(startErr)
                    doPost().spread(function (res) {
                        expect(res.statusCode).to.equal(400)
                        return done()
                    })
                })
            })
        })

        it('should handle unknown errors', function (done) {
            mockRequire('flatmarket-service', function () {
                return function () {
                    return Bluebird.reject(new Error('oops'))
                }
            })
            Plugin = mockRequire.reRequire('../')
            server.register({
                register: Plugin,
                options: {
                    schemaUri: SCHEMA_URI,
                    stripeSecretKey: STRIPE_SECRET_KEY,
                },
            }, function (registerErr) {
                if (registerErr) return done(registerErr)
                server.start(function (startErr) {
                    if (startErr) return done(startErr)
                    doPost().spread(function (res) {
                        expect(res.statusCode).to.equal(500)
                        return done()
                    })
                })
            })
        })

    })

})

function doPost() {
    return post(URI, {
        payload: JSON.stringify({
            email: 'fake@email.com',
            sku: '001',
            token: 'just_a_fake_token',
        }),
    })
}

function post(uri, options) {
    options = _.extend({ json: true }, options)
    return new Bluebird(function (resolve, reject) {
        Wreck.post(uri, options, function (err, res, payload) {
            if (err) return reject(err)
            return resolve([
                res,
                payload,
            ])
        })
    })
}
