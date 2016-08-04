var _ = require('lodash')
var expect = require('chai').expect
var nock = require('nock')
var createHandler = require('../')
var querystring = require('querystring')
var url = require('url')

var STRIPE_SECRET_KEY = 'sk_test_uGNBvbIuaVuzL1nGDmLQDqnC'
var STRIPE_ORIGIN = 'https://api.stripe.com'
var STRIPE_CHARGE_PATH = '/v1/charges'
var STRIPE_CUSTOMER_PATH = '/v1/customers'
var CHARGE_OPTIONS = {
    email: 'fake@email.com',
    sku: '001',
    token: 'just_a_fake_token',
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

describe('handleRequest()', function () {

    var handleRequest

    beforeEach(function () {
        handleRequest = createHandler(STRIPE_SECRET_KEY, SCHEMA_URI)
    })

    afterEach(function () {
        nock.cleanAll()
    })

    it('should return 503 if GET fails', function (done) {
        handleRequest = createHandler(STRIPE_SECRET_KEY, 'bogus_url')
        nock(SCHEMA_ORIGIN)
            .get(SCHEMA_PATHNAME)
            .reply(404)
        handleRequest(CHARGE_OPTIONS)
            .then(done)
            .error(function (err) {
                expect(_.get(err, 'output.statusCode')).to.equal(503)
                return done()
            })
            .caught(done)
    })

    it('should return 503 if missing schema', function (done) {
        nock(SCHEMA_ORIGIN)
            .get(SCHEMA_PATHNAME)
            .reply(404)
        handleRequest(CHARGE_OPTIONS)
            .then(done)
            .error(function (err) {
                expect(_.get(err, 'output.statusCode')).to.equal(503)
                return done()
            })
            .caught(done)
    })

    it('should return 503 if invalid schema', function (done) {
        nock(SCHEMA_ORIGIN)
            .get(SCHEMA_PATHNAME)
            .reply(200, INVALID_SCHEMA)
        handleRequest(CHARGE_OPTIONS)
            .then(done)
            .error(function (err) {
                expect(_.get(err, 'output.statusCode')).to.equal(503)
                return done()
            })
            .caught(done)
    })

    it('should return 400 if invalid request-schema combo', function (done) {
        nock(SCHEMA_ORIGIN)
            .get(SCHEMA_PATHNAME)
            .reply(200, VALID_SCHEMA)
        var options = {
            email: 'fake@gmail.com',
            sku: 'xxx',
            token: 'just_a_fake_token',
        }
        handleRequest(options)
            .then(done)
            .error(function (err) {
                expect(_.get(err, 'output.statusCode')).to.equal(400)
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
        handleRequest(CHARGE_OPTIONS)
            .then(done)
            .error(function (err) {
                expect(_.get(err, 'output.statusCode')).to.equal(502)
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
        handleRequest(CHARGE_OPTIONS)
            .then(function (res) {
                expect(res).to.deep.equal({ code: 'ok' })
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
            email: 'fake@email.com',
            sku: '003',
            token: 'just_a_fake_token',
        }
        handleRequest(options)
            .then(function (res) {
                expect(res).to.deep.equal({ code: 'ok' })
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
            email: 'fake@email.com',
            sku: '002',
            token: 'just_a_fake_token',
        }
        handleRequest(options)
            .then(function (res) {
                expect(res).to.deep.equal({ code: 'ok' })
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
            email: 'fake@email.com',
            metadata: {
                test: {
                    a: 1,
                },
            },
            sku: '001',
            token: 'just_a_fake_token',
        }
        handleRequest(options)
            .then(function (res) {
                expect(res).to.deep.equal({ code: 'ok' })
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
        }
        handleRequest(options)
            .then(function (res) {
                expect(res).to.deep.equal({ code: 'ok' })
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
            email: 'fake@email.com',
            sku: '001',
            token: 'just_a_fake_token',
        }
        handleRequest(options)
            .then(done)
            .error(function (err) {
                expect(_.get(err, 'output.statusCode')).to.equal(400)
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
        }
        handleRequest(options)
            .then(done)
            .error(function (err) {
                expect(_.get(err, 'output.statusCode')).to.equal(400)
                return done()
            })
            .caught(done)
    })

})
