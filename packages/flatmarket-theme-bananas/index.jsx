var _ = require('lodash')
var PropTypes = require('react').PropTypes
var React = require('react')
var requireBrowserStyle = require('./env').requireBrowserStyle
var util = require('util')

var ERRORS = require('flatmarket-ui').errors
var DEFAULT_ERROR_MESSAGE = 'There was an error with your transaction. Reload the page and try again.'
var ERROR_MESSAGE_MAP = _.object([
    [ERRORS.invalidSchema.id, 'The page was unable to load because the schema is invalid.'],
])

requireBrowserStyle()

module.exports = React.createClass({

    displayName: 'FlatmarketThemeBananas',
    propTypes: {
        charge: PropTypes.object,
        checkout: PropTypes.func.isRequired,
        error: PropTypes.string,
        schema: PropTypes.object,
    },

    componentWillReceiveProps: function (next) {
        if (next.error && this.props.charge) this.setState({ errorSku: this.props.charge.get('sku') })
    },

    handleClick: function (id, e) {
        e.preventDefault()
        this.props.checkout(id)
    },

    render: function () {
        return (
            <div className="container">
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                {(function () {
                    if (!this.props.schema) return (<div/>)
                    var name = this.props.schema.getIn([
                        'info',
                        'name',
                    ])
                    var description = this.props.schema.getIn([
                        'info',
                        'description',
                    ])
                    return (
                        <div>
                            <header>
                                <h1>{name}</h1>
                                {!_.isEmpty(description) && <p>{description}</p>}
                            </header>
                            <main>
                                {this.props.schema.get('products').map(function (product, id) {
                                    var statusClassName
                                    if (!_.isEmpty(this.props.error) && id === _.get(this.state, 'errorSku')) {
                                        statusClassName = 'error'
                                    } else if (this.props.charge && id === this.props.charge.get('sku')) {
                                        if (!_.isEmpty(this.props.charge.get('token'))) {
                                            statusClassName = 'success'
                                        } else {
                                            statusClassName = 'checkout'
                                        }
                                    }
                                    var image = (product.has('images'))
                                        ? product.get('images').first()
                                        : undefined
                                    return (
                                        <section
                                            className={statusClassName}
                                            key={id}
                                            onClick={_.bind(this.handleClick, this, id)}
                                        >
                                            {(!_.isEmpty(image)) && (
                                                <div className="image" style={{
                                                    backgroundImage: util.format('url(%s)', image),
                                                }} />
                                            )}
                                            <div className="action">
                                                <div className="aligner">
                                                    <div className="name">{product.get('name')}</div>
                                                    <div className="description">{product.get('description')}</div>
                                                </div>
                                            </div>
                                            <div className="price">${product.get('amount') / 100}</div>
                                            <div className="status status-checkout"><i className="material-icons">shopping_cart</i></div>
                                            <div className="status status-success"><i className="material-icons">check_circle</i></div>
                                            <div className="status status-error"><i className="material-icons">error</i></div>
                                        </section>
                                    )
                                }, this).toList()}
                            </main>
                            <footer>
                                <p><a href="https://github.com/christophercliff/flatmarket">Get Flatmarket</a></p>
                            </footer>
                        </div>
                    )
                }.bind(this))()}
                {(!_.isEmpty(this.props.error) && !document.body.setAttribute('style', 'overflow:hidden;')) && (
                    <aside>
                        <div className="container">
                            <i className="material-icons icon-48">error</i>
                            <p>{ERROR_MESSAGE_MAP[this.props.error] || DEFAULT_ERROR_MESSAGE}</p>
                        </div>
                    </aside>
                )}
            </div>
        )
    },

})
