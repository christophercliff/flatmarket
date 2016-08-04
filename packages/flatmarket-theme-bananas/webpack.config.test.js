var webpack = require('webpack')

module.exports = {
    context: __dirname,
    devtool: 'eval',
    entry: {
        app: './__test__/entry.js',
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
                loader: 'jsx-loader',
            },
            {
                test: /\.less$/,
                loader: 'style!css!less',
            },
            {
                test: /\.woff$/,
                loader: 'url-loader?limit=100000',
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
                NODE_ENV: JSON.stringify('test'),
            },
        }),
    ],
}
