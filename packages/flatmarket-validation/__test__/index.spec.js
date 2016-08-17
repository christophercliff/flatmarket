var expect = require('chai').expect
var validateCharge = require('../').charge

describe('flatmarket-validation', function () {

    it('should validate simple charge', function () {
        expect(validateCharge({
            email: 'hello@world.com',
            sku: '001',
            token: 'tok_asdf',
        })).to.be.undefined
    })

})
