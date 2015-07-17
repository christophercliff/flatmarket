[![Build Status](https://travis-ci.org/christophercliff/flatmarket-schema.png?branch=master)](https://travis-ci.org/christophercliff/flatmarket-schema)

# flatmarket-schema

> ***[flatmarket](https://github.com/christophercliff/flatmarket)*** is a free and secure e-commerce platform for static websites.<br />By [JSON Expert](https://json.expert/).

A JSON schema utility for flatmarket.

## Installation

```
npm install flatmarket-schema
```

## Usage

```js
var schema = require('flatmarket-schema')
var validation = schema.validate(yourObj)

validation.value // the result (with defaults populated)
validation.error // the error (`null` if `yourObj` is valid)
```

## Specification

See [SPECIFICATION](https://github.com/christophercliff/flatmarket-schema/blob/master/SPECIFICATION.md)

## Contributing

See [CONTRIBUTING](https://github.com/christophercliff/flatmarket/blob/master/CONTRIBUTING.md).

## License

See [LICENSE](https://github.com/christophercliff/flatmarket/blob/master/LICENSE.md).
