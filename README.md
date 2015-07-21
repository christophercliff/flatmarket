[![Build Status](https://travis-ci.org/christophercliff/flatmarket-client.png?branch=master)](https://travis-ci.org/christophercliff/flatmarket-client)

# flatmarket-client

> ***[flatmarket](https://github.com/christophercliff/flatmarket)*** is a free and secure e-commerce platform for static websites.<br />By [JSON Expert](https://json.expert/).

A browser client for flatmarket.

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

See [REFERENCE](https://github.com/christophercliff/flatmarket-client/blob/master/REFERENCE.md)

## Contributing

See [CONTRIBUTING](https://github.com/christophercliff/flatmarket/blob/master/CONTRIBUTING.md).

## License

See [LICENSE](https://github.com/christophercliff/flatmarket/blob/master/LICENSE.md).
