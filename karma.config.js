/* eslint global-require: 0 */
var _ = require('lodash')
var commander = require('commander')
var Joi = require('joi')
var testWebpackConfig = require('./webpack.config.test')

var MODES = {
    coverage: {
        id: 'coverage',
    },
    dev: {
        id: 'dev',
    },
    test: {
        id: 'test',
    },
}
var options = Joi.attempt(_.pick(commander
    .option('--mode [mode]')
    .parse(process.argv), [
        'mode',
    ]), Joi.object().keys({
        mode: Joi.string().valid(_.pluck(MODES, 'id')).default(MODES.test.id),
    }))

module.exports = function (config) {
    var override
    switch (options.mode) {
        case MODES.coverage.id:
            override = {
                coverageReporter: {
                    reporters: [
                        {
                            type: 'text',
                        },
                        {
                            dir: './coverage/',
                            subdir: './json/',
                            type: 'json',
                        },
                        {
                            dir: './coverage/',
                            subdir: './html/',
                            type: 'html',
                        },
                    ],
                },
                reporters: [
                    'coverage',
                ],
                singleRun: true,
                webpack: require('./webpack.config.coverage'),
            }
            break
        case MODES.dev.id:
            override = {
                singleRun: false,
                webpack: require('./webpack.config.test-dev'),
            }
            break
    }
    config.set(_.merge({
        browsers: [
            'Chrome',
        ],
        client: {
            mocha: {
                reporter: 'html',
            },
        },
        colors: true,
        files: [
            './lib/ui/test/entry.js',
        ],
        frameworks: [
            'mocha',
            'sinon',
        ],
        logLevel: config.LOG_INFO,
        plugins: [
            'karma-chai',
            'karma-chrome-launcher',
            'karma-coverage',
            'karma-mocha',
            'karma-sinon',
            'karma-sourcemap-loader',
            'karma-webpack',
        ],
        port: 9876,
        preprocessors: {
            './lib/ui/test/entry.js': [
                'webpack',
                'sourcemap',
            ],
        },
        reporters: [
            'progress',
        ],
        singleRun: true,
        webpack: testWebpackConfig,
        webpackMiddleware: {
            noInfo: true,
        },
    }, override))
}
