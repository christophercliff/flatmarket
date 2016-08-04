# flatmarket-service

The core [Flatmarket](/christophercliff/flatmarket) service.

## Installation

```sh
npm install flatmarket-service
```

## Usage

```js
var handleRequest = require('flatmarket-service')(yourStripeSecretKey, yourSchemaUri)

handleRequest(payload).then(function (res) {})
```

#### `createHandler()`

##### `createHandler(stripeSecretKey: string, schemaUri: string): (payload: object) => Promise`

The shape of the `payload` object is specified in [lib/validate](/christophercliff/flatmarket/tree/master/packages/flatmarket-service/blob/master/lib/validate.js).

## License

See [LICENSE](/christophercliff/flatmarket/blob/master/LICENSE.md).
