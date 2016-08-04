# flatmarket-example

An example [Flatmarket](/christophercliff/flatmarket) website.

## Usage

Clone this repo and install dependencies:

```sh
npm install
```

Then start the local server in development mode:

```sh
./node_modules/.bin/flatmarket \
    --component ./node_modules/flatmarket-theme-bananas/index.jsx \
    --stripe-secret-key YOUR_TEST_SECRET_KEY \
    --dev
```

The website should be running at [https://127.0.0.1:8000/](https://127.0.0.1:8000/) (note the **`https`**).

See the [API Reference](REFERENCE.md) for a complete list of options.

## License

See [LICENSE](LICENSE.md).
