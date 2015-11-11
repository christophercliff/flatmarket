var actions = require('./ui/actions')
var Component = require('__component__')
var connectComponent = require('./ui/connect-component')
var Provider = require('react-redux').Provider
var React = require('react')
var ReactDom = require('react-dom')
var store = require('./store')

exports.init = init

function init(data, el) {
    store.dispatch(actions.reset(data))
    var provider = React.createElement(Provider, { store: store }, React.createElement(connectComponent(Component)))
    return ReactDom.render(provider, el)
}
