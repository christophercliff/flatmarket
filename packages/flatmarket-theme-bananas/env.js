/* eslint no-process-env: 0 */
/* eslint global-require: 0 */

exports.requireBrowserStyle = requireBrowserStyle

function requireBrowserStyle() {
    if (process.env.PLATFORM === 'browser') require('./index.less')
}
