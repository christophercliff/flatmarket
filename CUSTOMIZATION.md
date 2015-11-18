# Customization & Integration

If you write a Flatmarket integration for a platform not listed here, please open a pull request to add it to the documentation.

## Frontend

### For CLI Users

The Flatmarket CLI comes with everything you need to develop and build a Flatmarket website. It has a built-in development web server and a static website generator. Simply provide a React Component (clone [the example repo](https://github.com/christophercliff/flatmarket-example) to get started).

This is the most opinionated workflow and it limits your choices, tech-wise. Open an issue if youd like to see support for additional file types, loaders, or command line hooks.

### For React/Redux/"Flux" Users

The CLI is built on React, Redux, Immutable, and Webpack. Flatmarket abstracts Stripe Checkout integration into a "Flux" API to make it easier to work with. If you'd like to use this API with an existing application or to create a custom Webpack build, you can use these modules independently:

```js
var actions = require('flatmarket/lib/ui/actions')
var reducer = require('flatmarket/lib/ui/reducer')
var store = require('flatmarket/lib/ui/store')
```

### For Miscellaneous Users

If you'd like to write your own Stripe Checkout integration, that's ok too. Flatmarket provides a [browser client](https://github.com/christophercliff/flatmarket-client) to make it easy to communicate with the Flatmarket server.

## Backend

### For hapi Users

The Flatmarket backend is built on hapi, an application framework for Node.js. If you're already a hapi user, you can integrate the Flatmarket endpoints using the [hapi-flatmarket plugin](https://github.com/christophercliff/hapi-flatmarket). See hapi's plugin documentation for more information.

### For Node.js Users

Flatmarket also ships with a [standalone Node.js web server](https://github.com/christophercliff/flatmarket-server).

### For Heroku Users

[flatmarket-server-heroku](https://github.com/christophercliff/flatmarket-server-heroku) is the easiest way to create a free, public Flatmarket server. Just click the Heroku button and you're done.
