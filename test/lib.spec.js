var lib = require('../')
var path = require('path')

describe('lib', function () {

    this.timeout(20e3)

    it('should do a basic build', function (done) {
        var options = {
            destination: path.resolve(__dirname, './fixtures/basic/build/'),
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
