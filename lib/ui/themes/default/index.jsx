/* eslint global-require: 0 */
/* eslint no-process-env: 0 */
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
        var name = this.props.schema.getIn([
            'info',
            'name',
        ])
        var description = this.props.schema.getIn([
            'info',
            'description',
        ])
        return (
            <div className="container">
                <header>
                    <h1>{name}</h1>
                    {!_.isEmpty(description) && <p>{description}</p>}
                </header>
                <main>
                    {this.props.schema.get('products').map(function (product, id) {
                        return (
                            <section key={id}>
                                <img src={product.getIn([
                                    'images',
                                    0,
                                ])} />
                                <a
                                    className={classnames({
                                        disabled: !canCreateCharge,
                                        charging: isCharging,
                                    })}
                                    href="#"
                                    onClick={_.bind(this.handleClick, this, id)}
                                >
                                    <div>{product.get('name')} / {product.get('description')}</div>
                                    <div className="cta">Buy now ${product.get('amount') / 100}</div>
                                </a>
                            </section>
                        )
                    }, this).toList()}
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
