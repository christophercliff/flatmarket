var fs = require('fs-extra')
var lib = require('../')
var path = require('path')

var DESTINATION = path.resolve(__dirname, './fixtures/basic/build/')

describe('lib', function () {

    this.timeout(20e3)

    afterEach(function () {
        fs.removeSync(DESTINATION)
    })

    it('should do a basic build', function (done) {
        var options = {
            destination: DESTINATION,
            schema: path.resolve(__dirname, './fixtures/basic/src/flatmarket.json'),
            source: path.resolve(__dirname, './fixtures/basic/src/'),
        }
        lib.build(options)
            .then(function () {
                return done()
            })
            .caught(done)
    })

})
