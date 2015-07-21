/* global sinon */
var Client = require('lib/index')
var expect = require('chai').expect
var url = require('url')

var HOST = 'just-a-test-host.com'
var URI = url.format({
    protocol: 'https',
    host: HOST,
    pathname: '/',
})

describe('Client', function () {

    var fakeServer

    beforeEach(function () {
        fakeServer = sinon.fakeServer.create()
        fakeServer.autoRespond = true
        fakeServer.autoRespondAfter = 100
    })

    afterEach(function () {
        fakeServer.restore()
    })

    describe('create()', function () {

        it('should create the client', function () {
            expect(Client.create({ host: HOST }).uri).to.equal('https://just-a-test-host.com/')
        })

    })

    describe('getStatus()', function () {

        it('should get the status', function (done) {
            fakeServer.respondWith('GET', URI, [
                200,
                {
                    'Content-Type': 'application/json',
                },
                JSON.stringify({
                    status: 'ok',
                }),
            ])
            Client.create({ host: HOST }).getStatus()
                .then(function (payload) {
                    expect(payload.status).to.equal('ok')
                    return done()
                })
                .caught(done)
        })

    })

    describe('createCharge()', function () {

        it('should create the charge', function (done) {
            fakeServer.respondWith('POST', URI, [
                200,
                {
                    'Content-Type': 'application/json',
                },
                JSON.stringify({
                    status: 'ok',
                }),
            ])
            var options = {
                email: 'test@email.com',
                sku: '001',
                token: 'just_a_fake_token',
            }
            Client.create({ host: HOST }).createCharge(options)
                .then(function (payload) {
                    expect(payload.status).to.equal('ok')
                    return done()
                })
                .caught(done)
        })

    })

})
