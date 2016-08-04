var _ = require('lodash')
var BPromise = require('bluebird')
var Wreck = require('wreck')

exports.get = get
exports.post = post

function get(uri, options) {
    options = _.extend({ json: true }, options)
    return new BPromise(function (resolve, reject) {
        Wreck.get(uri, options, function (err, res, payload) {
            if (err) return reject(err)
            return resolve([
                res,
                payload,
            ])
        })
    })
}

function post(uri, options) {
    options = _.extend({ json: true }, options)
    return new BPromise(function (resolve, reject) {
        Wreck.post(uri, options, function (err, res, payload) {
            if (err) return reject(err)
            return resolve([
                res,
                payload,
            ])
        })
    })
}
