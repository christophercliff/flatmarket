var _ = require('lodash')
var env = require('./env')
var redux = require('redux')
var thunk = require('redux-thunk')

var middleware = _.compact([
    thunk,
].concat(env.getMiddleware()))

module.exports = redux.applyMiddleware.apply(redux, middleware)(redux.createStore)
