var path = require('path')
var webpack = require('webpack')

module.exports = {
    context: __dirname,
    devtool: 'eval',
    entry: {
        app: './test/entry.js',
    },
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
                loader: 'jsx',
            },
        ],
    },
    node: {
        dns: 'empty',
        net: 'empty',
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('development'),
            },
        }),
    ],
    resolve: {
        alias: {
            __component__: path.resolve(__dirname, './test/fixtures/component.jsx'),
        },
    },
}
