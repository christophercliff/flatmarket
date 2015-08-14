var actions = require('./actions')
var Controller = require('./components/controller.jsx')
var Component = require('__component__')
var React = require('react')
var store = require('./store')

exports.init = init

function init(data) {
    store.dispatch(actions.reset(data))
    var el = React.createElement(Controller, {
        actions: actions,
        Component: Component,
        store: store,
    })
    React.render(el, document.getElementById('root'))
}
