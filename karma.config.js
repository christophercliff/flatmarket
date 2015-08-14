var webpackConfig = require('./webpack.config.test')

module.exports = function (config) {
    config.set({
        browsers: [
            'Chrome'
        ],
        client: {
            mocha: {
                reporter: 'html',
            },
        },
        colors: true,
        coverageReporter: {
            reporters: [
                {
                    type: 'text',
                },
                {
                    dir: './coverage/',
                    subdir: './',
                    type: 'json',
                },
            ],
        },
        files: [
          './test/index.js',
        ],
        frameworks: [
            'mocha',
            'sinon',
        ],
        logLevel: config.LOG_INFO,
        plugins: [
            'karma-chai',
            'karma-chrome-launcher',
            'karma-coverage',
            'karma-mocha',
            'karma-sinon',
            'karma-sourcemap-loader',
            'karma-webpack',
        ],
        port: 9876,
        preprocessors: {
            './test/index.js': [
                'webpack',
                'sourcemap',
            ],
        },
        reporters: [
            'progress',
            'coverage',
        ],
        singleRun: true,
        webpack: webpackConfig,
        webpackMiddleware: {
            noInfo: true,
        },
    })
}
