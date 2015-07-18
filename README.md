[![Build Status](https://travis-ci.org/christophercliff/flatmarket.png?branch=master)](https://travis-ci.org/christophercliff/flatmarket)

# flatmarket

flatmarket is a free and secure e-commerce platform for static websites. It comes with a batteries-included CLI to get started quickly, but components are also packaged individually so you can customize your rig. By [JSON Expert](https://json.expert/).

Take a moment to go try [the example](#).

The platform uses [Stripe](https://stripe.com/) for payment processing and is built on the latest web technologies like [React](http://facebook.github.io/react/), [hapi](http://hapijs.com/), and [Webpack](http://webpack.github.io/).

## Design Goals

- [x] Your store should cost next-to-nothing to operate.
- [x] Your store should be reliable and scalable. This is achieved by offloading expensive and complicated operations to third-party services.
- [x] Your store and your customers' data should be secure.
- [x] Your store should be easy to customize, update, and deploy.

## Architecture

flatmarket is a combination of a static website paired with a [proxy server](https://github.com/christophercliff/flatmarket-server) for sending payments to Stripe securely. The web client and server communicate seamlessly in the background using a [shared schema](https://github.com/christophercliff/flatmarket-schema), represented by a JSON document. The store operator can manage inventory and store configuration simply by updating the JSON document.

## Get Started

Install the CLI:

```sh
$ npm install flatmarket
```

Create a JSON representation of your store with [flatmarket-schema](https://github.com/christophercliff/flatmarket-schema):

```sh
$ mkdir ./src/ && touch ./src/flatmarket.json
```

Then start the local development server to view the website:

```sh
$ ./node_modules/.bin/flatmarket up ./src/flatmarket.json
```

If you'd like to tinker with a working example, head over to [flatmarket-example](https://github.com/christophercliff/flatmarket-example).

## Customization

TODO [#](#)

## Quick Links

- [flatmarket-client](https://github.com/christophercliff/flatmarket-client) A web client for communicating with flatmarket-server.
- [flatmarket-example](https://github.com/christophercliff/flatmarket-example) A complete example of a flatmarket store.
- [flatmarket-schema](https://github.com/christophercliff/flatmarket-schema) A utility for creating a JSON representation of a flatmarket store.
- [flatmarket-server](https://github.com/christophercliff/flatmarket-server) A standalone web server for flatmarket.
- [hapi-flatmarket](https://github.com/christophercliff/hapi-flatmarket) A hapi plugin for creating flatmarket servers.

## Contributing

See [CONTRIBUTING](https://github.com/christophercliff/flatmarket/blob/master/CONTRIBUTING.md).

## License

See [LICENSE](https://github.com/christophercliff/flatmarket/blob/master/LICENSE.md).
