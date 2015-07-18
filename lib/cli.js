/*eslint no-process-exit:0 */

var _ = require('lodash')
var commander = require('commander')
var lib = require('./')

commander
    .command('up [schema]')
    .description('Starts the development server')
    .option('--destination [dir]', 'the build directory')
    .option('--source [dir]', 'the source directory')
    .option('--stripe-secret-key [key]', 'the Stripe secret key passed to the local server')
    .action(up)

commander.parse(process.argv)

function up(schema, options) {
    lib.up(normalize(schema, options)).caught(function (err) {
        console.error(err.stack)
        process.exit(1)
    })
}

function normalize(schema, options) {
    return _.chain(options)
        .pick('source', 'stripeSecretKey')
        .extend({
            schema: schema,
        })
        .value()
}
