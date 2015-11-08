var entry = require('../lib/entry')

var SCHEMA = require('./fixtures/flatmarket.json')

describe('entry.init()', function () {

    it('should render', function () {
        entry.init(SCHEMA, document.createElement('div'))
    })

})
