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
                exclude: [
                    /\/node_modules\//,
                    /\/test\//,
                ],
                loader: 'istanbul-instrumenter',
            },
        ],
    },
})
