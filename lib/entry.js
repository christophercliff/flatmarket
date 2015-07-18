var actions = require('./actions')
var Controller = require('./components/controller.jsx')
var React = require('react')
var store = require('./store')

exports.init = init

function init(data) {
    store.dispatch(actions.reset(data))
    store.dispatch(actions.updateStatus())
    var el = React.createElement(Controller, {
        store: store,
    })
    React.render(el, document.getElementById('root'))
}
