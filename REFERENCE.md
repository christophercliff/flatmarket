# v1.0.x API Reference

- [`Client.create(options)`](#clientcreateoptions)
- [`Client` Instance Methods](#client-instance-methods)
    - [`client.createCharge(options)`](#clientcreatechargeoptions)
    - [`client.getStatus()`](#clientgetstatus)

## `Client.create(options)`

Creates the client.

```js
var client = Client.create(options)
```

#### **`options`** `Object`

- **`host`** `String`

    The host. *Required*.

- **`pathname`** `String`

    The pathname. Default `'/'`.

## `Client` Instance Methods

### `client.createCharge(options)`

Creates the charge.

```js
client.createCharge(options)
    .then(function (payload) {})
```

#### **`options`** `Object`

- **`email`** `String`

    The email. *Required*.

- **`metadata`** `Object`

    Metadata about the charge. Default `undefined`.

- **`sku`** `String`

    The SKU. Should correspond to a key in the [Products Object](https://github.com/christophercliff/flatmarket-schema/blob/master/SPECIFICATION.md#products-object). *Required*.

- **`token`** `String`

    The Stripe token. *Required*.

### `client.getStatus()`

Gets the status of the Flatmarket server. Will return `{ code: 'ok' }` if the server is configured correctly.

```js
client.getStatus()
    .then(function (payload) {})
```
