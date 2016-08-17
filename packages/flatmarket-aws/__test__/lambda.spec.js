var chai = require('chai')
var expect = require('chai').expect
var handler = require('../lambda').handler
var mockRequire = require('mock-require')
var sinon = require('sinon')
var sinonChai = require('sinon-chai')

chai.config.truncateThreshold = 0
chai.use(sinonChai)

var VALUES = {
    schemaUri: { id: 'https://foo.com/flatmarket.json' },
    stripeSecretKey: { id: 'sk_test_foo' },
}

describe('flatmarket-aws', function () {

    var handlerSpy
    var createHandlerSpy = sinon.spy(function () {
        handlerSpy = sinon.spy(function () {
            return Promise.resolve({ foo: 'foo' })
        })
        return handlerSpy
    })

    beforeEach(function () {
        mockRequire('flatmarket-service', createHandlerSpy)
        handler = mockRequire.reRequire('../lambda').handler
    })

    it('should resolve with the response', function (done) {
        handler({
            env: {
                schemaUri: VALUES.schemaUri.id,
                stripeSecretKey: VALUES.stripeSecretKey.id,
            },
            body: {
                hello: 'world',
            },
        }, undefined, function (err, res) {
            if (err) return done(err)
            try {
                expect(createHandlerSpy).to.have.been.calledWith(VALUES.stripeSecretKey.id, VALUES.schemaUri.id)
                expect(handlerSpy).to.have.been.calledWith({ hello: 'world' })
                expect(res).to.deep.equal({ foo: 'foo' })
                return done()
            } catch (ex) {
                return done(ex)
            }
        })
    })

    it('should resolve with the error', function (done) {
        handler({
            env: {
                schemaUri: 'foo',
                stripeSecretKey: VALUES.stripeSecretKey.id,
            },
        }, undefined, function (err) {
            try {
                expect(JSON.parse(err).statusCode).to.equal(400)
                return done()
            } catch (ex) {
                return done(ex)
            }
        })
    })

    it('should resolve with an unhandled error', function (done) {
        mockRequire('flatmarket-service', function () {
            throw new Error('foo')
        })
        handler = mockRequire.reRequire('../lambda').handler
        handler({
            env: {
                schemaUri: VALUES.schemaUri.id,
                stripeSecretKey: VALUES.stripeSecretKey.id,
            },
        }, undefined, function (err) {
            try {
                expect(JSON.parse(err).statusCode).to.equal(500)
                return done()
            } catch (ex) {
                return done(ex)
            }
        })
    })

})
