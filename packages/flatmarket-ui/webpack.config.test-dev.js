var _ = require('lodash')
var testConfig = require('./webpack.config.test')
var webpack = require('webpack')

module.exports = _.merge(testConfig, {
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('development'),
            },
        }),
    ],
})
