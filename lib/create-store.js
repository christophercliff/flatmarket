var redux = require('redux')
var thunk = require('redux-thunk')

module.exports = redux.applyMiddleware(thunk)(redux.createStore)
