Made possible By [JSON Expert](https://json.expert/), the easiest way to create a web-ready API.

---

# flatmarket

[![Build Status](https://circleci.com/gh/christophercliff/flatmarket.svg?style=shield)](https://circleci.com/gh/christophercliff/flatmarket)
[![codecov.io](http://codecov.io/github/christophercliff/flatmarket/coverage.svg?branch=master)](http://codecov.io/github/christophercliff/flatmarket?branch=master)

Flatmarket is a free, open source e-commerce platform for static websites. Its simple architecture makes it extremely reliable, secure, and inexpensive to operate.

The platform uses [Stripe](https://stripe.com/) for payment processing and is built on the latest web technologies like [hapi](http://hapijs.com/), [React](http://facebook.github.io/react/), and [Webpack](http://webpack.github.io/).

At its core is a batteries-included CLI to help you get started quickly. Modules are also packaged individually so you can easily customize your rig.

## Example

Take a minute to go try [the example](https://json.expert/flatmarket/).

## Design goals

- [x] It should cost next-to-nothing to operate.
- [x] It should should be reliable and scalable. This is achieved by offloading expensive and complicated operations to third-party services.
- [x] It should be secure.
- [x] It should be easy to customize, update, and deploy.

## How it works

Flatmarket is a combination of a static website paired with a [proxy server](https://github.com/christophercliff/flatmarket-server) for sending payments to Stripe securely. The web client and server communicate seamlessly in the background using a [shared schema](https://github.com/christophercliff/flatmarket-schema), represented by a JSON document. The store operator can manage inventory and store configuration simply by updating the JSON document.

## Who is it for?

Flatmarket isn't appropriate for every e-commerce project, but it is uniquely suited for the following situations:

- high traffic but low sales volume.
- high touch, where every transaction requires human involvement.
- sale of digital goods, made-to-order goods, or donations (where stock keeping is not required).
- any situation where low cost is a priority.

## Get started

##### 1. Create a [schema](https://github.com/christophercliff/flatmarket-schema) document

```json
{
  "info": {
    "name": "Your Store"
  },
  "products": {
    "sku_001": {
      "amount": 1000
    }
  },
  "server": {
    "host": "your-flatmarket-server.herokuapp.com"
  },
  "stripe": {
    "publishableKey": "your_publishable_key"
  }
}
```

##### 2. Install the CLI

```sh
npm install -g flatmarket
```

##### 3. Start a local Flatmarket server at [https://127.0.0.1:8000/](https://127.0.0.1:8000/)

```sh
$ flatmarket build ./your-schema.json --preview --stripe-secret-key your_stripe_secret_key
```

## Platform

- [flatmarket-client](https://github.com/christophercliff/flatmarket-client) A browser client for Flatmarket.
- [flatmarket-example](https://github.com/christophercliff/flatmarket-example) A complete example of a Flatmarket.
- [flatmarket-schema](https://github.com/christophercliff/flatmarket-schema) A JSON schema utility for Flatmarket.
- [flatmarket-server](https://github.com/christophercliff/flatmarket-server) A standalone web server for Flatmarket.
- [flatmarket-server-heroku](https://github.com/christophercliff/flatmarket-server-heroku) A Flatmarket server for [Heroku](https://www.heroku.com/).
- [hapi-flatmarket](https://github.com/christophercliff/hapi-flatmarket) A hapi plugin for Flatmarket.

## Reference

See [REFERENCE](https://github.com/christophercliff/flatmarket/blob/master/REFERENCE.md).

## Customization

See [CUSTOMIZATION](https://github.com/christophercliff/flatmarket/blob/master/CUSTOMIZATION.md).

## Contributing

See [CONTRIBUTING](https://github.com/christophercliff/flatmarket/blob/master/CONTRIBUTING.md).

## License

See [LICENSE](https://github.com/christophercliff/flatmarket/blob/master/LICENSE.md).
