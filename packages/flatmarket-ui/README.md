# flatmarket-ui

The Redux implementation for [Flatmarket](/christophercliff/flatmarket).

## Installation

```sh
npm install flatmarket-ui flatmarket-theme-bananas
```

## Usage

```js
var actions = require('flatmarket-ui').actions
var Bananas = require('flatmarket-theme-bananas')
var connect = require('flatmarket-ui').connect
var createElement = require('react').createElement
var Provider = require('react-redux').Provider
var render = require('react-dom').render
var store = require('flatmarket-ui').store

store.dispatch(actions.reset(YOUR_DATA))
render(createElement(Provider, { store: store }, createElement(connect(Bananas))), htmlElement)
```

## License

See [LICENSE](LICENSE.md).
