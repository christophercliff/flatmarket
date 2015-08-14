var _ = require('lodash')
var classnames = require('classnames')
var React = require('react')

if (process.env.PLATFORM === 'browser') require('./index.less')

module.exports = React.createClass({

    displayName: 'Index',
    propTypes: {
        charge: React.PropTypes.object,
        checkout: React.PropTypes.func,
        error: React.PropTypes.string,
        schema: React.PropTypes.object,
        status: React.PropTypes.string,
    },

    handleClick: function (id, e) {
        e.preventDefault()
        this.props.checkout(id)
    },

    render: function () {
        var canCreateCharge = !this.props.charge && !this.props.error
        var isCharging = !!this.props.charge
        return (
            <div className="container">
                <header>
                    <h1>{this.props.schema.info.name}</h1>
                    {(!_.isEmpty(this.props.schema.info.description)) && <p>{this.props.schema.info.description}</p>}
                </header>
                <main>
                    {_.map(this.props.schema.products, function (product, id) {
                        return (
                            <section key={id}>
                                {(!_.isEmpty(product.images)) && <img src={_.first(product.images)} />}
                                <a
                                    className={classnames({
                                        disabled: !canCreateCharge,
                                        charging: isCharging,
                                    })}
                                    href="#"
                                    onClick={_.bind(this.handleClick, this, id)}
                                >
                                    <div>{product.name} / {product.description}</div>
                                    <div className="cta">Buy now ${product.amount/100}</div>
                                </a>
                            </section>
                        )
                    }, this)}
                </main>
                <footer>
                    <p>This website created by <a href="https://json.expert/flatmarket/">Flatmarket</a>.</p>
                </footer>
                {(this.props.error) && (
                    <aside>
                        <div className="container">
                            <header>
                                <p>Oops, an error occurred.</p>
                            </header>
                        </div>
                    </aside>
                )}
            </div>
        )
    },

})
