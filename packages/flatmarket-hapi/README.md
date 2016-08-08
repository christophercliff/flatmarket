# hapi-flatmarket

A [hapi](http://hapijs.com/) plugin for [Flatmarket](https://github.com/christophercliff/flatmarket).

## Installation

```
npm install hapi-flatmarket
```

## Usage

```js
var Flatmarket = require('hapi-flatmarket')

server.register({
  register: Flatmarket,
  options: options,
}, function (err) {})
```

### **`options`** `Object`

- **`corsOrigins`** `[String]`

    Sets the [CORS headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS) for your routes. Default `['*']`.

- **`schemaUri`** `String`

    The URI for the [flatmarket schema](https://github.com/christophercliff/flatmarket/tree/master/packages/flatmarket-schema). Required.

- **`stripeSecretKey`** `String`

    The [Stripe secret key](https://support.stripe.com/questions/where-do-i-find-my-api-keys). Required.

## License

See [LICENSE](https://github.com/christophercliff/flatmarket/blob/master/LICENSE.md).
