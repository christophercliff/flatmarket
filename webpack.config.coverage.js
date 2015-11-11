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
                exclude: [
                    /\/node_modules\//,
                    /\/test\//,
                    /lib\/env.js$/,
                ],
                loader: 'istanbul-instrumenter',
            },
        ],
    },
})
