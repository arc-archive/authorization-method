# authorization-method custom element

> This project is a work in progress.

It is another attempt to make an authorization input forms as a single web component.
Previous version, `auth-methods`, had few issues that couldn't be resolved because of
the architecture of the component.

This attempt aims to create base class for authorization methods that can be
scaled to other authorization methods not covered by the base component.

The `authorization-method` component covers very basic cases of authorization forms:

-   basic authorization
-   digest authorization
-   NTLM
-   OAuth 1
-   OAuth 2

Other authorization methods can be added by extending `AuthorizationMethod` class.
The child custom element should override `render()`, `restore(settings)`, `validate()`,
`serialize()`, and possibly `authorize()` methods.

The component is API specification agnostic and does not support AMF. New components
build on top of this component should add this functionality.


## Usage

The component renders the form based on `type` attribute. Depending on the `type`
different attributes/properties gets activated.

The component dispatches `change` event each time any value changes. The hosting
application / component should handle this event, and request for the data by calling `serialize()`
function.

```javascript
const auth = document.querySelector('authorization-method');
auth.onchange = (e) => {
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

### Basic authorization

```html
<authorization-method
  type="basic"
  username="demo username"
  password="demo password"
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
