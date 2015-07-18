var reducer = require('./reducer')
var redux = require('redux')
var thunk = require('redux-thunk')

var createStore = redux.applyMiddleware(thunk)(redux.createStore)

module.exports = createStore(reducer, reducer.getInitialState())
