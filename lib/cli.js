/*eslint no-process-exit:0 */
var _ = require('lodash')
var commander = require('commander')
var lib = require('./')

commander
    .command('build [schema]')
    .description('Starts the development server')
    .option('--destination [dir]', 'the build directory')
    .option('--dev', 'run in dev mode')
    .option('--preview', 'run in preview mode')
    .option('--source [dir]', 'the source directory')
    .option('--stripe-secret-key [key]', 'the Stripe secret key passed to the local server')
    .option('--theme [dir]', 'the theme directory')
    .action(function (schema, options) {
        lib.build(normalize(schema, options)).caught(function (err) {
            console.error(err.stack)
            process.exit(1)
        })
    })

commander.parse(process.argv)

function normalize(schema, options) {
    options = _.pick.apply(_, [options].concat([
        'destination',
        'dev',
        'preview',
        'source',
        'stripeSecretKey',
        'theme',
    ]))
    return _.extend(options, {
        schema: schema,
    })
}
