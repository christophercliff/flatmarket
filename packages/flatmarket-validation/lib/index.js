var chargeSchema = require('./charge-schema.json')
var createValidationFn = require('is-my-json-valid')

module.exports = {
    charge: create(require('./charge-schema.json')),
}

function create(schema) {
    return function (obj) {
        var fn = createValidationFn(schema)
        fn(obj, { verbose: true })
        return fn.errors || undefined
    }
}
