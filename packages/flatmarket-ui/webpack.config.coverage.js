var _ = require('lodash')
var testConfig = require('./webpack.config.test')

module.exports = _.merge(testConfig, {
    devtool: undefined,
    module: {
        postLoaders: [
            {
                test: [
                    /.*.js$/,
                    /.*.jsx$/,
                ],
                include: [
                    /\/flatmarket-ui\//,
                ],
                exclude: [
                    /\/node_modules\//,
                    /\/__test__\//,
                    /\/env.js$/,
                ],
                loader: 'istanbul-instrumenter',
            },
        ],
    },
})
