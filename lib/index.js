var _ = require('lodash')
var Boom = require('boom')
var BPromise = require('bluebird')
var Joi = require('joi')
var reqwest = require('reqwest')
var url = require('url')
var validations = require('hapi-flatmarket/lib/validations')

var OPTIONS_SCHEMA = Joi.object().keys({
    host: Joi.string().required(),
    pathname: Joi.string().default('/'),
}).required()
var PROTOCOL = 'https'
var METHODS = {
    get: {
        id: 'get',
    },
    post: {
        id: 'post',
    },
}

module.exports = Client

function Client(options) {
    var validation = Joi.validate(options, OPTIONS_SCHEMA)
    if (validation.error) throw validation.error
    this.uri = url.format({
        host: validation.value.host,
        protocol: PROTOCOL,
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
        Joi.assert(data, validations.createCharge)
        return request({
            data: data,
            method: METHODS.post.id,
            url: this.uri,
        })
    },

    getStatus: function () {
        return request({
            method: METHODS.get.id,
            url: this.uri,
        })
    },

})

function request(options) {
    return new BPromise(function (resolve, reject) {
        reqwest(_.extend(options, {
            crossOrigin: true,
            error: function (xhr) {
                try {
                    return reject(Boom.create(xhr.status, JSON.parse(xhr.response).error))
                } catch (ex) {
                    return reject(Boom.create(400, 'Bad Request'))
                }
            },
            success: resolve,
        }))
    })
}
