var _ = require('lodash')
var actions = require('../actions')
var React = require('react')
var util = require('util')

module.exports = React.createClass({

    displayName: 'Controller',
    propTypes: {
        store: React.PropTypes.object.isRequired,
    },

    handleClick: function (e) {
        e.preventDefault()
        this.props.store.dispatch(actions.checkout(e.target.value))
    },

    componentWillMount: function () {
        this._unsubscribe = this.props.store.subscribe(_.bind(function () {
            this.setState(this.props.store.getState().toJS())
        }, this))
    },

    componentWillUnmount: function () {
        this._unsubscribe()
    },

    getInitialState: function () {
        return this.props.store.getState().toJS()
    },

    render: function () {
        return (
            <div>
                <p>server: <code>{this.state.statusOfServer}</code></p>
                <p>error: <code>{this.state.error}</code></p>
                <p>charge: <code>{JSON.stringify(this.state.charge)}</code></p>
                <h1>flatmarket</h1>
                {_.map(this.state.schema.products, function (product, id) {
                    return (
                        <div key={id}>
                            <h2>{product.name}</h2>
                            <button value={id} onClick={this.handleClick}>Buy it!</button>
                        </div>
                    )
                }, this)}
            </div>
        )
    },

})
