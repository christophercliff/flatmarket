var createStore = require('./create-store')
var reducer = require('./reducer')

module.exports = createStore(reducer)
