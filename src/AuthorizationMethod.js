import { html, LitElement } from 'lit-element';
import authStyles from './CommonStyles.js';
import '@anypoint-web-components/anypoint-input/anypoint-input.js';
import '@anypoint-web-components/anypoint-input/anypoint-masked-input.js';
import '@anypoint-web-components/anypoint-dropdown-menu/anypoint-dropdown-menu.js';
import '@anypoint-web-components/anypoint-listbox/anypoint-listbox.js';
import '@anypoint-web-components/anypoint-item/anypoint-item.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@anypoint-web-components/anypoint-checkbox/anypoint-checkbox.js';
import '@advanced-rest-client/clipboard-copy/clipboard-copy.js';
import '@polymer/paper-spinner/paper-spinner.js';
import { EventsTargetMixin } from '@advanced-rest-client/events-target-mixin/events-target-mixin.js';
import { classMap } from 'lit-html/directives/class-map.js';
import { DigestMethodMixin } from './DigestMethodMixin.js';
import { Oauth1MethodMixin } from './Oauth1MethodMixin.js';
import {
  Oauth2MethodMixin,
  _setOauth2Defaults,
  _authorizeOauth2,
  _oauth2RedirectTemplate,
  _oauth2GrantTypeTemplate,
  _oauth2AdvancedTemplate,
  _oath2AuthorizeTemplate,
  _oauth2TokenTemplate,
} from './Oauth2MethodMixin.js';
import { validateForm } from './Validation.js';
import {
  normalizeType,
  notifyChange,
  METHOD_BASIC,
  METHOD_NTLM,
  METHOD_DIGEST,
  METHOD_OAUTH1,
  METHOD_OAUTH2,
} from './Utils.js';

/** Functions */
const _inputHandler = Symbol()
export const _oauth2CustomPropertiesTemplate = Symbol()

/**
 * An element that renders various authorization methods.
 *
 * ## Development
 *
 * The element mixes in multimple mixins from `src/` directory.
 * Each mixin support an authorization method. When selection change (the `type`
 * property) a render function from correcponding mixin is called.
 *
 * @type {HTMLElement}
 */
