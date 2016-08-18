var _ = require('lodash')
var Bluebird = require('bluebird')
var Boom = require('boom')
var flatmarketValidation = require('flatmarket-validation')
var Joi = require('joi')
var reqwest = require('reqwest')
var url = require('url')

var OPTIONS_SCHEMA = Joi.object().keys({
    host: Joi.string().required(),
    pathname: Joi.string().default('/'),
}).required()

module.exports = Client

function Client(options) {
    var validation = Joi.validate(options, OPTIONS_SCHEMA)
    if (validation.error) throw validation.error
    this.uri = url.format({
        host: validation.value.host,
        protocol: 'https',
        pathname: validation.value.pathname,
    })
}

_.extend(Client, {

    create: function (host) {
        return new Client(host)
    },

})

_.extend(Client.prototype, {

    createCharge: function (data) {
        var validation = flatmarketValidation.createCharge.validate(data)
        if (validation.error) return Bluebird.reject(new Bluebird.OperationalError(validation.error))
        return request(this.uri, data)
    },

})

function request(uri, data) {
    return new Bluebird(function (resolve, reject) {
        reqwest({
            contentType: 'application/json',
            crossOrigin: true,
            data: JSON.stringify(data),
            error: function (xhr) {
                try {
                    return reject(new Bluebird.OperationalError(Boom.create(xhr.status, JSON.parse(xhr.response).error)))
                } catch (ex) {
                    return reject(new Bluebird.OperationalError(Boom.create(400, 'An error occurred')))
                }
            },
            method: 'post',
            success: resolve,
            type: 'json',
            url: uri,
        })
    })
}
