import { html } from 'lit-element';
import '@advanced-rest-client/oauth2-scope-selector/oauth2-scope-selector.js';
import {
  notifyChange,
} from './Utils.js';
/** Functions */
export const _oauth2ErrorHandler = Symbol();
export const _tokenSuccessHandler = Symbol();
export const _headerChangedHandler = Symbol();
export const _autoHide = Symbol();
export const _setOauth2Defaults = Symbol();
export const _authorizeOauth2 = Symbol();
export const _clickCopyAction = Symbol();
export const _autoRestore = Symbol();
export const _scopesChanged = Symbol();
export const _oauth2RedirectTemplate = Symbol();
export const _oauth2GrantTypeTemplate = Symbol();
export const _oauth2AdvancedTemplate = Symbol();
export const _oath2AuthorizeTemplate = Symbol();
export const _oauth2TokenTemplate = Symbol();

/**
 * Mixin that adds support for OAuth 1 method computations
 *
 * @param {Class} superClass
 * @return {Class}
 */
export const Oauth2MethodMixin = (superClass) => class extends superClass {
  /**
   * @return {Boolean} Computed value, true if the grant type is a cutom definition.
   */
  get isCustomGrant() {
    const { grantType } = this;
    return !!grantType  && ['implicit', 'authorization_code', 'client_credentials', 'password']
        .indexOf(grantType) === -1;
  }

  get oauth2ClientIdRendered() {
    const { grantType, isCustomGrant } = this;
    return isCustomGrant || !!grantType  &&  ['implicit', 'authorization_code'].indexOf(grantType) !== -1;
  }

  get oauth2ClientSecretRendered() {
    const { grantType, isCustomGrant } = this;
    return isCustomGrant || !!grantType  && ['authorization_code'].indexOf(grantType) !== -1;
  }

  get oauth2AuthorizationUriRendered() {
    const { grantType, isCustomGrant } = this;
    return isCustomGrant || !!grantType  &&  ['implicit', 'authorization_code'].indexOf(grantType) !== -1;
  }

  get oauth2AccessTokenUriRendered() {
    const { grantType, isCustomGrant } = this;
    return isCustomGrant || !!grantType  &&
      ['client_credentials', 'authorization_code', 'password'].indexOf(grantType) !== -1;
  }

  get oauth2PasswordRendered() {
    const { grantType, isCustomGrant } = this;
    return isCustomGrant || !!grantType  &&
      ['password'].indexOf(grantType) !== -1;
  }

  /**
   * List of OAuth 2.0 default grant types.
   * This list can be extended by custom grants
   *
   * @return {Array<Object>} List of objects with `type` and `label`
   * properties.
   */
  get oauth2GrantTypes() {
    return [{
      type: 'implicit',
      label: 'Access token (browser flow)'
    }, {
      type: 'authorization_code',
      label: 'Authorization code (server flow)'
    }, {
      type: 'client_credentials',
      label: 'Client credentials'
    }, {
      type: 'password',
      label: 'Password'
    }];
  }

  get storeKeys() {
    return {
      clientId: 'auth.methods.latest.client_id',
      clientSecret: 'auth.methods.latest.client_secret',
      authorizationUri: 'auth.methods.latest.auth_uri',
      accessTokenUri: 'auth.methods.latest.token_uri',
      username: 'auth.methods.latest.username',
      password: 'auth.methods.latest.password',
      token: 'auth.methods.latest.auth_token',
      tokenType: 'auth.methods.latest.tokenType'
    };
  }

  static get properties() {
    return {
      // Seleted authorization grand type.
      grantType: { type: String },
      // The client ID for the auth token.
      clientId: { type: String },
      // The client secret. It to be used when selected server flow.
      clientSecret: { type: String },
      /**
       * List of user selected scopes.
       * It can be pre-populated with list of scopes (array of strings).
       */
      scopes: { type: Array },
      /**
       * List of pre-defined scopes to choose from. It will be passed to the `oauth2-scope-selector`
       * element.
       */
      allowedScopes: { type: Array },
      /**
       * If true then the `oauth2-scope-selector` will disallow to add a scope that is not
       * in the `allowedScopes` list. Has no effect if the `allowedScopes` is not set.
       */
      preventCustomScopes: { type: Boolean },
      /**
       * When the user authorized the app it should be set to the token value.
       * This element do not perform authorization. Other elements must intercept
       * `oauth2-token-requested` and perform the authorization.
       */
      accessToken: { type: String },
      /**
       * Received from the response token value.
       * By default it is "bearer" as the only one defined in OAuth 2.0
       * spec.
       * If the token response contains `tokenType` property this value is
       * updated.
       */
      tokenType: { type: String },
      /**
       * Currently available grant types.
       */
      grantTypes: { type: Array },
      /**
       * If set it renders autorization url, token url and scopes as advanced options
       * which are then invisible by default. User can oen setting using the UI.
       */
      isAdvanced: { type: Boolean },
      /**
       * If true then the advanced options are opened.
       */
      advancedOpened: { type: Boolean },
      /**
       * If set, the grant type selector is hidden from the UI.
       */
      noGrantType: { type: Boolean },
      /**
       * List of query parameters to apply to authorization request.
       * This is allowed by the OAuth 2.0 spec as an extension of the
       * protocol.
       * This value is computed if the `ramlSettings` contains annotations
       * and one of it is `customSettings`.
       * See https://github.com/raml-org/raml-annotations for definition.
       */
      _authQueryParameters: { type: Array },
      /**
       * List of query parameters to apply to token request.
       * This is allowed by the OAuth 2.0 spec as an extension of the
       * protocol.
       * This value is computed if the `ramlSettings` contains annotations
       * and one of it is `customSettings`.
       * See https://github.com/raml-org/raml-annotations for definition.
       */
      _tokenQueryParameters: { type: Array },
      /**
       * List of headers to apply to token request.
       * This is allowed by the OAuth 2.0 spec as an extension of the
       * protocol.
       * This value is computed if the `ramlSettings` contains annotations
       * and one of it is `customSettings`.
       * See https://github.com/raml-org/raml-annotations for definition.
       */
      _tokenHeaders: { type: Array },
      /**
       * List of body parameters to apply to token request.
       * This is allowed by the OAuth 2.0 spec as an extension of the
       * protocol.
       * This value is computed if the `ramlSettings` contains annotations
       * and one of it is `customSettings`.
       * See https://github.com/raml-org/raml-annotations for definition.
       */
      _tokenBody: { type: Array },
      /**
       * Default delivery method of access token. Reported with
       * settings change event as `deliveryMethod`.
       *
       * This value is added to event's `settings` property.
       *
       * When setting AMF model, this value may change, if AMF description
       * forces different than default placement of the token.
       */
      oauthDeliveryMethod: { type: String },
      /**
       * Default parameter name that carries access token. Reported with
       * the settings change event as `deliveryName`.
       *
       * This value is added to event's `settings` property.
       *
       * When setting AMF model, this value may change, if AMF description
       * forces different than default parameter name for the token.
       */
      oauthDeliveryName: { type: String },
    };
  }
  constructor() {
    super();
    this[_oauth2ErrorHandler] = this[_oauth2ErrorHandler].bind(this);
    this[_tokenSuccessHandler] = this[_tokenSuccessHandler].bind(this);
    this[_headerChangedHandler] = this[_headerChangedHandler].bind(this);
  }

  _attachListeners(node) {
    super._attachListeners(node);
    window.addEventListener('oauth2-error', this[_oauth2ErrorHandler]);
    window.addEventListener('oauth2-token-response', this[_tokenSuccessHandler]);
    node.addEventListener('request-header-changed', this[_headerChangedHandler]);
  }

  _detachListeners(node) {
    super._detachListeners(node);
    window.removeEventListener('oauth2-error', this[_oauth2ErrorHandler]);
    window.removeEventListener('oauth2-token-response', this[_tokenSuccessHandler]);
    node.removeEventListener('request-header-changed', this[_headerChangedHandler]);
  }

  [_setOauth2Defaults]() {
    if (!this.oauthDeliveryName) {
      this.oauthDeliveryName = 'authorization';
    }
    if (!this.oauthDeliveryMethod) {
      this.oauthDeliveryMethod = 'header';
    }
    if (!this.grantTypes) {
      this.grantTypes = this.oauth2GrantTypes;
    }
    this[_autoHide]();
    this[_autoRestore]();
    if (!this._tokenType) {
      this._tokenType = 'Bearer';
    }
  }

  [_authorizeOauth2]() {
    const validationResult = this.validate();
    if (!validationResult) {
      return false;
    }
    const detail = this._serializeOauth2Auth();
    this._lastState = this.generateState();
    detail.state = this._lastState;
    const e = new CustomEvent('oauth2-token-requested', {
      detail: detail,
      bubbles: true,
      composed: true,
      cancelable: true
    });
    this.dispatchEvent(e);
    if (!e.defaultPrevented) {
      return false;
    }
    this._authorizing = true;
    return true;
  }
  /**
   * Handler for `oauth2-error` custom event.
   * Informs the user about the error in the flow if the state property
   * is the one used with the request.
   *
   * @param {CustomEvent} e
   */
  [_oauth2ErrorHandler](e) {
    const info = e.detail;
    // API console may not support state check (may not return it back)
    if (typeof info.state !== 'undefined') {
      if (info.state !== this._lastState) {
        return;
      }
    }
    this._authorizing = false;
    this._lastState = undefined;
  }
  /**
   * Handler for the token response from the authorization component.
   *
   * @param {CustomEvent} e
   */
  [_tokenSuccessHandler](e) {
    const info = e.detail;
    // API console may not support state check (may not return it back)
    if (typeof info.state !== 'undefined') {
      if (info.state !== this._lastState) {
        return;
      }
    }
    this._authorizing = false;
    this._lastState = undefined;
    if (info.accessToken && info.accessToken !== this.accessToken) {
      if (info.tokenType && info.tokenType !== this.tokenType) {
        this.tokenType = info.tokenType;
      } else if (!info.tokenType && this.tokenType !== 'Bearer') {
        this.tokenType = 'Bearer';
      }
      this.accessToken = info.accessToken;
    }
  }
  /**
   * Handler for the `request-header-changed` custom event.
   * If the panel is opened the it checks if current header updates
   * authorization.
   *
   * @param {Event} e
   */
  [_headerChangedHandler](e) {
    /* istanbul ignore if */
    if (e.defaultPrevented || this._getEventTarget(e) === this) {
      return;
    }
    let name = e.detail.name;
    /* istanbul ignore if */
    if (!name) {
      return;
    }
    name = name.toLowerCase();
    if (name !== 'authorization') {
      return;
    }
    let value = e.detail.value;
    if (!value) {
      if (this.accessToken) {
        this.accessToken = '';
      }
      return;
    }
    const lowerValue = value.toLowerCase();
    const lowerType = (this.tokenType || 'bearer').toLowerCase();
    if (lowerValue.indexOf(lowerType) !== 0) {
      if (this.accessToken) {
        this.accessToken = '';
      }
      return;
    }
    value = value.substr(lowerType.length + 1).trim();
    this.accessToken = value;
  }
  /**
   * Generates `state` parameter for the OAuth2 call.
   *
   * @return {String} Generated state string.
   */
  generateState() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < 6; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
  /**
   * This function hides all non-crucial fields that has been pre-filled when element has been
   * initialize (values not provided by the user). Hidden fields will be available under
   * "advanced" options.
   *
   * To prevent this behavior set `no-auto` attribute on this element.
   */
  [_autoHide]() {
    if (this.grantType === 'password') {
      this.advancedOpened = true;
    } else if (this.authorizationUri && this.accessTokenUri && !!(this.scopes && this.scopes.length)) {
      this.isAdvanced = true;
      this.advancedOpened = false;
    } else {
      this.advancedOpened = true;
    }
  }

  /**
   * A handler for `focus` event on a label that contains text and
   * should be coppied to clipboard when user is interacting with it.
   *
   * @param {ClickEvent} e
   */
  [_clickCopyAction](e) {
    const node = e.target;
    const elm = this.shadowRoot.querySelector('clipboard-copy');
    elm.content = node.innerText;
    if (elm.copy()) {
      // this.shadowRoot.querySelector('#clipboardToast').opened = true;
    }
    setTimeout(() => {
      if (document.body.createTextRange) {
        const range = document.body.createTextRange();
        range.moveToElementText(node);
        range.select();
      } else if (window.getSelection) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNode(node);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    });
  }

  /**
   * Automatically restores value from session store if any exists.
   * It does not override values already set.
   */
  [_autoRestore]() {
    const keys = this.storeKeys;
    this._restoreSessionProperty(keys.clientId, 'clientId');
    this._restoreSessionProperty(keys.token, 'accessToken');
    this._restoreSessionProperty(keys.tokenType, 'tokenType');
    this._restoreSessionProperty(keys.authorizationUri, 'authorizationUri');
    this._restoreSessionProperty(keys.accessTokenUri, 'accessTokenUri');
    this._restoreSessionProperty(keys.clientSecret, 'clientSecret');
    this._restoreSessionProperty(keys.username, 'username');
    this._restoreSessionProperty(keys.password, 'password');
  }

  [_scopesChanged](e) {
    this.scopes = e.detail.value;
    notifyChange(this);
  }

  [_oauth2RedirectTemplate]() {
    const {
      redirectUri
    } = this;
    return html`<div class="subtitle">Redirect URI</div>
    <section>
      <div class="redirect-section">
        <p class="redirect-info">Set this redirect URI in OAuth 2.0 provider settings.</p>
        <p class="read-only-param-field padding">
          <span class="code" @click="${this[_clickCopyAction]}" title="Click to copy the URI">${redirectUri}</span>
        </p>
      </div>
    </section>`;
  }

  [_oauth2GrantTypeTemplate]() {
    const {
      grantType,
      outlined,
      compatibility,
      readOnly,
      disabled,
      noGrantType
    } = this;
    const items = this.grantTypes || [];
    return html`
    <anypoint-dropdown-menu
      name="grantType"
      required
      class="grant-dropdown"
      ?hidden="${noGrantType}"
      .outlined="${outlined}"
      .compatibility="${compatibility}"
      .readOnly="${readOnly}"
      .disabled="${disabled}"
    >
      <label slot="label">Grant type</label>
      <anypoint-listbox
        slot="dropdown-content"
        .selected="${grantType}"
        @selected-changed="${this._selectionHandler}"
        data-name="grantType"
        .outlined="${outlined}"
        .compatibility="${compatibility}"
        .readOnly="${readOnly}"
        .disabled="${disabled}"
        attrforselected="data-value">
        ${items.map((item) =>
    html`<anypoint-item .compatibility="${compatibility}" data-value="${item.type}">${item.label}</anypoint-item>`)}
      </anypoint-listbox>
    </anypoint-dropdown-menu>`;
  }

  [_oauth2AdvancedTemplate]() {
    const {
      isCustomGrant,
      advancedOpened,
      oauth2AuthorizationUriRendered,
      authorizationUri,
      oauth2AccessTokenUriRendered,
      accessTokenUri,
      oauth2PasswordRendered,
      username,
      password,
      allowedScopes,
      preventCustomScopes,
      outlined,
      compatibility,
      readOnly,
      disabled,
      scopes,
    } = this;
    return html`<div class="advanced-section" ?hidden="${!advancedOpened}">
    ${oauth2AuthorizationUriRendered ?
      this._renderInput('authorizationUri', authorizationUri, 'Authorization URI', {
        type: 'url',
        required: !isCustomGrant,
        autoValidate: true,
        invalidLabel: 'Authorization URI is required for this grant type',
        persistent: true,
      }): ''
    }
    ${oauth2AccessTokenUriRendered ?
      this._renderInput('accessTokenUri', accessTokenUri, 'Access token URI', {
        type: 'url',
        required: !isCustomGrant,
        autoValidate: true,
        invalidLabel: 'Access token URI is required for this grant type',
        persistent: true,
      }): ''
    }
    ${oauth2PasswordRendered ?
      this._renderInput('username', username, 'Username', {
        required: !isCustomGrant,
        autoValidate: true,
        invalidLabel: 'User name is required for this grant type',
        persistent: true,
      }): ''
    }
    ${oauth2PasswordRendered ?
      this._renderInput('password', password, 'Password', {
        required: !isCustomGrant,
        autoValidate: true,
        invalidLabel: 'Password is required for this grant type',
        persistent: true,
      }): ''
    }
    <oauth2-scope-selector
      .allowedScopes="${allowedScopes}"
      .preventCustomScopes="${preventCustomScopes}"
      .value="${scopes}"
      .readOnly="${readOnly}"
      .disabled="${disabled}"
      .outlined="${outlined}"
      .compatibility="${compatibility}"
      name="scopes"
      @value-changed="${this[_scopesChanged]}"></oauth2-scope-selector>
    </div>`;
  }

  [_oath2AuthorizeTemplate]() {
    const { _authorizing, compatibility } = this;
    return html`<div class="authorize-actions">
      <anypoint-button
        ?disabled="${_authorizing}"
        class="auth-button"
        ?compatibility="${compatibility}"
        emphasis="medium"
        data-type="get-token"
        @click="${this.authorize}"
      >Request access token</anypoint-button>
    </div>`;
  }

  [_oauth2TokenTemplate]() {
    const {
      accessToken,
      compatibility,
      _authorizing,
    } = this;
    return html`<div class="current-token">
      <label class="token-label">Current token</label>
      <p class="read-only-param-field padding">
        <span class="code" @click="${this[_clickCopyAction]}">${accessToken}</span>
      </p>
      <div class="authorize-actions">
        <anypoint-button
          ?disabled="${_authorizing}"
          class="auth-button"
          ?compatibility="${compatibility}"
          emphasis="medium"
          data-type="refresh-token"
          @click="${this.authorize}
        ">Refresh access token</anypoint-button>
      </div>
    </div>`;
  }
};
