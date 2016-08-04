var expect = require('chai').expect
var Hapi = require('hapi')
var nock = require('nock')
var Plugin = require('../')
var querystring = require('querystring')
var request = require('../lib/request')
var url = require('url')

var HOSTNAME = '127.0.0.1'
var PORT = 8000
var PROTOCOL = 'http'
var STRIPE_SECRET_KEY = 'sk_test_uGNBvbIuaVuzL1nGDmLQDqnC'
var STRIPE_ORIGIN = 'https://api.stripe.com'
var STRIPE_ACCOUNT_PATH = '/v1/account'
var STRIPE_CHARGE_PATH = '/v1/charges'
var STRIPE_CUSTOMER_PATH = '/v1/customers'
var URI = url.format({
    hostname: HOSTNAME,
    pathname: '/',
    port: PORT,
    protocol: PROTOCOL,
})
var CHARGE_OPTIONS = {
    payload: JSON.stringify({
        email: 'fake@email.com',
        sku: '001',
        token: 'just_a_fake_token',
    }),
}
var SCHEMA_HOST = 'flatmarket.static.com'
var SCHEMA_PROTOCOL = 'https'
var SCHEMA_PATHNAME = '/flatmarket.json'
var SCHEMA_ORIGIN = url.format({
    protocol: SCHEMA_PROTOCOL,
    host: SCHEMA_HOST,
})
var SCHEMA_URI = url.format({
    protocol: SCHEMA_PROTOCOL,
    host: SCHEMA_HOST,
    pathname: SCHEMA_PATHNAME,
})
var VALID_SCHEMA = require('./fixtures/flatmarket.valid.json')
var VALID_SHIPPING_SCHEMA = require('./fixtures/flatmarket.shipping.json')
var INVALID_SCHEMA = require('./fixtures/flatmarket.invalid.json')

