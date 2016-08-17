# flatmarket-schema

A JSON schema utility for [Flatmarket](https://github.com/christophercliff/flatmarket).

## Installation

```sh
npm install flatmarket-schema
```

## Usage

```js
var schema = require('flatmarket-schema')
var validation = schema.validate(yourObj)

validation.value // the result (with defaults populated)
validation.error // the error (`null` if `yourObj` is valid)
```

## Specification

### Schema

#### Flatmarket Object

This is the root object for the specification.

##### Fixed Fields

Field Name | Type | Description
---|:---:|---
info | [Info Object](#info-object) | **Required.**
products | [Products Object](#products-object) | **Required.**
server | [Server Object](#server-object) | **Required.**
stripe | [Stripe Object](#stripe-object) | **Required.**

#### Info Object

Defines additional data about the store.

##### Fixed Fields

Field Name | Type | Description
---|:---:|---
name | `String` | **Required.**
description | `String` |

##### Patterned Objects

Field Pattern | Type | Description
---|:---:|---
^x- | Any |

#### Products Object

##### Patterned Fields

Field Pattern | Type | Description
---|:---:|---
{id} | [Product Object](#product-object) | **Required.**

#### Product Object

Defines a product. In addition to the subset specified below, can contain the types specified in [Stripe Object](#stripe-object) (these values will override the global Stripe configuration).

##### Fixed Fields

Field Name | Type | Description
---|:---:|---
amount | `Number` | **Required.**
description | `String` |
images | `[String]` |
metadata | Any |
name | `String` |
plan | `String` |

##### Patterned Fields

Field Pattern | Type | Description
---|:---:|---
^x- | Any |

#### Server Object

Defines the Flatmarket server configuration.

##### Fixed Fields

Field Name | Type | Description
---|:---:|---
host | `String` | **Required.**
pathname | `String` |

#### Stripe Object

Defines the global Stripe configuration. Values can be overriden by individual [Product Objects](#product-object).

##### Fixed Fields

Field Name | Type | Description
---|:---:|---
allowRememberMe | `Boolean` |
billingAddress | `Boolean` |
bitcoin | `Boolean` |
capture | `Boolean` |
currency | `String` |
image | `String` |
name | `String` |
panelLabel | `String` |
publishableKey | `String` | **Required.**
receiptEmail | `Boolean` |
shippingAddress | `Boolean` | `billingAddress` must be set to `true`.
zipCode | `Boolean` |

## License

See [LICENSE](https://github.com/christophercliff/flatmarket/blob/master/LICENSE.md).
