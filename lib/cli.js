/* eslint no-process-exit:0 */
var _ = require('lodash')
var Bluebird = require('bluebird')
var commander = require('commander')
var lib = require('./')
var path = require('path')
var pkg = require('../package.json')

var schema

commander
    .option('-c, --component [file]', 'the Component')
    .option('-d, --destination [dir]', 'the build directory')
    .option('-D, --dev', 'run in dev mode')
    .option('-p, --preview', 'run in preview mode')
    .option('-s, --source [dir]', 'the source directory')
    .option('-S, --stripe-secret-key [key]', 'the Stripe secret key passed to the local server')

commander
    .version(pkg.version)
    .description(pkg.description)
    .arguments('[schema]')
    .action(function (_schema) {
        schema = _schema
    })

commander.parse(process.argv)

Bluebird.resolve()
    .then(function () {
        return lib(normalizeArgs(schema, commander))
    })
    .caught(handleError)

function handleError(err) {
    console.error(err.stack || err)
    process.exit(1)
}

function normalizeArgs(schema, options) {
    var PATH_KEYS = [
        'component',
        'destination',
        'schema',
        'source',
    ]
    return _.chain(options)
        .pick([
            'component',
            'destination',
            'dev',
            'preview',
            'source',
            'stripeSecretKey',
        ])
        .extend({
            schema: schema,
        })
        .mapValues(function (val, key) {
            if (_.isEmpty(val) || !_.contains(PATH_KEYS, key)) return val
            return path.resolve(process.cwd(), val)
        })
        .value()
}
