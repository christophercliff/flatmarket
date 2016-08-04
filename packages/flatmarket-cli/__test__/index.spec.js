var _ = require('lodash')
var Bluebird = require('bluebird')
var chai = require('chai')
var expect = require('chai').expect
var fs = require('fs-extra')
var lib = require('../')
var mockRequire = require('mock-require')
var path = require('path')
var sinon = require('sinon')
var sinonChai = require('sinon-chai')

var DESTINATION = path.resolve(__dirname, './temp/')
var FIXTURES = {
    indexHtml: { id: fs.readFileSync(path.resolve(__dirname, './fixtures/index.html'), 'utf8') },
}

Bluebird.onPossiblyUnhandledRejection(function (err) {
    throw err
})

chai.config.truncateThreshold = 0
chai.use(sinonChai)

describe('flatmarket-cli', function () {

    this.timeout(20e3)

    var sandbox = sinon.sandbox.create()
    var writeFileSyncSpy
    var options

    beforeEach(function () {
        writeFileSyncSpy = sandbox.spy()
        options = {
            destination: DESTINATION,
            schema: path.resolve(__dirname, './fixtures/schema.json'),
            source: path.resolve(__dirname, './fixtures/'),
        }
        mockRequire('fs-extra', {
            copySync: _.noop,
            emptyDirSync: _.noop,
            ensureDirSync: _.noop,
            readFileSync: fs.readFileSync,
            writeFileSync: writeFileSyncSpy,
        })
        mockRequire('webpack', function () {
            return {
                run: function (callback) {
                    return callback(undefined, {
                        hasErrors: _.noop,
                        toJson: function () {
                            return {}
                        },
                    })
                },
            }
        })
        mockRequire('webpack', function () {
            return {
                run: function (callback) {
                    return callback(undefined, {
                        hasErrors: _.noop,
                        toJson: function () {
                            return {}
                        },
                    })
                },
            }
        })
        mockRequire('flatmarket-server', {
            startServer: function () { return Bluebird.resolve() },
        })
        mockRequire('hapi', {
            Server: function () {
                this.connection = _.noop
                this.route = _.noop
                this.start = function (callback) {
                    return callback()
                }
            },
        })
        mockRequire('webpack-dev-server', function () {
            this.listen = function (port, callback) {
                return callback()
            }
        })
        mockRequire('watchpack', function () {
            this.on = _.noop
            this.watch = _.noop
        })
    })

    afterEach(function () {
        sandbox.restore()
        mockRequire.stopAll()
    })

    it('should error on invalid options', function (done) {
        lib = mockRequire.reRequire('../')
        options = {
            foo: 'foo',
        }
        lib(options)
            .then(function () {
                return done(new Error('success should not have been called'))
            })
            .error(function (err) {
                expect(err).to.be.an.instanceOf(Error)
                return done()
            })
    })

    it('should error on invalid schema', function (done) {
        lib = mockRequire.reRequire('../')
        options = _.extend(options, {
            schema: path.resolve(__dirname, './fixtures/invalid-schema.json'),
        })
        lib(options)
            .then(function () {
                return done(new Error('success should not have been called'))
            })
            .error(function (err) {
                expect(err).to.be.an.instanceOf(Error)
                return done()
            })
    })

    it('should error on unhandled webpack error', function (done) {
        mockRequire('webpack', function () {
            return {
                run: function (callback) {
                    return callback(new Error('unhandled webpack error'))
                },
            }
        })
        lib = mockRequire.reRequire('../')
        lib(options)
            .then(function () {
                return done(new Error('success should not have been called'))
            })
            .error(function (err) {
                expect(err.message).to.equal('unhandled webpack error')
                return done()
            })
    })

    it('should error on handled webpack error', function (done) {
        mockRequire('webpack', function () {
            return {
                run: function (callback) {
                    return callback(undefined, {
                        hasErrors: function () { return true },
                        toJson: function () {
                            return {
                                errors: 'handled webpack error',
                            }
                        },
                    })
                },
            }
        })
        lib = mockRequire.reRequire('../')
        lib(options)
            .then(function () {
                return done(new Error('success should not have been called'))
            })
            .error(function (err) {
                expect(err.message).to.equal('handled webpack error')
                return done()
            })
    })

    it('should do a build', function (done) {
        lib = mockRequire.reRequire('../')
        lib(options)
            .then(function () {
                expect(writeFileSyncSpy).to.have.been.calledOnce
                var args = writeFileSyncSpy.args[0]
                expect(args[0]).to.equal(path.resolve(DESTINATION, './index.html'))
                expect(args[1]).to.equal(FIXTURES.indexHtml.id)
                return done()
            })
    })

    it('should do a preview build', function (done) {
        lib = mockRequire.reRequire('../')
        options = _.extend(options, {
            preview: true,
        })
        lib(options)
            .then(function () {
                return done()
            })
    })

    it('should error on unhandled hapi error', function (done) {
        mockRequire('hapi', {
            Server: function () {
                this.connection = _.noop
                this.route = _.noop
                this.start = function (callback) {
                    return callback(new Error('unhandled hapi error'))
                }
            },
        })
        lib = mockRequire.reRequire('../')
        options = _.extend(options, {
            preview: true,
        })
        lib(options)
            .then(function () {
                return done(new Error('success should not have been called'))
            })
            .error(function (err) {
                expect(err.message).to.equal('unhandled hapi error')
                return done()
            })
    })

    it('should do a dev build', function (done) {
        lib = mockRequire.reRequire('../')
        options = _.extend(options, {
            dev: true,
        })
        lib(options)
            .then(function () {
                return done()
            })
    })

    it('should error on unhandled webpack dev server error', function (done) {
        mockRequire('webpack-dev-server', function () {
            this.listen = function (port, callback) {
                return callback(new Error('unhandled webpack dev server error'))
            }
        })
        lib = mockRequire.reRequire('../')
        options = _.extend(options, {
            dev: true,
        })
        lib(options)
            .then(function () {
                return done(new Error('success should not have been called'))
            })
            .error(function (err) {
                expect(err.message).to.equal('unhandled webpack dev server error')
                return done()
            })
    })

})
