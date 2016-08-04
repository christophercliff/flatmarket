# flatmarket-client

A browser client for [Flatmarket](/christophercliff/flatmarket).

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

## API Reference

- [`Client.create(options)`](#clientcreateoptions)
- [`Client` Instance Methods](#client-instance-methods)
    - [`client.createCharge(options)`](#clientcreatechargeoptions)

### `Client.create(options)`

Creates the client.

```js
var client = Client.create(options)
```

##### **`options`** `Object`

- **`host`** `String`

    The host. *Required*.

- **`pathname`** `String`

    The pathname. Default `'/'`.

### `Client` Instance Methods

#### `client.createCharge(options)`

Creates the charge.

```js
client.createCharge(options)
    .then(function (payload) {})
```

##### **`options`** `Object`

- **`email`** `String`

    The email. *Required*.

- **`metadata`** `Object`

    Metadata about the charge. Default `undefined`.

- **`sku`** `String`

    The SKU. Should correspond to a key in the [Products Object](/christophercliff/flatmarket/tree/master/packages/flatmarket-schema#products-object). *Required*.

- **`token`** `String`

    The Stripe token. *Required*.

## License

See [LICENSE](/christophercliff/flatmarket/blob/master/LICENSE.md).
