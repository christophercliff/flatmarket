# flatmarket-schema

[![Build Status](https://circleci.com/gh/christophercliff/flatmarket-schema.svg?style=shield)](https://circleci.com/gh/christophercliff/flatmarket-schema)
[![codecov.io](http://codecov.io/github/christophercliff/flatmarket-schema/coverage.svg?branch=master)](http://codecov.io/github/christophercliff/flatmarket-schema?branch=master)

A JSON schema utility for [Flatmarket](https://github.com/christophercliff/flatmarket).

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

See [SPECIFICATION](https://github.com/christophercliff/flatmarket-schema/blob/master/SPECIFICATION.md).

## Contributing

See [CONTRIBUTING](https://github.com/christophercliff/flatmarket/blob/master/CONTRIBUTING.md).

## License

See [LICENSE](https://github.com/christophercliff/flatmarket/blob/master/LICENSE.md).
