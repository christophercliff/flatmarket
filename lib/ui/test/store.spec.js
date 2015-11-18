/* global sinon */
var _ = require('lodash')
var actions = require('../actions')
var createStore = require('../create-store')
var expect = require('chai').expect
var getSubscribeHandler = require('./helper').getSubscribeHandler
var querystring = require('querystring')
var reducer = require('../reducer')
var url = require('url')

var SERVER_PROTOCOL = 'https'
var SCHEMA = require('./fixtures/flatmarket.json')
var RESPONSE_HEADERS = {
    'Content-Type': 'application/json',
}
var URI = url.format({
    protocol: SERVER_PROTOCOL,
    host: SCHEMA.server.host,
    pathname: '/',
})
var RESPONSES = {
    addresses: {
        billing_address_city: 'New York',
        billing_address_country: 'United States',
        billing_address_country_code: 'US',
        billing_address_line1: '123 Fake St',
        billing_address_state: 'NY',
        billing_address_zip: '10000',
        billing_name: 'John Doe',
        shipping_address_city: 'Racine',
        shipping_address_country: 'United States',
        shipping_address_country_code: 'US',
        shipping_address_line1: '123 Fake St',
        shipping_address_state: 'NY',
        shipping_address_zip: '10000',
        shipping_name: 'John Doe',
    },
    token: {
        email: 'test@email.com',
        id: 'tok_just_a_token',
    },
}

describe('store', function () {

    this.timeout(10e3)

    var fakeServer
    var store
    var stripeHandlers

    function getServer() {
        _.has(fakeServer, 'restore') && fakeServer.restore()
        fakeServer = sinon.fakeServer.create()
        fakeServer.autoRespond = true
        fakeServer.autoRespondAfter = 100
        return fakeServer
    }

    beforeEach(function () {
        store = createStore(reducer)
        store.dispatch(actions.reset(SCHEMA))
        sinon.stub(store.getState().get('stripeCheckout'), 'open', function (options) {
            stripeHandlers = _.pick(options, [
                'closed',
                'token',
            ])
        })
        fakeServer = getServer()
    })

    afterEach(function () {
        store.getState().get('stripeCheckout').open.restore()
        getServer().restore()
    })

    it('should error on invalid schema', function () {
        store.dispatch(actions.reset({ bogus: 'stuff' }))
        expect(store.getState().get('error')).to.equal('invalid_schema')
    })

    it('should error when trying to checkout with invalid product', function (done) {
        store.subscribe(getSubscribeHandler([
            function () {
                expect(store.getState().get('error')).to.equal('invalid_sku')
                expect(store.getState().get('charge')).to.equal(undefined)
            },
            function () {
                expect(store.getState().get('charge')).to.equal(undefined)
            },
        ], done))
        store.dispatch(actions.checkout('bogus_id'))
    })

    it('should checkout and cancel', function (done) {
        store.subscribe(getSubscribeHandler([
            function () {
                expect(store.getState().getIn([
                    'charge',
                    'sku',
                ])).to.equal('001')
                expect(store.getState().get('stripeCheckout').open).to.have.been.calledOnce
                expect(_.get(stripeHandlers, 'token')).to.be.a.function
                stripeHandlers.closed()
            },
            function () {
                expect(store.getState().get('charge')).to.equal(undefined)
            },
        ], done))
        store.dispatch(actions.checkout('001'))
    })

    it('should checkout and error when creating a charge', function (done) {
        store.subscribe(getSubscribeHandler([
            function () {
                expect(store.getState().getIn([
                    'charge',
                    'sku',
                ])).to.equal('001')
                expect(store.getState().get('stripeCheckout').open).to.have.been.calledOnce
                getServer().respondWith('POST', URI, [
                    400,
                    RESPONSE_HEADERS,
                    JSON.stringify({
                        statusCode: 400,
                        error: 'Bad Request',
                    }),
                ])
                store.dispatch(actions.createCharge({
                    email: 'test@email.com',
                    id: 'tok_just_a_token',
                    type: 'card',
                }))
            },
            function () {
                expect(store.getState().get('charge').toJS()).to.deep.equal({
                    email: 'test@email.com',
                    sku: '001',
                    token: 'tok_just_a_token',
                })
            },
            function () {
                expect(store.getState().get('error')).to.equal('charge_failed')
                expect(store.getState().get('charge')).to.equal(undefined)
            },
        ], done))
        store.dispatch(actions.checkout('001'))
    })

    it('should checkout and create a charge', function (done) {
        store.subscribe(getSubscribeHandler([
            function () {
                expect(store.getState().getIn([
                    'charge',
                    'sku',
                ])).to.equal('001')
                expect(store.getState().get('stripeCheckout').open).to.have.been.calledOnce
                var args = _.chain(store.getState().get('stripeCheckout').open.getCall(0).args)
                    .first()
                    .pick([
                        'amount',
                    ])
                    .value()
                expect(args).to.deep.equal({
                    amount: 123,
                })
                getServer().respondWith(function (fakeXHR) {
                    expect(fakeXHR.method).to.equal('POST')
                    expect(fakeXHR.url).to.equal('https://foo.com/')
                    expect(fakeXHR.requestHeaders['Content-Type']).to.equal('application/x-www-form-urlencoded;charset=utf-8')
                    expect(querystring.parse(fakeXHR.requestBody)).to.deep.equal({
                        email: 'test@email.com',
                        'shipping[address][city]': 'Racine',
                        'shipping[address][country]': 'United States',
                        'shipping[address][line1]': '123 Fake St',
                        'shipping[address][state]': 'NY',
                        'shipping[address][postal_code]': '10000',
                        'shipping[name]': 'John Doe',
                        sku: '001',
                        token: 'tok_just_a_token',
                    })
                    return fakeXHR.respond(200, RESPONSE_HEADERS, JSON.stringify({ status: 'ok' }))
                })
                expect(_.get(stripeHandlers, 'token')).to.be.a.function
                stripeHandlers.token(RESPONSES.token, RESPONSES.addresses)
            },
            function () {
                expect(store.getState().get('charge').toJS()).to.deep.equal({
                    email: 'test@email.com',
                    shipping: {
                        name: 'John Doe',
                        address: {
                            city: 'Racine',
                            country: 'United States',
                            line1: '123 Fake St',
                            state: 'NY',
                            postal_code: '10000',
                        },
                    },
                    sku: '001',
                    token: 'tok_just_a_token',
                })
            },
            function () {
                expect(store.getState().get('error')).to.equal(undefined)
                expect(store.getState().get('charge')).to.equal(undefined)
            },
        ], done))
        store.dispatch(actions.checkout('001'))
    })

    it('should set the server status to error', function (done) {
        store.subscribe(getSubscribeHandler([
            function () {
                expect(store.getState().get('status')).to.equal('begin')
            },
            function () {
                expect(store.getState().get('status')).to.equal('failure')
            },
        ], done))
        getServer().respondWith('GET', URI, [
            400,
            RESPONSE_HEADERS,
            JSON.stringify({
                error: 'foo',
            }),
        ])
        store.dispatch(actions.updateStatus())
    })

    it('should set the server status to success', function (done) {
        store.subscribe(getSubscribeHandler([
            function () {
                expect(store.getState().get('status')).to.equal('begin')
            },
            function () {
                expect(store.getState().get('status')).to.equal('success')
            },
        ], done))
        getServer().respondWith('GET', URI, [
            200,
            RESPONSE_HEADERS,
            JSON.stringify({
                status: 'ok',
            }),
        ])
        store.dispatch(actions.updateStatus())
    })

})
