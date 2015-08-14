var path = require('path')
var webpack = require('webpack')

module.exports = {
    context: path.resolve(__dirname, './lib/entries/'),
    devtool: 'eval',
    module: {
        loaders: [
            {
                test: require.resolve('react'),
                loader: 'expose?React',
            },
            {
                test: /\.json$/,
                loader: 'json',
            },
            {
                test: /\.jsx$/,
                loader: 'jsx-loader',
            },
        ],
        postLoaders: [
            {
                test: [
                    /.*.js$/,
                    /.*.jsx$/,
                ],
                exclude: [
                    /\/node_modules\//,
                    /\/test\//,
                ],
                loader: 'istanbul-instrumenter',
            },
        ],
    },
    node: {
        dns: 'empty',
        net: 'empty',
    },
    resolve: {
        root: path.resolve(__dirname, './'),
    },
}
