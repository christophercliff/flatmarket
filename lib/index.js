var _ = require('lodash')
var BPromise = require('bluebird')
var builder = require('./builder')
var fs = require('fs')
var Hapi = require('hapi')
var Joi = require('joi')
var path = require('path')
var startFlatmarketServer = require('flatmarket-server').startServer
var WebpackDevServer = require('webpack-dev-server')
var webpack = require('webpack')

var UP_SCHEMA = Joi.object().keys({
    destination: Joi.string().default('./build/'),
    schema: Joi.string().required(),
    source: Joi.string().default('./src/'),
    stripeSecretKey: Joi.string().token(),
}).required()
var DESTINATION_PATH = path.resolve(process.cwd(), './build/')
var COMPILER_OPTIONS = {
    context: path.resolve(__dirname, './'),
    devtool: 'source-map',
    entry: {
        app: './entry',
    },
    module: {
        loaders: [
            {
                test: require.resolve('react'),
                loader: 'expose?React',
            },
            {
                test: /\.json$/,
                loader: 'json',
            },
            {
                test: /\.jsx$/,
                loader: 'jsx-loader',
            },
        ],
    },
    node: {
        dns: 'empty',
        net: 'empty',
    },
    output: {
        filename: '[name].js',
        library: 'app',
        libraryTarget: 'var',
    },
    resolve: {
        root: path.resolve(__dirname, './'),
    },
}

exports.up = up

function normalize(options) {
    return _.mapValues(options, function (val, key) {
        if (_.contains([
            'destination',
            'schema',
            'source',
        ], key)) return path.resolve(process.cwd(), val)
        return val
    })
}

function up(options) {
    var validation = Joi.validate(options, UP_SCHEMA)
    if (validation.error) throw new Error(validation.error)
    options = normalize(validation.value)
    return builder.watch(options)
        .then(function () {
            return BPromise.all([
                startFlatmarketServer({
                    port: 8001,
                    schemaUri: 'https://127.0.0.1:8000/flatmarket.json',
                    stripeSecretKey: options.stripeSecretKey,
                    tls: {
                        ca: fs.readFileSync(path.resolve(__dirname, '../ssl/ca.crt')),
                        cert: fs.readFileSync(path.resolve(__dirname, '../ssl/server.crt')),
                        key: fs.readFileSync(path.resolve(__dirname, '../ssl/server.key')),
                        rejectUnauthorized: false,
                        requestCert: true,
                    },
                }),
                startStaticServer(),
                startWebpackServer(),
            ])
        })
}

function startStaticServer() {
    var server = new Hapi.Server()
    server.connection({
        port: 8000,
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
                path: DESTINATION_PATH,
            },
        },
    })
    return new BPromise(function (resolve, reject) {
        server.start(function (err) {
            if (err) return reject(err)
            console.log('Server listening at https://127.0.0.1:8000')
            return resolve()
        })
    })
}

function startWebpackServer() {
    return new BPromise(function (resolve, reject) {
        var compiler = webpack(_.merge(COMPILER_OPTIONS, {
            output: {
                path: DESTINATION_PATH,
            },
        }))
        var server = new WebpackDevServer(compiler, {
            https: true,
        })
        server.listen(8002, function (err) {
            if (err) return reject(err)
            return resolve()
        })
    })
}
