<p align="center">
  <img alt="Lerna" src="https://raw.githubusercontent.com/christophercliff/flatmarket/master/packages/flatmarket-example/src/images/pineapple.png" width="360" />
</p>

<h1 align="center">Flatmarket</h1>

<p align="center">
    <a href="https://circleci.com/gh/christophercliff/flatmarket"><img src="https://camo.githubusercontent.com/5843fae6a2c92bed031acbc78027a2b0d5f0061c/68747470733a2f2f636972636c6563692e636f6d2f67682f6368726973746f70686572636c6966662f666c61746d61726b65742e7376673f7374796c653d736869656c64" alt="Build Status" data-canonical-src="https://circleci.com/gh/christophercliff/flatmarket.svg?style=shield" style="max-width:100%;"></a> <a href="http://codecov.io/github/christophercliff/flatmarket?branch=master"><img src="https://camo.githubusercontent.com/ea3c9df6a64408856944933ba4a73f3ea680e47b/687474703a2f2f636f6465636f762e696f2f6769746875622f6368726973746f70686572636c6966662f666c61746d61726b65742f636f7665726167652e7376673f6272616e63683d6d6173746572" alt="codecov.io" data-canonical-src="http://codecov.io/github/christophercliff/flatmarket/coverage.svg?branch=master" style="max-width:100%;"></a>
</p>

Flatmarket is a free, open source e-commerce platform for static websites. It offers the performance, reliability, and simplicity of a static website combined with secure and scalable payment processing.

The platform uses [Stripe](https://stripe.com/) for payment processing and it's built on the latest web technologies like [hapi](http://hapijs.com/), [React](http://facebook.github.io/react/), and [Webpack](http://webpack.github.io/). It comes with [one-click installers](#automated-deployments) for [AWS](https://aws.amazon.com/lambda/) and [Heroku](https://www.heroku.com/).

At its core is a batteries-included CLI to help you [get started quickly](#documentation) Modules are also [packaged individually](packages) so you can customize your rig.

## Features

- Automated deployment for AWS or Heroku
- Customizable React UI (or use whatever frontend you prefer)
- Separate billing and shipping addresses
- Subscription billing
- Supports many [global currencies](https://support.stripe.com/questions/which-currencies-does-stripe-support)
- Manual [charge authorization](https://support.stripe.com/questions/does-stripe-support-authorize-and-capture)
- Bitcoin
- Mobile-ready
- Email receipts

## Demo

:point_right: [christophercliff.com/flatmarket/](https://christophercliff.com/flatmarket/)

You can complete checkout using credit card number `4242 4242 4242 4242`. A test charge will be created in Stripe, so do not submit personal information.

## How it works

Flatmarket is a static website generator paired with a proxy server for sending payments to Stripe. The static website content is generated from a public schema document. The proxy server reads from that document during checkout to prevent charge tampering. Once the proxy server is deployed, all content and configuration updates are made via the static website.

### Creating a charge

![architecture](https://cloud.githubusercontent.com/assets/317601/13714569/ff27bb1e-e794-11e5-9861-c04a94f56d35.png)

1. The web browser loads the static website from the static web server.
2. The web browser obtains a token from Stripe via [Stripe Checkout](https://stripe.com/checkout).
3. The web browser submits the token and product ID to the Flatmarket service.
4. The Flatmarket service reads the product price from the schema document on the static web server.
5. The Flatmarket service submits the charge to Stripe.

## Documentation

- [Installation](#installation)
- [Creating the schema](#creating-the-schema)
- [Developing locally](#developing-locally)
- [Building & deploying the static website](#building-deploying-the-static-website)
- [Deploying the proxy server](#deploying-the-proxy-server)
- [Using themes](#using-themes)

### Installation

Install [the CLI](packages/flatmarket-cli):

```sh
npm install flatmarket-cli
```

### Creating the schema

The schema is a JSON document that conforms to the [flatmarket-schema spec](packages/flatmarket-schema). It contains information about individual products (e.g. description, price, images), Stripe configuration (e.g. currency, addresses) and any other data needed to render the static website. It looks [like this](packages/flatmarket-example/src/flatmarket.json). By convention, this document should be located at `src/flatmarket.json`.

### Developing locally

The Flatmarket CLI comes with a local development server so you can preview your website and create charges with your Stripe test keys. The following command will build your website and start a development server at [https://127.0.0.1:8000/](https://127.0.0.1:8000/) (note the ***https***).

```sh
./node_modules/.bin/flatmarket ./src/flatmarket.json \
    --stripe-secret-key YOUR_TEST_SECRET_KEY \
    --dev
```

An [example project](packages/flatmarket-example) is included to help you get started.

### Building & deploying the static website

When you're finished with development, generate a production-ready build of the static website.

```sh
./node_modules/.bin/flatmarket ./src/flatmarket.json
```

Then upload the files to your preferred web server.

### Deploying the proxy server

#### Automated deployments

Platform | Click to deploy | &nbsp;
---|---|---
AWS | [![Deploy to AWS](https://s3.amazonaws.com/cloudformation-examples/cloudformation-launch-stack.png)](https://console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks/new?stackName=flatmarket&templateURL=https://s3.amazonaws.com/flatmarket/template.json) | [more info](packages/flatmarket-aws)
Heroku | [![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/christophercliff/flatmarket-server-heroku) | [more info](https://github.com/christophercliff/flatmarket-server-heroku) (deprecated)

#### Manual deployments

- [service](packages/flatmarket-service)
- [server](packages/flatmarket-server)
- [hapi](packages/flatmarket-hapi)

### Using themes

A theme is a [container component](http://redux.js.org/docs/basics/UsageWithReact.html#presentational-and-container-components) that gets bound to the Redux store implemented by [flatmarket-ui](packages/flatmarket-ui).

Themes are defined by a single React component but can contain multiple child components, CSS, fonts, and images. Flatmarket uses [Webpack loaders](https://webpack.github.io/docs/using-loaders.html) to import non-JavaScript file types. The following loaders are supported by default:

- [json-loader](https://www.npmjs.com/package/json-loader)
- [jsx-loader](https://www.npmjs.com/package/jsx-loader)
- [less-loader](https://www.npmjs.com/package/less-loader)
- [url-loader](https://www.npmjs.com/package/url-loader)

To use a theme, run:

```sh
./node_modules/.bin/flatmarket ./src/flatmarket.json \
    --component ./path/to/your-theme.jsx
```

#### Included Themes

- [Bananas](packages/flatmarket-theme-bananas)

## Developers

Install dependencies:

```sh
npm install
make reset
```

Run tests:

```
make test
```

Run the example locally:

```
make example-dev
```

## License

See [LICENSE](https://github.com/christophercliff/flatmarket/blob/master/LICENSE.md).
