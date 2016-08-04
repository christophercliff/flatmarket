var _ = require('lodash')
var testConfig = require('./webpack.config.test')

module.exports = _.merge(testConfig, {
    devtool: undefined,
    module: {
        postLoaders: [
            {
                test: [
                    /.*.js$/,
                ],
                include: [
                    /\/flatmarket-client\//,
                ],
                exclude: [
                    /\/node_modules\//,
                    /\/__test__\//,
                ],
                loader: 'istanbul-instrumenter',
            },
        ],
    },
})
