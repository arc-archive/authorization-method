import { html } from 'lit-element';
import { cached } from '@advanced-rest-client/arc-icons/ArcIcons.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import '@anypoint-web-components/anypoint-input/anypoint-input.js';
import {
  notifyChange,
} from './Utils.js';

const _oauth1ErrorHandler = Symbol();
const _oauth1tokenResponseHandler = Symbol();
/**
 * Mixin that adds support for OAuth 1 method computations
 *
 * @param {Class} superClass
 * @return {Class}
 */
export const Oauth1MethodMixin = (superClass) => class extends superClass {
  static get properties() {
    return {
      /**
       * Client ID aka consumer key
       *
       * Used in the following types:
       * - OAuth 1
       */
      consumerKey: { type: String },
      /**
       * The client secret aka consumer secret
       *
       * Used in the following types:
       * - OAuth 1
       */
      consumerSecret: { type: String },
      /**
       * Oauth 1 token (from the oauth console)
       *
       * Used in the following types:
       * - OAuth 1
       */
      token: { type: String },
      /**
       * Oauth 1 token secret (from the oauth console).
       *
       * Used in the following types:
       * - OAuth 1
       */
      tokenSecret: { type: String },
      /**
       * Token request timestamp
       *
       * Used in the following types:
       * - OAuth 1
       */
      timestamp: { type: Number },
      /**
       * The nonce generated for this request
       *
       * Used in the following types:
       * - OAuth 1
       */
      nonce: { type: String },
      /**
       * Optional parameter, realm.
       *
       * Used in the following types:
       * - OAuth 1
       */
      realm: { type: String },
      /**
       * Signature method. Enum {`HMAC-SHA256`, `HMAC-SHA1`, `PLAINTEXT`}
       *
       * Used in the following types:
       * - OAuth 1
       */
      signatureMethod: { type: String },
      /**
       * OAuth1 endpoint to obtain request token to request user authorization.
       *
       * Used in the following types:
       * - OAuth 1
       */
      requestTokenUri: { type: String },
      /**
       * HTTP method to obtain authorization header.
       * Spec recommends POST
       *
       * Used in the following types:
       * - OAuth 1
       */
      authTokenMethod: { type: String },
      /**
       * A location of the OAuth 1 authorization parameters.
       * It can be either in the URL as a query string (`querystring` value)
       * or in the authorization header (`authorization`) value.
       *
       * Used in the following types:
       * - OAuth 1
       */
      authParamsLocation: { type: String },
      /**
       * List of currently support signature methods.
       * This can be updated when `amfSettings` property is set.
       *
       * Used in the following types:
       * - OAuth 1
       */
      signatureMethods: { type: Array }
    };
  }

  /**
   * Returns default list of signature methods for OAuth1
   */
  get oauth1defaultSignatureMethods() {
    return ['HMAC-SHA1', 'RSA-SHA1', 'PLAINTEXT'];
  }

  constructor() {
    super();
    this[_oauth1ErrorHandler] = this[_oauth1ErrorHandler].bind(this);
    this[_oauth1tokenResponseHandler] = this[_oauth1tokenResponseHandler].bind(this);
  }

  _attachListeners(node) {
    super._attachListeners(node);
    window.addEventListener('oauth1-error', this[_oauth1ErrorHandler]);
    window.addEventListener('oauth1-token-response', this[_oauth1tokenResponseHandler]);
  }

  _detachListeners(node) {
    super._detachListeners(node);
    window.removeEventListener('oauth1-error', this[_oauth1ErrorHandler]);
    window.removeEventListener('oauth1-token-response', this[_oauth1tokenResponseHandler]);
  }

  _setOauth1Defaults() {
    if (!this.signatureMethod) {
      this.signatureMethod = 'HMAC-SHA1';
    }
    if (!this.authTokenMethod) {
      this.authTokenMethod = 'POST';
    }
    if (!this.authParamsLocation) {
      this.authParamsLocation = 'authorization';
    }
    if (!this.signatureMethods) {
      this.signatureMethods = this.oauth1defaultSignatureMethods;
    }
    if (!this.timestamp) {
      this._genTimestamp(true);
    }
    if (!this.nonce) {
      this._genNonce(true);
    }
  }
  /**
   * Handles OAuth1 authorization errors.
   *
   * @param {CustomEvent} e
   */
  [_oauth1ErrorHandler]() {
    this._authorizing = false;
  }

  /**
   * Handler for the `oauth1-token-response` custom event.
   * Sets `token` and `tokenSecret` properties from the event.
   *
   * @param {CustomEvent} e
   */
  [_oauth1tokenResponseHandler](e) {
    this._authorizing = false;
    this.token = e.detail.oauth_token;
    this.tokenSecret = e.detail.oauth_token_secret;
    notifyChange(this);
  }
  /**
   * Sets timestamp in seconds
   * @param {Boolean} ignoreChange Ignores change bnotification when set
   */
  _genTimestamp(ignoreChange) {
    const t = Math.floor(Date.now() / 1000);
    this.timestamp = t;
    if (!ignoreChange) {
      notifyChange(this);
    }
  }

  _timestampHandler() {
    this._genTimestamp(false);
  }
  /**
   * Sets autogenerated nocne
   * @param {Boolean} ignoreChange Ignores change bnotification when set
   */
  _genNonce(ignoreChange) {
    const result = [];
    const chrs = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const chrsLength = chrs.length;
    const length = 32;
    for (let i = 0; i < length; i++) {
      result[result.length] = (chrs[Math.floor(Math.random() * chrsLength)]);
    }
    this.nonce = result.join('');
    if (!ignoreChange) {
      notifyChange(this);
    }
  }

  _nonceHandler() {
    this._genNonce(false);
  }
  /**
   * Sends the `oauth1-token-requested` event.
   * @return {Boolean} True if event was sent. Can be false if event is not
   * handled or when the form is invalid.
   */
  _authorizeOauth1() {
    this._authorizing = true;
    const detail = {};
    if (this.consumerKey) {
      detail.consumerKey = this.consumerKey;
    }
    if (this.consumerSecret) {
      detail.consumerSecret = this.consumerSecret;
    }
    if (this.token) {
      detail.token = this.token;
    }
    if (this.tokenSecret) {
      detail.tokenSecret = this.tokenSecret;
    }
    /* istanbul ignore else */
    if (this.timestamp) {
      detail.timestamp = this.timestamp;
    }
    /* istanbul ignore else */
    if (this.nonce) {
      detail.nonce = this.nonce;
    }
    if (this.realm) {
      detail.realm = this.realm;
    }
    /* istanbul ignore else */
    if (this.signatureMethod) {
      detail.signatureMethod = this.signatureMethod;
    }
    if (this.requestTokenUri) {
      detail.requestTokenUri = this.requestTokenUri;
    }
    if (this.accessTokenUri) {
      detail.accessTokenUri = this.accessTokenUri;
    }
    if (this.redirectUri) {
      detail.redirectUri = this.redirectUri;
    }
    /* istanbul ignore else */
    if (this.authParamsLocation) {
      detail.authParamsLocation = this.authParamsLocation;
    }
    /* istanbul ignore else */
    if (this.authTokenMethod) {
      detail.authTokenMethod = this.authTokenMethod;
    }
    if (this.authorizationUri) {
      detail.authorizationUri = this.authorizationUri;
    }
    detail.type = 'oauth1';
    this.dispatchEvent(new CustomEvent('oauth1-token-requested', {
      detail,
      bubbles: true,
      composed: true,
      camcelable: true
    }));
    return true;
  }

  _oauth1TokenMethodTemplate() {
    const {
      outlined,
      compatibility,
      readOnly,
      disabled,
      authTokenMethod,
    } = this;
    return html`<anypoint-dropdown-menu
      name="authTokenMethod"
      required
      .outlined="${outlined}"
      .compatibility="${compatibility}"
      .readOnly="${readOnly}"
      .disabled="${disabled}"
    >
      <label slot="label">Authorization token method</label>
      <anypoint-listbox
        slot="dropdown-content"
        .selected="${authTokenMethod}"
        @selected-changed="${this._selectionHandler}"
        data-name="authTokenMethod"
        .outlined="${outlined}"
        .compatibility="${compatibility}"
        .readOnly="${readOnly}"
        .disabled="${disabled}"
        attrforselected="data-value"
      >
        <anypoint-item .compatibility="${compatibility}" data-value="GET">GET</anypoint-item>
        <anypoint-item .compatibility="${compatibility}" data-value="POST">POST</anypoint-item>
      </anypoint-listbox>
    </anypoint-dropdown-menu>`;
  }

  _oauth1ParamLocationTemplate() {
    const {
      outlined,
      compatibility,
      readOnly,
      disabled,
      authParamsLocation,
    } = this;
    return html`<anypoint-dropdown-menu
      required
      name="authParamsLocation"
      .outlined="${outlined}"
      .compatibility="${compatibility}"
      .readOnly="${readOnly}"
      .disabled="${disabled}"
    >
      <label slot="label">Oauth parameters location</label>
      <anypoint-listbox
        slot="dropdown-content"
        .selected="${authParamsLocation}"
        @selected-changed="${this._selectionHandler}"
        data-name="authParamsLocation"
        .outlined="${outlined}"
        .compatibility="${compatibility}"
        .readOnly="${readOnly}"
        .disabled="${disabled}"
        attrforselected="data-value"
      >
        <anypoint-item .compatibility="${compatibility}" data-value="querystring">Query string</anypoint-item>
        <anypoint-item .compatibility="${compatibility}"
          data-value="authorization">Authorization header</anypoint-item>
      </anypoint-listbox>
    </anypoint-dropdown-menu>`;
  }

  _oauth1TimestampTemplate() {
    const {
      outlined,
      compatibility,
      readOnly,
      disabled,
      timestamp,
    } = this;
    return html`<anypoint-input
      required
      autovalidate
      name="timestamp"
      .value="${timestamp}"
      @input="${this._inputHandler}"
      type="number"
      autocomplete="on"
      .outlined="${outlined}"
      .compatibility="${compatibility}"
      .readOnly="${readOnly}"
      .disabled="${disabled}"
      invalidmessage="Timestamp is required"
    >
      <label slot="label">Timestamp</label>
      <anypoint-icon-button
        slot="suffix"
        title="Regenerate timestamp"
        aria-label="Press to regenerate timestamp"
        @click="${this._timestampHandler}"
      >
        <span class="icon">${cached}</span>
      </anypoint-icon-button>
    </anypoint-input>`;
  }

  _oauth1NonceTemplate() {
    const {
      outlined,
      compatibility,
      readOnly,
      disabled,
      nonce,
    } = this;
    return html`<anypoint-input
      required
      autovalidate
      name="nonce"
      .value="${nonce}"
      @input="${this._inputHandler}"
      type="text"
      autocomplete="on"
      .outlined="${outlined}"
      .compatibility="${compatibility}"
      .readOnly="${readOnly}"
      .disabled="${disabled}"
      invalidmessage="Nonce is required"
    >
      <label slot="label">Nonce</label>
      <anypoint-icon-button
        slot="suffix"
        title="Regenerate nonce"
        aria-label="Press to regenerate nonce"
        @click="${this._nonceHandler}"
      >
        <span class="icon">${cached}</span>
      </anypoint-icon-button>
    </anypoint-input>`;
  }

  _oauth1SignatureMethodsTemplate() {
    const {
      outlined,
      compatibility,
      readOnly,
      disabled,
      signatureMethod,
      signatureMethods,
    } = this;
    return html`<anypoint-dropdown-menu
      required
      name="signatureMethod"
      .outlined="${outlined}"
      .compatibility="${compatibility}"
      .readOnly="${readOnly}"
      .disabled="${disabled}"
    >
      <label slot="label">Signature method</label>
      <anypoint-listbox
        slot="dropdown-content"
        .selected="${signatureMethod}"
        @selected-changed="${this._selectionHandler}"
        data-name="signatureMethod"
        .outlined="${outlined}"
        .compatibility="${compatibility}"
        .readOnly="${readOnly}"
        .disabled="${disabled}"
        attrforselected="data-value">
        ${signatureMethods.map((item) =>
      html`<anypoint-item .compatibility="${compatibility}" data-value="${item}">${item}</anypoint-item>`)}
      </anypoint-listbox>
    </anypoint-dropdown-menu>`;
  }
};
