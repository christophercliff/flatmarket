# Customization

You can create a custom UI however you like, but the Flatmarket library comes with a small framework to make it easy to integrate with Stripe and your Flatmarket server.

The framework is built on React and Webpack. You customize the UI by specifying a custom React Component Class. This class can make use of any Components and libraries you like, the only requirement is that you export the React class.

## API

The Component is stateful and will automatically re-render whenever there's a change in the background state. Use the Component's `props` to handle user interactions and display information. The Component has the following `propTypes`:

```js
module.exports = React.createClass({
    propTypes: {
        charge: React.PropTypes.object,
        checkout: React.PropTypes.func,
        error: React.PropTypes.string,
        schema: React.PropTypes.object,
    },
})
```

#### `propTypes`

- **`charge`** `Object`

    The charge. Will have a value if the user is engaged in the checkout flow. Will update as the user enters information and the server communicates with the Stripe API.

- **`checkout`** `Function`

    A function with the signature `function (skuId) {}`. Use this to initiate the checkout flow, e.g. when a user clicks a "Buy Now" button.

- **`error`** `String`

    The error. Will have a value if any operation in the checkout flow fails.

- **`schema`** `Object`

    The Flatmarket schema object. This contains the product catalog and any other information about your store.

## Example

You can see a complete example of a custom UI in the [flatmarket-example](https://github.com/christophercliff/flatmarket-example) repo.
