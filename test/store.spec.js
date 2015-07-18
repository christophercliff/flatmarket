/* global sinon */
var actions = require('../lib/actions')
var expect = require('chai').expect
var store = require('../lib/store')
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

    var fakeServer

    this.timeout(10e3)

    beforeEach(function () {
        fakeServer = sinon.fakeServer.create()
        fakeServer.autoRespond = true
        fakeServer.autoRespondAfter = 100
    })

    afterEach(function () {
        fakeServer.restore()
    })

    it('should error on invalid schema', function () {
        store.dispatch(actions.reset({ bogus: 'stuff' }))
        expect(store.getState().get('error')).to.equal('invalid_schema')
    })

    it('should error when trying to checkout with invalid product', function () {
        store.dispatch(actions.reset(SCHEMA))
        expect(store.getState().toJS().schema).to.deep.equal(SCHEMA)
        store.dispatch(actions.checkout('bogus_id'))
        expect(store.getState().get('error')).to.equal('invalid_sku')
    })

    it('should checkout and cancel', function () {
        store.dispatch(actions.reset(SCHEMA))
        store.dispatch(actions.checkout('001'))
        expect(store.getState().getIn([
            'charge',
            'sku',
        ])).to.equal('001')
        store.dispatch(actions.checkoutCancel())
        expect(store.getState().get('charge')).to.equal(undefined)
    })

    it('should checkout and error when creating a charge', function (done) {
        fakeServer.respondWith('POST', URI, [
            400,
            RESPONSE_HEADERS,
            JSON.stringify({
                statusCode: 400,
                error: 'Bad Request',
            }),
        ])
        store.dispatch(actions.reset(SCHEMA))
        store.dispatch(actions.checkout('001'))
        var token = {
            email: 'test@email.com',
            id: 'tok_just_a_token',
            type: 'card',
        }
        var promise = actions.createCharge(token)(store.dispatch, store.getState)
        expect(store.getState().get('charge').toJS()).to.deep.equal({
            email: 'test@email.com',
            sku: '001',
            token: 'tok_just_a_token',
        })
        promise
            .then(function () {
                expect(store.getState().get('error')).to.equal('charge_failed')
                expect(store.getState().get('charge')).to.equal(undefined)
                return done()
            })
            .caught(done)
    })

    it('should checkout and create a charge', function (done) {
        fakeServer.respondWith('POST', URI, [
            200,
            RESPONSE_HEADERS,
            JSON.stringify({
                status: 'ok',
            }),
        ])
        store.dispatch(actions.reset(SCHEMA))
        store.dispatch(actions.checkout('001'))
        var token = {
            email: 'test@email.com',
            id: 'tok_just_a_token',
            type: 'card',
        }
        var promise = actions.createCharge(token)(store.dispatch, store.getState)
        expect(store.getState().get('charge').toJS()).to.deep.equal({
            email: 'test@email.com',
            sku: '001',
            token: 'tok_just_a_token',
        })
        promise
            .then(function () {
                expect(store.getState().get('charge')).to.equal(undefined)
                return done()
            })
            .caught(done)
    })

    it('should set the server status to error', function (done) {
        fakeServer.respondWith('GET', URI, [
            400,
            RESPONSE_HEADERS,
            JSON.stringify({
                error: 'foo',
            }),
        ])
        store.dispatch(actions.reset(SCHEMA))
        expect(store.getState().get('statusOfServer')).to.equal(undefined)
        var promise = actions.updateStatus()(store.dispatch, store.getState)
        expect(store.getState().get('statusOfServer')).to.equal('begin')
        promise
            .then(function () {
                expect(store.getState().get('statusOfServer')).to.equal('failure')
                return done()
            })
            .caught(done)
    })

    it('should set the server status to success', function (done) {
        fakeServer.respondWith('GET', URI, [
            200,
            RESPONSE_HEADERS,
            JSON.stringify({
                status: 'ok',
            }),
        ])
        store.dispatch(actions.reset(SCHEMA))
        expect(store.getState().get('statusOfServer')).to.equal(undefined)
        var promise = actions.updateStatus()(store.dispatch, store.getState)
        expect(store.getState().get('statusOfServer')).to.equal('begin')
        promise
            .then(function () {
                expect(store.getState().get('statusOfServer')).to.equal('success')
                return done()
            })
            .caught(done)
    })

})
