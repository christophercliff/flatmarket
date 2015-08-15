var _ = require('lodash')
var assert = require('assert')
var React = require('react')
var Immutable = require('immutable')
var Redux = require('redux')

module.exports = React.createClass({

    displayName: 'Controller',
    propTypes: {
        actions: React.PropTypes.objectOf(React.PropTypes.func.isRequired).isRequired,
        Component: React.PropTypes.func.isRequired,
        store: React.PropTypes.shape({
            dispatch: React.PropTypes.func.isRequired,
            getState: React.PropTypes.func.isRequired,
            subscribe: React.PropTypes.func.isRequired,
        }).isRequired,
    },

    componentWillMount: function () {
        this._unsubscribe = this.props.store.subscribe(_.bind(function () {
            this.setState({
                store: this.props.store.getState(),
            })
        }, this))
    },

    componentWillUnmount: function () {
        this._unsubscribe()
    },

    getInitialState: function () {
        return {
            store: this.props.store.getState(),
            actions: Redux.bindActionCreators(this.props.actions, this.props.store.dispatch),
        }
    },

    shouldComponentUpdate: function (nextProps, nextState) {
        return !Immutable.is(this.state.store, nextState.store)
    },

    render: function () {
        var actions = _.pick.apply(_, [this.state.actions].concat([
            'checkout',
            'reset',
        ]))
        var state = _.pick.apply(_, [this.state.store.toJS()].concat([
            'charge',
            'error',
            'schema',
            'status',
        ]))
        return React.cloneElement(React.createElement(this.props.Component), _.extend(state, actions))
    },

})
