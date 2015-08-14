Made possible By [JSON Expert](https://json.expert/), the easiest way to create a web-ready API.

---

# flatmarket-client

[![Build Status](https://circleci.com/gh/christophercliff/flatmarket-client.svg?style=shield)](https://circleci.com/gh/christophercliff/flatmarket-client)
[![codecov.io](http://codecov.io/github/christophercliff/flatmarket-client/coverage.svg?branch=master)](http://codecov.io/github/christophercliff/flatmarket-client?branch=master)

A browser client for [Flatmarket](https://json.expert/flatmarket/).

## Installation

```
npm install flatmarket-client
```

## Usage

```js
var flatmarket = require('flatmarket-client').create({
    host: 'your-flatmarket-server.com',
})
flatmarket.getStatus()
    .then(function (status) {})
    .caught(function (err) {})
```

## API

See [REFERENCE](https://github.com/christophercliff/flatmarket-client/blob/master/REFERENCE.md).

## Contributing

See [CONTRIBUTING](https://github.com/christophercliff/flatmarket/blob/master/CONTRIBUTING.md).

## License

See [LICENSE](https://github.com/christophercliff/flatmarket/blob/master/LICENSE.md).
