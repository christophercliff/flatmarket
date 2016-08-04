var expect = require('chai').expect
var startServer = require('../lib/').startServer

describe('the server', function () {

    it('should load the plugin and start', function (done) {
        var options = {
            port: 8000,
            schemaUri: 'https://just-a-test-server.com/flatmarket.json',
            stripeSecretKey: 'just_a_test_key',
        }
        startServer(options)
            .then(function (server) {
                expect(server.lookup('flatmarket-charge')).to.have.property('path', '/')
                expect(server.lookup('flatmarket-status')).to.have.property('path', '/')
                return done()
            })
            .caught(done)
    })

})
