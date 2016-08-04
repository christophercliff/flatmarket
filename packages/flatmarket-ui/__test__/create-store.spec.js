/* global sinon */
var _ = require('lodash')
var actions = require('../lib/actions')
var Bluebird = require('bluebird')
var createStore = require('../lib/create-store')
var expect = require('chai').expect
var Flatmarket = require('flatmarket-client')
var getSubscribeHandler = require('./helper').getSubscribeHandler
var reducer = require('../lib/reducer')
var stripeCheckout = require('../lib/stripe-checkout')

var FIXTURES = {
    schema: {
        id: {
            info: {
                name: 'test',
            },
            products: {
                '001': {
                    amount: 123,
                },
                '002': {
                    amount: 123,
                    currency: 'eur',
                },
            },
            server: {
                host: 'foo.com',
            },
            stripe: {
                publishableKey: 'just_a_fake_key',
            },
        },
    },
}
var RESPONSES = {
    addresses: {
        id: {
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
    },
    token: {
        id: {
            email: 'test@email.com',
            id: 'tok_just_a_token',
        },
    },
}
var ERRORS = require('../lib/constants').errors

describe('lib/create-store', function () {
    var store
    var stripeConfigureStub
    var stripeOpenStub
    var stripeStubCallbacks

    beforeEach(function () {
        store = createStore(reducer)
        stripeConfigureStub = sinon.stub(stripeCheckout, 'configure', function () {
            var mockStripeApi = {
                open: _.noop,
            }
            stripeOpenStub = sinon.stub(mockStripeApi, 'open', function (options) {
                stripeStubCallbacks = _.pick(options, [
                    'closed',
                    'token',
                ])
            })
            return mockStripeApi
        })
    })

    afterEach(function () {
        stripeConfigureStub.restore()
    })

    describe('reset()', function () {

        it('should reset', function () {
            store.dispatch(actions.reset(FIXTURES.schema.id))
            expect(store.getState().toJS()).to.deep.equal({
                charge: undefined,
                error: undefined,
                schema: FIXTURES.schema.id,
                status: undefined,
            })
        })

        it('should error if the schema is invalid', function () {
            var schema = _.cloneDeep(FIXTURES.schema.id)
            store.dispatch(actions.reset(_.extend(schema, {
                foo: 'foo',
            })))
            expect(store.getState().toJS()).to.deep.equal({
                charge: undefined,
                error: ERRORS.invalidSchema.id,
                schema: undefined,
                status: undefined,
            })
        })

    })

    describe('checkout()', function () {

        beforeEach(function () {
            sinon.stub(Flatmarket, 'create', function () {
                return {
                    createCharge: function () {
                        return Bluebird.resolve()
                    },
                }
            })
            store.dispatch(actions.reset(FIXTURES.schema.id))
        })

        afterEach(function () {
            Flatmarket.create.restore()
        })

        it('should set the sku to be charged', function (done) {
            store.subscribe(getSubscribeHandler([
                function () {
                    expect(store.getState().getIn([
                        'charge',
                        'sku',
                    ])).to.equal('001')
                },
            ], done))
            store.dispatch(actions.checkout('001'))
        })

        it('should configure Stripe with the publishable key', function (done) {
            store.subscribe(getSubscribeHandler([
                function () {
                    expect(stripeConfigureStub).to.have.been.calledOnce
                    expect(stripeConfigureStub).to.have.been.calledWith({ key: 'just_a_fake_key' })
                },
            ], done))
            store.dispatch(actions.checkout('001'))
        })

        it('should open Stripe with global and product options', function (done) {
            store.subscribe(getSubscribeHandler([
                function () {
                    expect(stripeOpenStub).to.have.been.calledOnce
                    var options = stripeOpenStub.args[0][0]
                    expect(options.amount).to.equal(123)
                },
            ], done))
            store.dispatch(actions.checkout('001'))
        })

        it('should open Stripe with global options overriden by product options', function (done) {
            store.subscribe(getSubscribeHandler([
                function () {
                    expect(stripeOpenStub).to.have.been.calledOnce
                    var options = stripeOpenStub.args[0][0]
                    expect(options.amount).to.equal(123)
                    expect(options.currency).to.equal('eur')
                },
            ], done))
            store.dispatch(actions.checkout('002'))
        })

        it('should cancel the charge when the user closes out Stripe', function (done) {
            store.subscribe(getSubscribeHandler([
                function () {
                    stripeStubCallbacks.closed()
                },
                function () {
                    expect(store.getState().get('charge')).to.be.undefined
                },
            ], done))
            store.dispatch(actions.checkout('001'))
        })

        it('should error if the sku is invalid', function (done) {
            store.subscribe(getSubscribeHandler([
                function () {
                    expect(store.getState().get('error')).to.equal(ERRORS.invalidSku.id)
                },
            ], done))
            store.dispatch(actions.checkout('foo'))
        })

        it('should handle a charge failure', function (done) {
            Flatmarket.create.restore()
            sinon.stub(Flatmarket, 'create', function () {
                return {
                    createCharge: function () {
                        return Bluebird.reject(new Error('foo'))
                    },
                }
            })
            store.subscribe(getSubscribeHandler([
                function () {
                    stripeStubCallbacks.token(RESPONSES.token.id, RESPONSES.addresses.id)
                },
                _.noop,
                function () {
                    expect(store.getState().toJS()).to.deep.equal({
                        charge: undefined,
                        error: ERRORS.chargeFailed.id,
                        schema: FIXTURES.schema.id,
                        status: undefined,
                    })
                },
            ], done))
            store.dispatch(actions.checkout('001'))
        })

        it('should handle a charge success', function (done) {
            Flatmarket.create.restore()
            var createChargeStub
            var clientCreateStub = sinon.stub(Flatmarket, 'create', function () {
                var mockClientApi = {
                    createCharge: _.noop,
                }
                createChargeStub = sinon.stub(mockClientApi, 'createCharge', function () {
                    return Bluebird.resolve()
                })
                return mockClientApi
            })
            store.subscribe(getSubscribeHandler([
                function () {
                    stripeStubCallbacks.token(RESPONSES.token.id, RESPONSES.addresses.id)
                },
                function () {
                    expect(store.getState().get('charge').toJS()).to.deep.equal({
                        email: 'test@email.com',
                        sku: '001',
                        token: 'tok_just_a_token',
                    })
                },
                function () {
                    expect(clientCreateStub).to.have.been.calledOnce
                    expect(clientCreateStub).to.have.been.calledWith({
                        host: 'foo.com',
                        pathname: undefined,
                    })
                    expect(createChargeStub).to.have.been.calledOnce
                    expect(store.getState().get('charge')).to.be.undefined
                },
            ], done))
            store.dispatch(actions.checkout('001'))
        })

        it('should handle a charge with shipping address', function (done) {
            store.subscribe(getSubscribeHandler([
                function () {
                    store.dispatch(actions.checkout('001'))
                },
                function () {
                    stripeStubCallbacks.token(RESPONSES.token.id, RESPONSES.addresses.id)
                },
                function () {
                    expect(store.getState().get('charge').toJS()).to.deep.equal({
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
                        token: 'tok_just_a_token',
                    })
                },
                _.noop,
            ], done))
            var schema = _.cloneDeep(FIXTURES.schema.id)
            store.dispatch(actions.reset(_.extend(schema, {
                stripe: {
                    billingAddress: true,
                    publishableKey: 'just_a_fake_key',
                    shippingAddress: true,
                },
            })))
        })

    })

})
