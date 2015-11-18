var path = require('path')
var webpack = require('webpack')

module.exports = {
    context: path.resolve(__dirname, './test/'),
    devtool: 'eval',
    entry: {
        index: './index',
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
    resolve: {
        root: path.resolve(__dirname, './'),
    },
}
