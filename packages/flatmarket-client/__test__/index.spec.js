/* global sinon */
var Bluebird = require('bluebird')
var Client = require('../lib/index')
var expect = require('chai').expect

var HOST = 'just-a-test-host.com'
var RESPONSE_HEADERS = {
    'Content-Type': 'application/json',
}

describe('Client', function () {

    describe('create()', function () {

        it('should create the client', function () {
            expect(Client.create({ host: HOST }).uri).to.equal('https://just-a-test-host.com/')
        })

        it('should create the client with a pathname', function () {
            expect(Client.create({
                host: HOST,
                pathname: '/foo',
            }).uri).to.equal('https://just-a-test-host.com/foo')
        })

        it('should throw with invalid options', function () {
            expect(function () {
                Client.create()
            }).to.throw(Error)
        })

    })

    describe('createCharge()', function () {

        var client
        var fakeServer

        beforeEach(function () {
            client = Client.create({ host: HOST })
            fakeServer = sinon.fakeServer.create()
            fakeServer.autoRespond = true
            fakeServer.autoRespondAfter = 10
        })

        afterEach(function () {
            fakeServer.restore()
        })

        it('should create a charge', function (done) {
            fakeServer.respondWith(function (fakeXHR) {
                expect(fakeXHR.method).to.equal('POST')
                expect(fakeXHR.url).to.equal('https://just-a-test-host.com/')
                expect(fakeXHR.requestHeaders['Content-Type']).to.equal('application/json;charset=utf-8')
                expect(JSON.parse(fakeXHR.requestBody)).to.deep.equal({
                    email: 'test@email.com',
                    sku: '001',
                    token: 'just_a_fake_token',
                })
                return fakeXHR.respond(200, RESPONSE_HEADERS, JSON.stringify({ status: 'ok' }))
            })
            client.createCharge({
                email: 'test@email.com',
                sku: '001',
                token: 'just_a_fake_token',
            })
            .then(function (payload) {
                expect(payload.status).to.equal('ok')
                return done()
            })
        })

        it('should create a metadata charge', function (done) {
            fakeServer.respondWith(function (fakeXHR) {
                expect(fakeXHR.method).to.equal('POST')
                expect(fakeXHR.url).to.equal('https://just-a-test-host.com/')
                expect(fakeXHR.requestHeaders['Content-Type']).to.equal('application/json;charset=utf-8')
                expect(JSON.parse(fakeXHR.requestBody)).to.deep.equal({
                    email: 'test@email.com',
                    metadata: {
                        hello: 'world',
                    },
                    sku: '001',
                    token: 'just_a_fake_token',
                })
                return fakeXHR.respond(200, RESPONSE_HEADERS, JSON.stringify({ status: 'ok' }))
            })
            client.createCharge({
                email: 'test@email.com',
                metadata: {
                    hello: 'world',
                },
                sku: '001',
                token: 'just_a_fake_token',
            })
            .then(function (payload) {
                expect(payload.status).to.equal('ok')
                return done()
            })
        })

        it('should create a shipping address charge', function (done) {
            fakeServer.respondWith(function (fakeXHR) {
                expect(fakeXHR.method).to.equal('POST')
                expect(fakeXHR.url).to.equal('https://just-a-test-host.com/')
                expect(fakeXHR.requestHeaders['Content-Type']).to.equal('application/json;charset=utf-8')
                expect(JSON.parse(fakeXHR.requestBody)).to.deep.equal({
                    email: 'test@email.com',
                    shipping: {
                        address: {
                            city: 'Racine',
                            country: 'United States',
                            line1: '123 Fake St',
                            state: 'NY',
                            postal_code: '10000',
                        },
                        name: 'John Doe',
                    },
                    sku: '001',
                    token: 'just_a_fake_token',
                })
                return fakeXHR.respond(200, RESPONSE_HEADERS, JSON.stringify({ status: 'ok' }))
            })
            client.createCharge({
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
                token: 'just_a_fake_token',
            })
            .then(function (payload) {
                expect(payload.status).to.equal('ok')
                return done()
            })
        })

        it('should reject an invalid charge payload', function (done) {
            client.createCharge({ hello: 'world' })
                .then(function () {
                    return done(new Error('success should not have been called'))
                })
                .error(function (err) {
                    expect(err).to.be.an.instanceOf(Bluebird.OperationalError)
                    return done()
                })
        })

        it('should handle an expected server error', function (done) {
            fakeServer.respondWith([400, RESPONSE_HEADERS, JSON.stringify({ error: 'foo' })])
            client.createCharge({
                email: 'test@email.com',
                sku: '001',
                token: 'just_a_fake_token',
            })
            .then(function () {
                return done(new Error('success should not have been called'))
            })
            .error(function (err) {
                expect(err).to.be.an.instanceOf(Bluebird.OperationalError)
                expect(err.message).to.equal('foo')
                return done()
            })
        })

        it('should handle an unexpected server error', function (done) {
            fakeServer.respondWith([500, RESPONSE_HEADERS, 'foo'])
            client.createCharge({
                email: 'test@email.com',
                sku: '001',
                token: 'just_a_fake_token',
            })
            .then(function () {
                return done(new Error('success should not have been called'))
            })
            .error(function (err) {
                expect(err).to.be.an.instanceOf(Bluebird.OperationalError)
                expect(err.message).to.equal('An error occurred')
                return done()
            })
        })

    })

})
