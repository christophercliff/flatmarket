var path = require('path')

module.exports = {
    context: path.resolve(__dirname, './test/'),
    devtool: 'inline-source-map',
    entry: {
        index: './index',
    },
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
    node: {
        dns: 'empty',
        net: 'empty',
    },
    resolve: {
        root: path.resolve(__dirname, './'),
    },
}
