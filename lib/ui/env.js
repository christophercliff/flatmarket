/* eslint no-process-env: 0 */
var logger = require('redux-logger')

exports.getMiddleware = getMiddleware

function getMiddleware() {
    return [
        (process.env.NODE_ENV === 'development') ? logger({ stateTransformer: stateTransformer }) : undefined,
    ]
}

function stateTransformer(state) {
    return state.toJS()
}
