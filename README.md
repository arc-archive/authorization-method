# authorization-method custom element

[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/authorization-method.svg)](https://www.npmjs.com/package/@advanced-rest-client/authorization-method)

[![tests](https://github.com/advanced-rest-client/authorization-method/actions/workflows/deployment.yml/badge.svg)](https://github.com/advanced-rest-client/authorization-method/actions/workflows/deployment.yml)

Note, in version 0.2.0 the API surface, data types, and events has changed.

Also the `oauth 1` type is now deprecated and will be removed from this element.

## Introduction

A component that aims to create a single custom element that support building an
UI to request for user credentials for various authorization methods.

This custom element is meant to be used by applications that interact with web APIs
like Advanced REST Client or API Console.

The predecessor of this custom element is [auth-methods](https://github.com/advanced-rest-client/auth-methods).
However, few invalid assumptions has been made when creating this element's architecture
and therefore new element is required.

The `authorization-method` element is build to be extended by other elements to build more
complex authorization methods that, for example, support RAML's and OAS' security method
definitions to build an UI from API spec.

## Security

The component is build with `open` shadow DOM so technically every script can access
data provided by the user. Also, properties reflect user input. For example the basic
authorization method has `username` and `password` property. Without it it would be
impossible to get the data out of the element.

All non-api methods of the element are masked. Only basic API functions are available.

## Usage

The `authorization-method` element covers basic use cases of authorization forms:

- basic authorization
- bearer token
- digest authorization
- NTLM
- OAuth 1
- OAuth 2

Other authorization methods can be added by extending `AuthorizationMethod` or `AuthorizationBase` class.
The child element should override `render()`, `restore(settings)`, `validate()`,
`serialize()`, and possibly `authorize()` methods.

The component renders the form based on `type` attribute. Depending on the `type`
different attributes/properties gets activated.

The component dispatches `change` event each time any value changes. The hosting
application / component should handle this event, and read the data either by calling `serialize()`
function that returns current type's configuration object or by manually reading properties from the element.

```javascript
// assuming type "basic"
document.querySelector('authorization-method').onchange = (e) => {
  if (e.target.validate()) {
    const { username, password } = e.target.serialize();
    console.log(username, password);
  }
};
```

The effect of serialization is a map of properties and their values that are relevant for
selected authorization method.

For example, for basic authorization the `serialize()` function returns a map
with `username` and `password` properties. NTLM method has additional `domain`
property, and so on for each method.

Alternatively the application can just access these properties directly from the element.

This is equivalent to the handler above:

```javascript
const auth = document.querySelector('authorization-method');
auth.onchange = (e) => {
  if (e.target.validate()) {
    const { username, password } = e.target;
    console.log(username, password);
  }
};
```

Note, when the `type` property change the values for previous type's properties aren't cleared.
This means that the element can have a value on a property that is not supported by current type.
Use `serialize()` function to get only settings relevant for current type, and `restore(settings)`
to restore only values that are relevant for current method.

### Basic authorization

```html
<authorization-method
  type="basic"
  username="demo username"
  password="demo password"
></authorization-method>
```

### Bearer authorization

```html
<authorization-method
  type="bearer"
  token="some token"
></authorization-method>
```

### NTLM authorization

```html
<authorization-method
  type="ntlm"
  username="demo username"
  password="demo password"
  domain="demo domain"
></authorization-method>
```

### Digest authorization

```html
<authorization-method
  type="digest"
  username="digest username"
  password="digest password"
  realm="realm value"
  nonce="nonce value"
  opaque="opaque value"
  algorithm="MD5"
  requestUrl="https://api.domain.com/v0/endpoint"
  httpMethod="GET"
></authorization-method>
```

### OAuth 1 authorization

```html
<authorization-method
  type="oauth 1"
  consumerKey="key"
  consumerSecret="secret"
  redirectUri="https://auth.api.com/rdr"
  token="oauth 1 token"
  tokenSecret="oauth 1 token secret"
  requestTokenUri="http://auth.api.com/request_token.php"
  accessTokenUri="http://tauth.api.com/access_token.php"
  authTokenMethod="GET"
  authParamsLocation="querystring"
></authorization-method>
```

### OAuth 2 authorization

```html
<authorization-method
  type="oauth 2"
  grantType="authorization_code"
  redirectUri="https://auth.api.com/rdr"
  authorizationUri="https://auth.api.com/auth"
  accessTokenUri="https://api.domain.com/token"
  clientId="client id"
  clientSecret="client secret"
  scopes='["profile", "email"]'
></authorization-method>
```

Validation is performed only for fields that are required from the user.
However, OAuth 2 also required to provide `redirectUri` which should be
set on the element and is included into serialized value, but this property is
not validated.

#### Implicit grant

Value: `implicit`

Required input:

- `clientId`
- `authorizationUri`

#### Authorization code grant

Value: `authorization_code`

Required input:

- `clientId`
- `clientSecret`
- `authorizationUri`
- `accessTokenUri`

#### Client credentials grant

Value: `client_credentials`

Required input:

- `accessTokenUri`

#### Password grant

Value: `client_credentials`

Required input:

- `accessTokenUri`
- `username`
- `password`

#### Custom grant

Value: any value

Required input:

- `accessTokenUri`

### baseUri property

The component has `baseUri` property (`baseUri` attribute) that should be set to compute absolute value for the following URL values:

- `authorizationUri`
- `redirectUri`
- `accessTokenUri`

If any property above has a value that can be a relative path to any of the authorization endpoints and it starts with `/` character then the `baseUri` value is added as a prefix when constructing the serialized configuration object.

Note that by setting `baseUri` value it disables URL validation on the input types. The inputs becomes regular string inputs. Otherwise the validation would not allow to request for the token. This must be enabled to validate URIs as they may become a XSS attack vulnerability.
