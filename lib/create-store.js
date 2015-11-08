var _ = require('lodash')
var logger = require('redux-logger')
var redux = require('redux')
var thunk = require('redux-thunk')

var middleware = _.compact([
    thunk,
    (process.env.NODE_ENV === 'development') ? logger({ transformer: transformer }) : undefined,
])

module.exports = redux.applyMiddleware.apply(redux, middleware)(redux.createStore)

function transformer(state) {
    return state.toJS()
}
