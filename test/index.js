var Joi = require('joi')
var schema = require('../')

describe('schema', function () {

    describe('isValid()', function () {

        it('should validate', function () {
            Joi.assert({
                products: {
                    p1: {
                        amount: 123,
                        description: 'Just a product',
                        metadata: {
                            foo: 'Just some metadata',
                        },
                        'x-foo': 'Just a custom field',
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

    })

})
