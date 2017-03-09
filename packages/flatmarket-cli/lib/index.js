/* eslint global-require: 0 */
var _ = require('lodash')
var Bluebird = require('bluebird')
var fs = require('fs-extra')
var Hapi = require('hapi')
var Joi = require('joi')
var path = require('path')
var schema = require('flatmarket-schema')
var startFlatmarketServer = require('flatmarket-server').startServer
var url = require('url')
var Watchpack = require('watchpack')
var WebpackDevServer = require('webpack-dev-server')
var webpack = require('webpack')
var webpackConfigDev = require('../webpack.config.dev')
var webpackConfigProd = require('../webpack.config.prod')

var OPTIONS_SCHEMA = Joi.object().keys({
    component: Joi.string().default(path.resolve(__dirname, '../node_modules/flatmarket-theme-bananas/')),
    destination: Joi.string().default(path.resolve(process.cwd(), './build/')),
    dev: Joi.any().when('preview', {
        is: true,
        then: Joi.forbidden(),
        otherwise: Joi.boolean(),
    }).default(false),
    preview: Joi.boolean().default(false),
    schema: Joi.string().default(path.resolve(process.cwd(), './src/flatmarket.json')),
    source: Joi.string().default(path.resolve(process.cwd(), './src/')),
    stripeSecretKey: Joi.string().token(),
    template: Joi.string().default(path.resolve(__dirname, '../templates/layout.html')),
    output: Joi.string().default('./index.html')
}).required()
var PROTOCOL = 'https'
var HOSTNAME = '127.0.0.1'
var STATIC_SERVER_PORT = 8000
var FLATMARKET_SERVER_PORT = 8001
var WEBPACK_SERVER_PORT = 8002
var CSS_PATHNAME = 'app.css'
var JS_PATHNAME = 'app.js'
var JS_URI = url.format({
    hostname: HOSTNAME,
    pathname: JS_PATHNAME,
    port: WEBPACK_SERVER_PORT,
    protocol: PROTOCOL,
})

module.exports = function (options) {
    var validation = Joi.validate(options, OPTIONS_SCHEMA)
    if (validation.error) return Bluebird.reject(new Bluebird.OperationalError(validation.error))
    options = validation.value
    var schemaUri = url.format({
        hostname: HOSTNAME,
        pathname: '/' + path.relative(options.source, options.schema),
        port: STATIC_SERVER_PORT,
        protocol: PROTOCOL,
    })
    var flatmarketServerConfig = {
        port: FLATMARKET_SERVER_PORT,
        schemaUri: schemaUri,
        stripeSecretKey: options.stripeSecretKey,
        tls: {
            ca: fs.readFileSync(path.resolve(__dirname, '../ssl/ca.crt')),
            cert: fs.readFileSync(path.resolve(__dirname, '../ssl/server.crt')),
            key: fs.readFileSync(path.resolve(__dirname, '../ssl/server.key')),
            rejectUnauthorized: false,
            requestCert: true,
        },
    }
    if (options.dev) {
        return Bluebird.resolve()
            .then(buildLayout.bind(undefined, options))
            .then(watchLayout.bind(undefined, options))
            .then(function () {
                return Bluebird.all([
                    startFlatmarketServer(flatmarketServerConfig),
                    startStaticServer(options),
                    startWebpackServer(options),
                ])
            })
    }
    if (options.preview) {
        return Bluebird.resolve()
            .then(buildLayout.bind(undefined, options))
            .then(buildApp.bind(undefined, options))
            .then(function () {
                return Bluebird.all([
                    startStaticServer(options),
                ])
            })
    }
    return Bluebird.resolve()
        .then(buildLayout.bind(undefined, options))
        .then(buildApp.bind(undefined, options))
}

function buildApp(options) {
    return new Bluebird(function (resolve, reject) {
        var compiler = getCompiler(options)
        compiler.run(function (err, stats) {
            if (err) return reject(err)
            if (stats.hasErrors()) return reject(new Bluebird.OperationalError(stats.toJson().errors))
            return resolve()
        })
    })
}

function buildLayout(options) {
    var data = JSON.parse(fs.readFileSync(options.schema, 'utf8'))
    var validation = Joi.validate(data, schema)
    if (validation.error) return Bluebird.reject(new Bluebird.OperationalError(validation.error))
    var cssPath
    var jsPath
    var markup
    if (options.dev) {
        jsPath = JS_URI
        _.merge(data, {
            server: {
                host: [
                    HOSTNAME,
                    FLATMARKET_SERVER_PORT,
                ].join(':'),
                pathname: '/',
            },
        })
    } else {
        cssPath = CSS_PATHNAME
        jsPath = JS_PATHNAME
        markup = getMarkup(options, data)
    }
    var template = _.template(fs.readFileSync(options.template, 'utf8'))
    var html = template({
        cssPath: cssPath,
        data: JSON.stringify(data),
        jsPath: jsPath,
        markup: markup,
        title: data.info.name,
    })
    fs.ensureDirSync(options.destination)
    fs.emptyDirSync(options.destination)
    fs.copySync(options.source, options.destination)
    fs.writeFileSync(path.resolve(options.destination, options.output), html)
    return Bluebird.resolve()
}

function getCompiler(options) {
    var config = (options.dev) ? webpackConfigDev : webpackConfigProd
    return webpack(_.merge(config, {
        output: {
            path: options.destination,
        },
        resolve: {
            alias: {
                __component__$: options.component,
            },
        },
        resolveLoader: {
            root: path.resolve(__dirname, '../node_modules/'),
        },
    }))
}

function getMarkup(options, data) {
    require('babel-core/register')({
        extensions: [
            '.jsx',
        ],
        ignore: false,
        plugins: [
            path.resolve(__dirname, '../node_modules/babel-plugin-transform-react-jsx'),
        ],
    })
    var actions = require('flatmarket-ui').actions
    var Component = require(options.component)
    var Provider = require('react-redux').Provider
    var React = require('react')
    var ReactDom = require('react-dom/server')
    var connect = require('flatmarket-ui').connect
    var store = require('flatmarket-ui').store
    var provider = React.createElement(Provider, { store: store }, React.createElement(connect(Component)))
    store.dispatch(actions.reset(data))
    return ReactDom.renderToStaticMarkup(provider)
}

function startStaticServer(options) {
    var server = new Hapi.Server()
    server.connection({
        port: STATIC_SERVER_PORT,
        tls: {
            ca: fs.readFileSync(path.resolve(__dirname, '../ssl/ca.crt')),
            cert: fs.readFileSync(path.resolve(__dirname, '../ssl/server.crt')),
            key: fs.readFileSync(path.resolve(__dirname, '../ssl/server.key')),
            rejectUnauthorized: false,
            requestCert: true,
        },
    })
    server.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                path: options.destination,
            },
        },
    })
    return new Bluebird(function (resolve, reject) {
        server.start(function (err) {
            if (err) return reject(err)
            return resolve()
        })
    })
}

function startWebpackServer(options) {
    return new Bluebird(function (resolve, reject) {
        var compiler = getCompiler(options)
        var server = new WebpackDevServer(compiler, {
            https: true,
        })
        server.listen(WEBPACK_SERVER_PORT, function (err) {
            if (err) return reject(err)
            return resolve()
        })
    })
}

function watchLayout(options) {
    var watchpack = new Watchpack()
    var files = [
        path.resolve(options.schema),
    ]
    var dirs = [
        path.resolve(options.source),
    ]
    watchpack.on('aggregated', buildLayout.bind(undefined, options))
    watchpack.watch(files, dirs)
}
