<p align="center">
  <img alt="Lerna" src="https://raw.githubusercontent.com/christophercliff/flatmarket/master/packages/flatmarket-example/src/images/pineapple.png" width="360" />
</p>

<h1 align="center">Flatmarket</h1>

<p align="center">
    <a href="https://circleci.com/gh/christophercliff/flatmarket"><img src="https://camo.githubusercontent.com/5843fae6a2c92bed031acbc78027a2b0d5f0061c/68747470733a2f2f636972636c6563692e636f6d2f67682f6368726973746f70686572636c6966662f666c61746d61726b65742e7376673f7374796c653d736869656c64" alt="Build Status" data-canonical-src="https://circleci.com/gh/christophercliff/flatmarket.svg?style=shield" style="max-width:100%;"></a> <a href="http://codecov.io/github/christophercliff/flatmarket?branch=master"><img src="https://camo.githubusercontent.com/ea3c9df6a64408856944933ba4a73f3ea680e47b/687474703a2f2f636f6465636f762e696f2f6769746875622f6368726973746f70686572636c6966662f666c61746d61726b65742f636f7665726167652e7376673f6272616e63683d6d6173746572" alt="codecov.io" data-canonical-src="http://codecov.io/github/christophercliff/flatmarket/coverage.svg?branch=master" style="max-width:100%;"></a>
</p>

Flatmarket is a free, open source e-commerce platform for static websites. It is reliable, secure, and inexpensive to operate.

The platform uses [Stripe](https://stripe.com/) for payment processing and is built on the latest web technologies like [hapi](http://hapijs.com/), [React](http://facebook.github.io/react/), and [Webpack](http://webpack.github.io/). It comes with integrations for several cloud platforms including [AWS Lambda](https://aws.amazon.com/lambda/) and [Heroku](https://www.heroku.com/).

At its core is a batteries-included CLI to help you get started quickly. Modules are also [packaged individually](/christophercliff/flatmarket/packages) so you can customize your rig.

## Features

- Customizable React UI (or use whatever frontend you prefer)
- Separate billing and shipping addresses
- Subscription billing
- Supports many [global currencies](https://support.stripe.com/questions/which-currencies-does-stripe-support)
- Manual [charge authorization](https://support.stripe.com/questions/does-stripe-support-authorize-and-capture)
- Bitcoin
- Mobile-ready

## Demo

:point_right: [christophercliff.com/flatmarket/](https://christophercliff.com/flatmarket/)

You can complete checkout using credit card number `4242 4242 4242 4242`. A test charge will be created in Stripe, so do not submit personal information.

## How it works

Flatmarket is a static website generator paired with a proxy server for sending payments to Stripe. The static website content is generated from a public schema document. The proxy server reads from that schema document during checkout to prevent charge tampering. Once the proxy server is deployed, all content and configuration updates are made via the static website.

### Creating a charge

![architecture](https://cloud.githubusercontent.com/assets/317601/13714569/ff27bb1e-e794-11e5-9861-c04a94f56d35.png)

1. The Web Browser loads the static website from the Static Web Server.
2. The Web Browser submits a charge to Stripe via [Stripe Checkout](https://stripe.com/checkout) and obtains a token.
3. The Web Browser submits the token and product ID to the Flatmarket Service.
4. The Flatmarket Service loads the schema document from the Static Web Server.
5. The Flatmarket Service reads the product information from the schema document and submits the charge to Stripe.

## Documentation

- [Installation](#installation)
- [Creating the Schema](#creating-the-schema)
- [Running Locally](#running-locally)
- [Deploying the Static Website](#deploying-the-static-website)
- [Deploying the Proxy Server](#deploying-the-proxy-server)

### Installation

Install [the CLI](packages/flatmarket-cli) and [Bananas theme](packages/flatmarket-theme-bananas):

```sh
npm install flatmarket-cli flatmarket-theme-bananas
```

### Creating the Schema

The schema is a JSON document that conforms to the [flatmarket-schema spec](packages/flatmarket-schema). It contains information about individual products (e.g. description, price, images), Stripe configuration (e.g. currency, addresses) and any other data necessary to render the static website. It looks [like this](packages/flatmarket-example/blob/master/src/flatmarket.json). By convention, this document should be located at `src/flatmarket.json`.

### Running Locally

The Flatmarket CLI comes with a local development server so you can preview your website and create charges with your Stripe test keys. The following command will build your webiste and start a development server at [https://127.0.0.1:8000/](https://127.0.0.1:8000/) (note the ***https***).

```sh
./node_modules/.bin/flatmarket ./src/flatmarket.json \
    --component ./node_modules/flatmarket-theme-bananas/index.jsx \
    --stripe-secret-key YOUR_TEST_SECRET_KEY \
    --dev
```

An [example project](packages/flatmarket-example) is included to help you get started.

### Deploying the Static Website

When you're finished with development, generate the static website and upload the files to your preferred web server.

```sh
./node_modules/.bin/flatmarket ./src/flatmarket.json \
    --component ./node_modules/flatmarket-theme-bananas/index.jsx
```

### Deploying the Proxy Server

Flatmarket comes with server integrations for the following platforms:

- [Heroku](/christophercliff/flatmarket-server-heroku)
- AWS Lambda & API Gateway (not yet)
- [node.js](packages/flatmarket-server)
- [hapi](packages/flatmarket-hapi)

Each platform exposes the API endpoint that your static website will use to create charges. The server environment requires access to both your Stripe secret key and the public URI for the schema document.

## Themes

- [Bananas](packages/flatmarket-theme-bananas)

## Developers

Get the code:

```sh
git clone git@github.com:christophercliff/flatmarket.git && cd ./flatmarket/
npm install
make reset
```

Run tests:

```
make test
```

Run the example package on a local dev server:

```
make example-dev
```

## License

See [LICENSE](LICENSE.md).
