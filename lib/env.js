/* eslint no-process-env:0 */
var logger = require('redux-logger')

exports.getMiddleware = getMiddleware

function getMiddleware() {
    return [
        (process.env.NODE_ENV === 'development') ? logger({ transformer: transformer }) : undefined,
    ]
}

function transformer(state) {
    return state.toJS()
}