describe('Plugin', function () {

    var server = new Hapi.Server()

    this.timeout(5e3)

    server.connection({
        host: HOSTNAME,
        port: PORT,
    })

    server.on('request-error', function (err) {
        throw err
    })

    server.register({
        register: Plugin,
        options: {
            schemaUri: SCHEMA_URI,
            stripeSecretKey: STRIPE_SECRET_KEY,
        },
    }, function (err) {
        if (err) throw err
    })

    before(server.start.bind(server))
    after(server.stop.bind(server))
    afterEach(function () {
        nock.cleanAll()
    })

    describe('POST', function () {

        it('should return 503 if missing schema', function (done) {
            nock(SCHEMA_ORIGIN)
                .get(SCHEMA_PATHNAME)
                .reply(404)
            request.post(URI, CHARGE_OPTIONS)
                .spread(function (res) {
                    expect(res.statusCode).to.equal(503)
                    return done()
                })
                .caught(done)
        })

        it('should return 503 if invalid schema', function (done) {
            nock(SCHEMA_ORIGIN)
                .get(SCHEMA_PATHNAME)
                .reply(200, INVALID_SCHEMA)
            request.post(URI, CHARGE_OPTIONS)
                .spread(function (res) {
                    expect(res.statusCode).to.equal(503)
                    return done()
                })
                .caught(done)
        })

        it('should return 400 if invalid request-schema combo', function (done) {
            nock(SCHEMA_ORIGIN)
                .get(SCHEMA_PATHNAME)
                .reply(200, VALID_SCHEMA)
            var options = {
                payload: JSON.stringify({
                    email: 'fake@gmail.com',
                    sku: 'xxx',
                    token: 'just_a_fake_token',
                }),
            }
            request.post(URI, options)
                .spread(function (res) {
                    expect(res.statusCode).to.equal(400)
                    return done()
                })
                .caught(done)
        })

        it('should proxy the stripe error if charge failure', function (done) {
            nock(STRIPE_ORIGIN)
                .post(STRIPE_CHARGE_PATH)
                .reply(400, { error: { message: 'oops' } })
            nock(SCHEMA_ORIGIN)
                .get(SCHEMA_PATHNAME)
                .reply(200, VALID_SCHEMA)
            request.post(URI, CHARGE_OPTIONS)
                .spread(function (res) {
                    expect(res.statusCode).to.equal(502)
                    return done()
                })
                .caught(done)
        })

        it('should return 200 if charge success', function (done) {
            var stripePayload
            nock(STRIPE_ORIGIN)
                .post(STRIPE_CHARGE_PATH)
                .reply(function (uri, payload) {
                    stripePayload = payload
                    return [
                        200,
                        JSON.stringify({}),
                    ]
                })
            nock(SCHEMA_ORIGIN)
                .get(SCHEMA_PATHNAME)
                .reply(200, VALID_SCHEMA)
            request.post(URI, CHARGE_OPTIONS)
                .spread(function (res) {
                    expect(res.statusCode).to.equal(200)
                    expect(querystring.parse(stripePayload)).to.deep.equal({
                        amount: '123',
                        currency: 'usd',
                        'metadata[email]': 'fake@email.com',
                        'metadata[sku]': '001',
                        source: 'just_a_fake_token',
                    })
                    return done()
                })
                .caught(done)
        })

        it('should handle SKU-level currency override', function (done) {
            var stripePayload
            nock(STRIPE_ORIGIN)
                .post(STRIPE_CHARGE_PATH)
                .reply(function (uri, payload) {
                    stripePayload = payload
                    return [
                        200,
                        JSON.stringify({}),
                    ]
                })
            nock(SCHEMA_ORIGIN)
                .get(SCHEMA_PATHNAME)
                .reply(200, VALID_SCHEMA)
            var options = {
                payload: JSON.stringify({
                    email: 'fake@email.com',
                    sku: '003',
                    token: 'just_a_fake_token',
                }),
            }
            request.post(URI, options)
                .spread(function (res) {
                    expect(res.statusCode).to.equal(200)
                    expect(querystring.parse(stripePayload)).to.deep.equal({
                        amount: '333',
                        currency: 'eur',
                        'metadata[email]': 'fake@email.com',
                        'metadata[sku]': '003',
                        source: 'just_a_fake_token',
                    })
                    return done()
                })
                .caught(done)
        })

        it('should handle plan subscriptions', function (done) {
            var stripePayload
            nock(STRIPE_ORIGIN)
                .post(STRIPE_CUSTOMER_PATH)
                .reply(function (uri, payload) {
                    stripePayload = payload
                    return [
                        200,
                        JSON.stringify({}),
                    ]
                })
            nock(SCHEMA_ORIGIN)
                .get(SCHEMA_PATHNAME)
                .reply(200, VALID_SCHEMA)
            var options = {
                payload: JSON.stringify({
                    email: 'fake@email.com',
                    sku: '002',
                    token: 'just_a_fake_token',
                }),
            }
            request.post(URI, options)
                .spread(function (res) {
                    expect(res.statusCode).to.equal(200)
                    expect(querystring.parse(stripePayload)).to.deep.equal({
                        email: 'fake@email.com',
                        'metadata[email]': 'fake@email.com',
                        'metadata[sku]': '002',
                        plan: 'my_test_plan',
                        source: 'just_a_fake_token',
                    })
                    return done()
                })
                .caught(done)
        })

        it('should handle metadata', function (done) {
            var stripePayload
            nock(STRIPE_ORIGIN)
                .post(STRIPE_CHARGE_PATH)
                .reply(function (uri, payload) {
                    stripePayload = payload
                    return [
                        200,
                        JSON.stringify({}),
                    ]
                })
            nock(SCHEMA_ORIGIN)
                .get(SCHEMA_PATHNAME)
                .reply(200, VALID_SCHEMA)
            var options = {
                payload: JSON.stringify({
                    email: 'fake@email.com',
                    metadata: {
                        test: {
                            a: 1,
                        },
                    },
                    sku: '001',
                    token: 'just_a_fake_token',
                }),
            }
            request.post(URI, options)
                .spread(function (res) {
                    expect(res.statusCode).to.equal(200)
                    expect(querystring.parse(stripePayload)).to.deep.equal({
                        amount: '123',
                        currency: 'usd',
                        'metadata[email]': 'fake@email.com',
                        'metadata[sku]': '001',
                        'metadata[test][a]': '1',
                        source: 'just_a_fake_token',
                    })
                    return done()
                })
                .caught(done)
        })

        it('should handle shipping address', function (done) {
            var stripePayload
            nock(STRIPE_ORIGIN)
                .post(STRIPE_CHARGE_PATH)
                .reply(function (uri, payload) {
                    stripePayload = payload
                    return [
                        200,
                        JSON.stringify({}),
                    ]
                })
            nock(SCHEMA_ORIGIN)
                .get(SCHEMA_PATHNAME)
                .reply(200, VALID_SHIPPING_SCHEMA)
            var options = {
                payload: JSON.stringify({
                    email: 'fake@email.com',
                    shipping: {
                        name: 'John Doe',
                        address: {
                            city: 'New York',
                            country: 'United States',
                            line1: '123 Fake St',
                            state: 'NY',
                            postal_code: '10000',
                        },
                    },
                    sku: '001',
                    token: 'just_a_fake_token',
                }),
            }
            request.post(URI, options)
                .spread(function (res) {
                    expect(res.statusCode).to.equal(200)
                    expect(querystring.parse(stripePayload)).to.deep.equal({
                        amount: '123',
                        currency: 'usd',
                        'metadata[email]': 'fake@email.com',
                        'metadata[sku]': '001',
                        'shipping[address][city]': 'New York',
                        'shipping[address][country]': 'United States',
                        'shipping[address][line1]': '123 Fake St',
                        'shipping[address][postal_code]': '10000',
                        'shipping[address][state]': 'NY',
                        'shipping[name]': 'John Doe',
                        source: 'just_a_fake_token',
                    })
                    return done()
                })
                .caught(done)
        })

        it('should handle missing shipping address', function (done) {
            nock(STRIPE_ORIGIN)
                .post(STRIPE_CHARGE_PATH)
                .reply(function () {
                    return [
                        200,
                        JSON.stringify({}),
                    ]
                })
            nock(SCHEMA_ORIGIN)
                .get(SCHEMA_PATHNAME)
                .reply(200, VALID_SHIPPING_SCHEMA)
            var options = {
                payload: JSON.stringify({
                    email: 'fake@email.com',
                    sku: '001',
                    token: 'just_a_fake_token',
                }),
            }
            request.post(URI, options)
                .spread(function (res) {
                    expect(res.statusCode).to.equal(400)
                    return done()
                })
                .caught(done)
        })

        it('should handle unnecessary shipping address', function (done) {
            nock(STRIPE_ORIGIN)
                .post(STRIPE_CHARGE_PATH)
                .reply(function () {
                    return [
                        200,
                        JSON.stringify({}),
                    ]
                })
            nock(SCHEMA_ORIGIN)
                .get(SCHEMA_PATHNAME)
                .reply(200, VALID_SCHEMA)
            var options = {
                payload: JSON.stringify({
                    email: 'fake@email.com',
                    shipping: {
                        name: 'John Doe',
                        address: {
                            city: 'New York',
                            country: 'United States',
                            line1: '123 Fake St',
                            state: 'NY',
                            postal_code: '10000',
                        },
                    },
                    sku: '001',
                    token: 'just_a_fake_token',
                }),
            }
            request.post(URI, options)
                .spread(function (res) {
                    expect(res.statusCode).to.equal(400)
                    return done()
                })
                .caught(done)
        })

    })

    describe('GET', function () {

        it('should return missing schema code', function (done) {
            nock(SCHEMA_ORIGIN)
                .get(SCHEMA_PATHNAME)
                .reply(404)
            request.get(URI)
                .spread(function (res, payload) {
                    expect(res.statusCode).to.equal(200)
                    expect(payload.code).to.equal('missing_schema')
                    return done()
                })
                .caught(done)
        })

        it('should return invalid schema code', function (done) {
            nock(SCHEMA_ORIGIN)
                .get(SCHEMA_PATHNAME)
                .reply(200, INVALID_SCHEMA)
            request.get(URI)
                .spread(function (res, payload) {
                    expect(res.statusCode).to.equal(200)
                    expect(payload.code).to.equal('invalid_schema')
                    return done()
                })
                .caught(done)
        })

        it('should return invalid stripe code', function (done) {
            nock(STRIPE_ORIGIN)
                .get(STRIPE_ACCOUNT_PATH)
                .reply(400, { error: { message: 'oops' } })
            nock(SCHEMA_ORIGIN)
                .get(SCHEMA_PATHNAME)
                .reply(200, VALID_SCHEMA)
            request.get(URI)
                .spread(function (res, payload) {
                    expect(res.statusCode).to.equal(200)
                    expect(payload.code).to.equal('invalid_stripe_configuration')
                    return done()
                })
                .caught(done)
        })

        it('should return ok code', function (done) {
            nock(STRIPE_ORIGIN)
                .get(STRIPE_ACCOUNT_PATH)
                .reply(200, {})
            nock(SCHEMA_ORIGIN)
                .get(SCHEMA_PATHNAME)
                .reply(200, VALID_SCHEMA)
            request.get(URI)
                .spread(function (res, payload) {
                    expect(res.statusCode).to.equal(200)
                    expect(payload.code).to.equal('ok')
                    return done()
                })
                .caught(done)
        })

    })

})
