/* global sinon */
var _ = require('lodash')
var actions = require('../lib/actions')
var createStore = require('../lib/create-store')
var expect = require('chai').expect
var getSubscribeHandler = require('./helper').getSubscribeHandler
var reducer = require('../lib/reducer')
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

describe('store', function () {

    this.timeout(10e3)

    var fakeServer
    var store

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
        sinon.stub(store.getState().get('stripeCheckout'), 'open')
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
                process.nextTick(function () {
                    expect(store.getState().get('stripeCheckout').open).to.have.been.calledOnce
                    store.dispatch(actions.checkoutCancel())
                })
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
                process.nextTick(function () {
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
                })
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
                process.nextTick(function () {
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
                    getServer().respondWith('POST', URI, [
                        200,
                        RESPONSE_HEADERS,
                        JSON.stringify({
                            status: 'ok',
                        }),
                    ])
                    store.dispatch(actions.createCharge({
                        email: 'test@email.com',
                        id: 'tok_just_a_token',
                        type: 'card',
                    }))
                })
            },
            function () {
                expect(store.getState().get('charge').toJS()).to.deep.equal({
                    email: 'test@email.com',
                    sku: '001',
                    token: 'tok_just_a_token',
                })
            },
            function () {
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
