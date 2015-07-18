var _ = require('lodash')
var BPromise = require('bluebird')
var fs = require('fs-extra')
var Joi = require('joi')
var path = require('path')
var schema = require('flatmarket-schema')
var Watchpack = require('watchpack')

var LAYOUT_PATH = path.resolve(__dirname, './templates/layout.html')

exports.watch = watch

function buildLayout(options) {
    var data = JSON.parse(fs.readFileSync(options.schema, 'utf8'))
    Joi.assert(data, schema)
    data.server.host = '127.0.0.1:8001'
    var template = _.template(fs.readFileSync(LAYOUT_PATH, 'utf8'))
    var html = template({
        cssPath: undefined,
        data: JSON.stringify(data),
        jsPath: 'https://127.0.0.1:8002/app.js',
        markup: undefined,// (false) ? React.renderToString(React.createElement(Controller, data)) : undefined,
        title: 'flatmarket',
    })
    fs.ensureDirSync(options.destination)
    fs.emptyDirSync(options.destination)
    fs.copySync(options.source, options.destination)
    fs.writeFileSync(path.resolve(options.destination, './index.html'), html)
    return BPromise.resolve()
}

function watch(options) {
    var watchpack = new Watchpack()
    var files = [
        path.resolve(__dirname, './entry'),
        path.resolve(options.schema),
        path.resolve(options.source),
    ]
    var dirs = [
        path.resolve(__dirname, './components/'),
        path.resolve(__dirname, './templates/'),
    ]
    watchpack.on('aggregated', function () {
        buildLayout(options)
    })
    watchpack.watch(files, dirs)
    return buildLayout(options)
}