export class AuthorizationMethod extends Oauth2MethodMixin(
  Oauth1MethodMixin(
    DigestMethodMixin(
      EventsTargetMixin(LitElement)))) {

  get styles() {
    return authStyles;
  }

  static get properties() {
    return {
      /**
       * Authorization method type.
       *
       * Supported types are (case insensitive, spaces sensitive):
       *
       * - Basic
       * - Client certificate
       * - Digest
       * - NTLM
       * - OAuth 1
       * - OAuth 2
       *
       * Depending on selected type different properties are used.
       * For example Basic type only uses `username` and `password` properties,
       * while NTLM also uses `domain` property.
       *
       * See readme file for detailed list of properties depending on selected type.
       *
       * @type {String}
       */
      type: { type: String, reflect: true },
      /**
       * Current password.
       *
       * Used in the following types:
       * - Basic
       * - NTLM
       * - Digest
       * - OAuth 2
       */
      password: { type: String },
      /**
       * Current username.
       *
       * Used in the following types:
       * - Basic
       * - NTLM
       * - Digest
       * - OAuth 2
       */
      username: { type: String },
      /**
       * Authorization domain
       *
       * Used in the following types:
       * - NTLM
       */
      domain: { type: String },
      /**
       * Authorization redirect URI
       *
       * Used in the following types:
       * - OAuth 1
       * - OAuth 2
       */
      redirectUri: { type: String },
      /**
       * Endpoint to authorize the token (OAuth 1) or exchange code for token (OAuth 2).
       *
       * Used in the following types:
       * - OAuth 1
       * - OAuth 2
       */
      accessTokenUri: { type: String },
      /**
       * An URI of authentication endpoint where the user should be redirected
       * to auththorize the app. This endpoint initialized OAuth flow.
       *
       * Used in the following types:
       * - OAuth 1
       * - OAuth 2
       */
      authorizationUri: { type: String },
      /**
       * When set the editor is in read only mode.
       */
      readOnly: { type: Boolean },
      /**
       * When set the inputs are disabled
       */
      disabled: { type: Boolean },
      /**
       * Enables compatibility with Anypoint components.
       */
      compatibility: { type: Boolean },
      /**
       * Enables Material Design outlined style
       */
      outlined: { type: Boolean },
      /**
       * Renders mobile friendly view.
       */
      narrow: { type: Boolean, reflect: true },
      /**
       * True when currently authorizing the user.
       *
       * Used in the following types:
       * - OAuth 1
       * - OAuth 2
       */
      _authorizing: { type: Boolean },
    };
  }

  get type() {
    return this._type;
  }

  set type(value) {
    const old = this._value;
    if (old === value) {
      return;
    }
    this._type = value;
    this.requestUpdate('type', old);
    this._typeChanged(value);
  }

  get onchange() {
    return this._onChange;
  }

  set onchange(value) {
    if (this._onChange) {
      this.removeEventListener('change', this._onChange);
    }
    if (typeof value !== 'function') {
      this._onChange = null;
      return;
    }
    this._onChange = value;
    this.addEventListener('change', value);
  }

  [_inputHandler](e) {
    const { name, value } = e.target;
    this[name] = value;
    notifyChange(this);
  }

  _selectionHandler(e) {
    const { parentElement, selected } = e.target;
    const name = parentElement.name;
    this[name] = selected;
    notifyChange(this);
  }

  _typeChanged(type) {
    type = normalizeType(type);
    switch (type) {
      case METHOD_DIGEST: return this._setDigestDefaults();
      case METHOD_OAUTH1: return this._setOauth1Defaults();
      case METHOD_OAUTH2: return this[_setOauth2Defaults]();
    }
  }

  /**
   * Creates a settings object with user provided data for current method.
   *
   * @return {Object} User provided data
   */
  serialize() {
    const type = normalizeType(this.type);
    switch(type) {
      case METHOD_BASIC: return this._serializeBasicAuth();
      case METHOD_NTLM: return this._serializeNtlmAuth();
      case METHOD_DIGEST: return this._serializeDigestAuth();
      case METHOD_OAUTH1: return this._serializeOauth1Auth();
      case METHOD_OAUTH2: return this._serializeOauth2Auth();
      default: return '';
    }
  }

  _serializeBasicAuth() {
    return {
      hash: this.hash,
      password: this.password || '',
      username: this.username || '',
    };
  }

  _serializeNtlmAuth() {
    return {
      domain: this.domain || '',
      password: this.password || '',
      username: this.username || '',
    };
  }

  _serializeDigestAuth() {
    this.response = this.generateDigestResponse();
    const settings = {
      username: this.username || '',
      password: this.password || '',
      realm: this.realm,
      nonce: this.nonce,
      uri: this._requestUri,
      response: this.response,
      opaque: this.opaque,
      qop: this.qop,
      nc: ('00000000' + this.nc).slice(-8),
      cnonce: this.cnonce,
      algorithm: this.algorithm,
    };
    return settings;
  }

  _serializeOauth1Auth() {
    return {
      consumerKey: this.consumerKey,
      consumerSecret: this.consumerSecret,
      token: this.token,
      tokenSecret: this.tokenSecret,
      timestamp: this.timestamp,
      nonce: this.nonce,
      realm: this.realm,
      signatureMethod: this.signatureMethod,
      requestTokenUri: this.requestTokenUri,
      accessTokenUri: this.accessTokenUri,
      redirectUri: this.redirectUri,
      authTokenMethod: this.authTokenMethod,
      authParamsLocation: this.authParamsLocation,
      authorizationUri: this.authorizationUri,
      type: 'oauth1',
    };
  }

  _serializeOauth2Auth() {
    const detail = {
      type: this.grantType,
      clientId: this.clientId,
      accessToken: this.accessToken || '',
      tokenType: this.tokenType,
      scopes: this.scopes,
      deliveryMethod: this.oauthDeliveryMethod,
      deliveryName: this.oauthDeliveryName
    };
    switch (this.grantType) {
      case 'implicit':
        // The browser flow.
        detail.authorizationUri = this.authorizationUri;
        detail.redirectUri = this.redirectUri;
        break;
      case 'authorization_code':
        // The server flow.
        detail.authorizationUri = this.authorizationUri;
        detail.clientSecret = this.clientSecret;
        detail.accessTokenUri = this.accessTokenUri;
        detail.redirectUri = this.redirectUri;
        break;
      case 'client_credentials':
        // The server flow.
        detail.accessTokenUri = this.accessTokenUri;
        break;
      case 'password':
        // The server flow.
        detail.username = this.username;
        detail.password = this.password;
        detail.accessTokenUri = this.accessTokenUri;
        break;
      default:
        // Custom grant type.
        detail.authorizationUri = this.authorizationUri;
        detail.clientSecret = this.clientSecret;
        detail.accessTokenUri = this.accessTokenUri;
        detail.redirectUri = this.redirectUri;
        detail.username = this.username;
        detail.password = this.password;
        break;
    }
    return detail;
  }

  validate() {
    return validateForm(this);
  }

  restore(settings) {
    const type = normalizeType(this.type);
    switch(type) {
      case METHOD_BASIC: return this._restoreBasicAuth(settings);
      case METHOD_NTLM: return this._restoreNtlmAuth(settings);
      case METHOD_DIGEST: return this._restoreDigestAuth(settings);
      case METHOD_OAUTH1: return this._restoreOauth1Auth(settings);
      case METHOD_OAUTH2: return this._restoreOauth2Auth(settings);
      default: return '';
    }
  }

  _restoreBasicAuth(settings) {
    this.password = settings.password;
    this.username = settings.username;
  }

  _restoreNtlmAuth(settings) {
    this.domain = settings.domain;
    this.password = settings.password;
    this.username = settings.username;
  }

  _restoreDigestAuth(settings) {
    this.username = settings.username;
    this.password = settings.password;
    this.realm = settings.realm;
    this.nonce = settings.nonce;
    this.opaque = settings.opaque;
    this.qop = settings.qop;
    this.cnonce = settings.cnonce;
    if (settings.uri) {
      this._requestUri = settings.uri;
    }
    if (settings.nc) {
      this.nc = Number(settings.nc.replace(/0+/, ''));
    }
  }

  _restoreOauth1Auth(settings) {
    this.consumerKey = settings.consumerKey;
    this.consumerSecret = settings.consumerSecret;
    this.token = settings.token;
    this.tokenSecret = settings.tokenSecret;
    this.timestamp = settings.timestamp;
    this.nonce = settings.nonce;
    this.realm = settings.realm;
    this.signatureMethod = settings.signatureMethod;
    this.requestTokenUri = settings.requestTokenUri;
    this.accessTokenUri = settings.accessTokenUri;
    this.redirectUri = settings.redirectUri;
    this.authTokenMethod = settings.authTokenMethod;
    this.authParamsLocation = settings.authParamsLocation;
    this.authorizationUri = settings.authorizationUri;
  }

  _restoreOauth2Auth(settings) {
    this.grantType = settings.type;
    this.clientId = settings.clientId;
    this.accessToken = settings.accessToken;
    this.scopes = settings.scopes;
    switch (settings.type) {
      case 'implicit':
        this.authorizationUri = settings.authorizationUri;
        break;
      case 'authorization_code':
        this.authorizationUri = settings.authorizationUri;
        this.clientSecret = settings.clientSecret;
        this.accessTokenUri = settings.accessTokenUri;
        break;
      case 'client_credentials':
        // The server flow.
        this.clientSecret = settings.clientSecret;
        this.accessTokenUri = settings.accessTokenUri;
        break;
      case 'password':
        // The server flow.
        this.username = settings.username;
        this.password = settings.password;
        this.accessTokenUri = settings.accessTokenUri;
        break;
      default:
        this.authorizationUri = settings.authorizationUri;
        this.clientSecret = settings.clientSecret;
        this.accessTokenUri = settings.accessTokenUri;
        this.username = settings.username;
        this.password = settings.password;
    }
  }
  /**
   * This method only works for OAuth 1 and OAuth 2 authorization methods.
   *
   * Authorizes the user by starting OAuth flow.
   *
   * @return {any}
   */
  authorize() {
    const type = normalizeType(this.type);
    switch (type) {
      case METHOD_OAUTH1: return this._authorizeOauth1();
      case METHOD_OAUTH2: return this[_authorizeOauth2]();
    }
  }

  _getEventTarget(e) {
    let target;
    if (e.composedPath) {
      target = e.composedPath()[0];
    } else if (e.path) {
      target = e.path[0];
    } else {
      target = e.target;
    }
    return target;
  }
  /**
   * Restores an item from a session store and assigns it to a local
   * property.
   * @param {String} sessionKey Session storage key
   * @param {String} localKey This component's property
   */
  _restoreSessionProperty(sessionKey, localKey) {
    if (!this[localKey]) {
      const value = sessionStorage.getItem(sessionKey);
      if (value) {
        this[localKey] = value;
      }
    }
  }
  /**
   * Stores a property in a session storage.
   * @param {String} sessionKey A storage key
   * @param {String} value Value to store
   */
  _storeSessionProperty(sessionKey, value) {
    if (!value) {
      return;
    }
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }
    sessionStorage.setItem(sessionKey, value);
  }

  render() {
    const { styles } = this;
    let tpl;
    const type = normalizeType(this.type);
    switch(type) {
      case METHOD_BASIC: tpl = this._renderBasicAuth(); break;
      case METHOD_NTLM: tpl = this._renderNtlmAuth(); break;
      case METHOD_DIGEST: tpl = this._renderDigestAuth(); break;
      case METHOD_OAUTH1: tpl = this._renderOauth1Auth(); break;
      case METHOD_OAUTH2: tpl = this._renderOauth2Auth(); break;
      default: tpl = '';
    }
    return html`
    <style>${styles}</style>
    ${tpl}
    `;
  }

  _renderInput(name, value, label, opts) {
    const {
      outlined,
      compatibility,
      readOnly,
      disabled
    } = this;
    opts = opts || {};
    opts.type = opts.type || 'text';
    if (opts.autocomplete === undefined) {
      opts.autocomplete = true;
    }
    return html`<anypoint-input
      .value="${value}"
      @input="${this[_inputHandler]}"
      name="${name}"
      type="${opts.type}"
      ?required="${opts.required}"
      ?autoValidate="${opts.autoValidate}"
      ?autocomplete="${opts.autocomplete}"
      .outlined="${outlined}"
      .compatibility="${compatibility}"
      .readOnly="${readOnly}"
      .disabled="${disabled}"
      .invalidMessage="${opts.invalidLabel}"
      class="${classMap(opts.classes)}"
      ?data-persistent="${opts.persistent}"
    >
      <label slot="label">${label}</label>
    </anypoint-input>`;
  }

  _renderPasswordInput(name, value, label, opts) {
    const {
      outlined,
      compatibility,
      readOnly,
      disabled
    } = this;
    opts = opts || {};
    if (opts.autocomplete === undefined) {
      opts.autocomplete = true;
    }
    return html`<anypoint-masked-input
      .value="${value}"
      @input="${this[_inputHandler]}"
      name="${name}"
      ?required="${opts.required}"
      ?autoValidate="${opts.autoValidate}"
      ?autocomplete="${opts.autocomplete}"
      .outlined="${outlined}"
      .compatibility="${compatibility}"
      .readOnly="${readOnly}"
      .disabled="${disabled}"
      .invalidMessage="${opts.invalidLabel}"
      class="${classMap(opts.classes)}"
      ?data-persistent="${opts.persistent}"
    >
      <label slot="label">${label}</label>
    </anypoint-masked-input>`;
  }

  _renderBasicAuth() {
    const {
      username,
      password,
    } = this;
    const uConfig = {
      required: true,
      autoValidate: true,
      invalidLabel: 'Username is required',
      classes: { block: true }
    };
    return html`
    <form autocomplete="on" class="basic-auth">
      ${this._renderInput('username', username, 'User name', uConfig)}
      ${this._renderPasswordInput('password', password, 'Password', {
        classes: { block: true }
      })}
    </form>`;
  }

  _renderNtlmAuth() {
    const {
      username,
      password,
      domain
    } = this;
    return html`
    <form autocomplete="on" class="ntlm-auth">
      ${this._renderInput('username', username, 'User name', {
        required: true,
        autoValidate: true,
        invalidLabel: 'Username is required',
        classes: { block: true }
      })}
      ${this._renderPasswordInput('password', password, 'Password', {
        classes: { block: true }
      })}
      ${this._renderInput('domain', domain, 'NT domain', {
        classes: { block: true }
      })}
    </form>`;
  }

  _renderDigestAuth() {
    const {
      username,
      password,
      realm,
      nonce,
      nc,
      opaque,
      cnonce
    } = this;
    return html`
    <form autocomplete="on" class="digest-auth">
      ${this._renderInput('username', username, 'User name', {
        required: true,
        autoValidate: true,
        invalidLabel: 'Username is required',
        classes: { block: true }
      })}
      ${this._renderPasswordInput('password', password, 'Password', {
        classes: { block: true }
      })}
      ${this._renderInput('realm', realm, 'Server issued realm', {
        required: true,
        autoValidate: true,
        invalidLabel: 'Realm is required',
        classes: { block: true }
      })}
      ${this._renderInput('nonce', nonce, 'Server issued nonce', {
        required: true,
        autoValidate: true,
        invalidLabel: 'Nonce is required',
        classes: { block: true }
      })}
      ${this._qopTemplate()}
      ${this._renderInput('nc', nc, 'Nonce count', {
        required: true,
        autoValidate: true,
        invalidLabel: 'Nonce count is required',
        classes: { block: true },
        type: 'number'
      })}
      ${this._hashAlgorithmTemplate()}
      ${this._renderInput('opaque', opaque, 'Server issued opaque string', {
        required: true,
        autoValidate: true,
        invalidLabel: 'Server issued opaque is required',
        classes: { block: true }
      })}
      ${this._renderInput('cnonce', cnonce, 'Client nounce', {
        required: true,
        autoValidate: true,
        invalidLabel: 'Client nounce is required',
        classes: { block: true }
      })}
    </form>`;
  }

  _renderOauth1Auth() {
    const {
      consumerKey,
      consumerSecret,
      token,
      tokenSecret,
      requestTokenUri,
      accessTokenUri,
      authorizationUri,
      redirectUri,
      realm,
      signatureMethods,
      _authorizing
    } = this;
    const hasSignatureMethods = !!(signatureMethods && signatureMethods.length);
    return html`<form autocomplete="on">
    ${this._oauth1TokenMethodTemplate()}
    ${this._oauth1ParamLocationTemplate()}
    ${this._renderPasswordInput('consumerKey', consumerKey, 'Consumer key', {
      required: true,
      autoValidate: true,
      invalidLabel: 'Consumer key is required',
    })}
    ${this._renderPasswordInput('consumerSecret', consumerSecret, 'Consumer secret')}
    ${this._renderPasswordInput('token', token, 'Token')}
    ${this._renderPasswordInput('tokenSecret', tokenSecret, 'Token secret')}
    ${this._renderInput('requestTokenUri', requestTokenUri, 'Request token URI')}
    ${this._renderInput('accessTokenUri', accessTokenUri, 'Token Authorization URI', {
      type: 'url'
    })}
    ${this._renderInput('authorizationUri', authorizationUri, 'User authorization dialog URI', {
      type: 'url'
    })}
    ${this._renderInput('redirectUri', redirectUri, 'Redirect URI', {
      type: 'url'
    })}
    ${this._oauth1TimestampTemplate()}
    ${this._oauth1NonceTemplate()}
    ${this._renderPasswordInput('realm', realm, 'Realm')}
    ${hasSignatureMethods ? this._oauth1SignatureMethodsTemplate() : ''}
    </form>

    <div class="authorize-actions">
      <anypoint-button
        ?disabled="${_authorizing}"
        class="auth-button"
        @click="${this.authorize}">Authorize</anypoint-button>
      <paper-spinner .active="${_authorizing}"></paper-spinner>
    </div>`;
  }

  _renderOauth2Auth() {
    const {
      oauth2ClientIdRendered,
      clientId,
      oauth2ClientSecretRendered,
      clientSecret,
      isAdvanced,
      advancedOpened,
      readOnly,
      accessToken,
    } = this;
    return html`<form autocomplete="on">
    ${this[_oauth2GrantTypeTemplate]()}
    ${oauth2ClientIdRendered ? this._renderPasswordInput('clientId', clientId, 'Client id', {
      required: true,
      autoValidate: true,
      invalidLabel: 'Client ID is required for this grant type',
      persistent: true,
      type: 'url'
    }) : ''}
    ${oauth2ClientSecretRendered ? this._renderPasswordInput('clientSecret', clientSecret, 'Client secret', {
      required: true,
      autoValidate: true,
      invalidLabel: 'Client secret is required for this grant type',
      persistent: true,
      type: 'url'
    }) : ''}
    ${this[_oauth2CustomPropertiesTemplate]()}
    ${isAdvanced ? html`
      <div class="adv-toggle">
        <div class="adv-toggle">
          <anypoint-checkbox
            class="adv-settings-input"
            .checked="${advancedOpened}"
            @change="${this._advHandler}"
            .disabled="${readOnly}"
          >Advanced settings</anypoint-checkbox>
        </div>
      </div>` : ''}
    ${this[_oauth2AdvancedTemplate]()}
    </form>
    ${this[_oauth2RedirectTemplate]()}
    ${accessToken ? this[_oauth2TokenTemplate]() : this[_oath2AuthorizeTemplate]()}
    <clipboard-copy></clipboard-copy>`;
  }

  [_oauth2CustomPropertiesTemplate]() {}
}
