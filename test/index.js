var expect = require('chai').expect
var Joi = require('joi')
var schema = require('../')

describe('schema', function () {

    it('should validate required', function () {
        Joi.assert({
            info: {
                name: 'test',
            },
            products: {
                product_1: {
                    amount: 1,
                },
            },
            server: {
                host: 'mysite.com',
            },
            stripe: {
                publishableKey: 'just_a_fake_key',
            },
        }, schema)
    })

    it('should validate product-level Stripe overrides', function () {
        Joi.assert({
            info: {
                name: 'test',
            },
            products: {
                product_1: {
                    amount: 1,
                    billingAddress: true,
                },
            },
            server: {
                host: 'mysite.com',
            },
            stripe: {
                publishableKey: 'just_a_fake_key',
            },
        }, schema)
    })

    it('should validate custom fields', function () {
        Joi.assert({
            info: {
                name: 'Just a Test Store',
                description: 'Just a description.',
                'x-whatever': { hello: 'World!' },
            },
            products: {
                product_1: {
                    amount: 1,
                    'x-whatever': { hello: 'World!' },
                },
            },
            server: {
                host: 'mysite.com',
            },
            stripe: {
                publishableKey: 'just_a_fake_key',
            },
        }, schema)
    })

    it('should expose isValid', function () {
        expect(schema.isValid({
            info: {
                name: 'test',
            },
            products: {
                product_1: {
                    amount: 1,
                },
            },
            server: {
                host: 'mysite.com',
            },
            stripe: {
                publishableKey: 'just_a_fake_key',
            },
        })).to.be.true
    })

    it('should allow shippingAddress', function () {
        Joi.assert({
            info: {
                name: 'test',
            },
            products: {
                product_1: {
                    amount: 1,
                },
            },
            server: {
                host: 'mysite.com',
            },
            stripe: {
                billingAddress: true,
                publishableKey: 'just_a_fake_key',
                shippingAddress: true,
            },
        }, schema)
    })

    it('should throw if has shippingAddress but not billingAddress', function () {
        expect(function () {
            Joi.assert({
                info: {
                    name: 'test',
                },
                products: {
                    product_1: {
                        amount: 1,
                    },
                },
                server: {
                    host: 'mysite.com',
                },
                stripe: {
                    publishableKey: 'just_a_fake_key',
                    shippingAddress: true,
                },
            }, schema)
        }).to.throw()
    })

})
