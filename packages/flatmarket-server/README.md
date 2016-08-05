# flatmarket-server

A standalone web server for [Flatmarket](/christophercliff/flatmarket).

## Installation

```
npm install flatmarket-server
```

## Usage

The server requires the following environment variables:

```
CORS_ORIGINS=["https://your-origin.com"]
PORT=8000
SCHEMA_URI=https://your-origin.com/flatmarket.json
STRIPE_SECRET_KEY=your_stripe_secret_key
```

Then run:

```sh
node ./node_modules/flatmarket-server/lib/start
```

## License

See [LICENSE](https://github.com/christophercliff/flatmarket/blob/master/LICENSE.md).
