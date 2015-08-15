var actions = require('../lib/actions')
var Controller = require('../lib/components/controller.jsx')
var createStore = require('../lib/create-store')
var expect = require('chai').expect
var React = require('react')
var reducer = require('../lib/reducer')
var TestUtils = require('react/addons').addons.TestUtils

var Component = React.createClass({
    displayName: 'Component',
    render: function () {
        return React.createElement('div')
    },
})

describe('Controller', function () {

    it('should bind the state to the child Component', function () {
        var store = createStore(reducer)
        var controllerEl = React.createElement(Controller, {
            actions: actions,
            Component: Component,
            store: store,
        })
        var controller = TestUtils.renderIntoDocument(controllerEl)
        var component = TestUtils.findRenderedComponentWithType(controller, Component)
        expect(component.props.checkout).to.be.a('function')
        expect(component.props.reset).to.be.a('function')
        expect(component.props).to.include.key('charge')
        expect(component.props).to.include.key('error')
        expect(component.props).to.include.key('schema')
        expect(component.props).to.include.key('status')
    })

})
