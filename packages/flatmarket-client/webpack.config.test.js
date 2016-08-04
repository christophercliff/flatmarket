var webpack = require('webpack')

module.exports = {
    context: __dirname,
    devtool: 'eval',
    entry: {
        index: './__test__/entry',
    },
    module: {
        loaders: [
            {
                test: /\.json$/,
                loader: 'json',
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
