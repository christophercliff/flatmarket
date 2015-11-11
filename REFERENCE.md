# v1.0.x API Reference

## `flatmarket(options)`

### `options`

- **`component`** `String`

    A [React Component Class](http://facebook.github.io/react/docs/top-level-api.html#react.createclass). Use this to [customize the UI](https://github.com/christophercliff/flatmarket/blob/master/CUSTOMIZATION.md).

- **`destination`** `String`

    The build destination. Default `'./build/'`.

- **`dev`** `Boolean`

    Build in development mode. Starts a local developments and watches files for changes. Useful for developing custom UIs. Default `false`.

- **`preview`** `Boolean`

    Build in preview mode. Builds with production settings, but starts a local static file server so you can verify prior to deploying. Default `false`.

- **`schema`** `String`

    The Flatmarket schema. Default `'./src/flatmarket.json'`.

- **`source`** `String`

    The source directory. Files in the source directory will be copied to the build directory. Default `'./src/'`.

- **`stripeSecretKey`** `String`

    The Stripe Secret Key. In development and preview modes, use your `sk_test_*` key to integrate your local server with the Stripe API. Not used in production builds.
