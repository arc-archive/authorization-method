import { html } from 'lit-element';
import { dedupeMixin } from '@open-wc/dedupe-mixin';
import { cached } from '@advanced-rest-client/arc-icons/ArcIcons.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import '@anypoint-web-components/anypoint-input/anypoint-input.js';
import { notifyChange, selectionHandler, inputHandler } from './Utils.js';
import { passwordTemplate, inputTemplate } from './CommonTemplates.js';

/** @typedef {import('./AuthorizationMethod').AuthorizationMethod} AuthorizationMethod */

/* eslint-disable no-plusplus */

const oauth1ErrorHandler = Symbol('oauth1ErrorHandler');
const oauth1tokenResponseHandler = Symbol('oauth1tokenResponseHandler');
const oauth1ParamLocationTemplate = Symbol('oauth1ParamLocationTemplate');
const oauth1TokenMethodTemplate = Symbol('oauth1TokenMethodTemplate');
const oauth1TimestampTemplate = Symbol('oauth1TimestampTemplate');
const oauth1NonceTemplate = Symbol('oauth1NonceTemplate');
const oauth1SignatureMethodsTemplate = Symbol('oauth1SignatureMethodsTemplate');
const timestampHandler = Symbol('timestampHandler');
const nonceHandler = Symbol('nonceHandler');
const genTimestamp = Symbol('genTimestamp');
const genNonce = Symbol('genNonce');
export const serializeOauth1Auth = Symbol('serializeOauth1Auth');
export const restoreOauth1Auth = Symbol('restoreOauth1Auth');
export const setOauth1Defaults = Symbol('setOauth1Defaults');
export const authorizeOauth1 = Symbol('authorizeOauth1');
export const renderOauth1Auth = Symbol('renderOauth1Auth');
export const clearOauth1Auth = Symbol('clearOauth1Auth');

export const defaultSignatureMethods = ['HMAC-SHA1', 'RSA-SHA1', 'PLAINTEXT'];

/**
 * @typedef {Object} Oauth1Params
 * @property {string} consumerKey
 * @property {string} consumerSecret
 * @property {string} token
 * @property {string} tokenSecret
 * @property {string|number} timestamp
 * @property {string} nonce
 * @property {string} realm
 * @property {string} signatureMethod
 * @property {string} requestTokenUri
 * @property {string} accessTokenUri
 * @property {string} redirectUri
 * @property {string} authParamsLocation
 * @property {string} authTokenMethod
 * @property {string} authorizationUri
 * @property {string} type - always set ot oauth1
 */

/**
 * @param {AuthorizationMethod} base
 */
const mxFunction = (base) => {
  class Oauth1MethodMixinImpl extends base {
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
        signatureMethods: { type: Array },
      };
    }

    constructor() {
      super();
      this[oauth1ErrorHandler] = this[oauth1ErrorHandler].bind(this);
      this[oauth1tokenResponseHandler] = this[oauth1tokenResponseHandler].bind(
        this
      );
    }

    _attachListeners(node) {
      super._attachListeners(node);
      node.addEventListener('oauth1-error', this[oauth1ErrorHandler]);
      node.addEventListener(
        'oauth1-token-response',
        this[oauth1tokenResponseHandler]
      );
    }

    _detachListeners(node) {
      super._detachListeners(node);
      node.removeEventListener('oauth1-error', this[oauth1ErrorHandler]);
      node.removeEventListener(
        'oauth1-token-response',
        this[oauth1tokenResponseHandler]
      );
    }

    [setOauth1Defaults]() {
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
        this.signatureMethods = defaultSignatureMethods;
      }
      if (!this.timestamp) {
        this[genTimestamp](true);
      }
      if (!this.nonce) {
        this[genNonce](true);
      }
    }

    /**
     * Clears OAuth 1 auth settings
     */
    [clearOauth1Auth]() {
      this.consumerKey = '';
      this.consumerSecret = '';
      this.token = '';
      this.tokenSecret = '';
      this.timestamp = '';
      this.nonce = '';
      this.realm = '';
      this.signatureMethod = '';
      this.requestTokenUri = '';
      this.accessTokenUri = '';
      this.authTokenMethod = '';
      this.authParamsLocation = '';
      this.authorizationUri = '';
      this[setOauth1Defaults]();
    }

    /**
     * Serialized input values
     * @return {Oauth1Params} An object with user input
     */
    [serializeOauth1Auth]() {
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

    /**
     * Resotres previously serialized authentication values.
     * @param {Oauth1Params} settings Previously serialized values
     */
    [restoreOauth1Auth](settings) {
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

    /**
     * Handles OAuth1 authorization errors.
     */
    [oauth1ErrorHandler]() {
      this._authorizing = false;
    }

    /**
     * Handler for the `oauth1-token-response` custom event.
     * Sets `token` and `tokenSecret` properties from the event.
     *
     * @param {CustomEvent} e
     */
    [oauth1tokenResponseHandler](e) {
      this._authorizing = false;
      this.token = e.detail.oauth_token;
      this.tokenSecret = e.detail.oauth_token_secret;
      notifyChange(this);
    }

    /**
     * Sets timestamp in seconds
     * @param {Boolean} ignoreChange Ignores change bnotification when set
     */
    [genTimestamp](ignoreChange) {
      const t = Math.floor(Date.now() / 1000);
      this.timestamp = t;
      if (!ignoreChange) {
        notifyChange(this);
      }
    }

    [timestampHandler]() {
      this[genTimestamp](false);
    }

    /**
     * Sets autogenerated nocne
     * @param {Boolean} ignoreChange Ignores change bnotification when set
     */
    [genNonce](ignoreChange) {
      const result = [];
      const chrs =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const chrsLength = chrs.length;
      const length = 32;
      for (let i = 0; i < length; i++) {
        result[result.length] = chrs[Math.floor(Math.random() * chrsLength)];
      }
      this.nonce = result.join('');
      if (!ignoreChange) {
        notifyChange(this);
      }
    }

    [nonceHandler]() {
      this[genNonce](false);
    }

    /**
     * Sends the `oauth1-token-requested` event.
     * @return {Boolean} True if event was sent. Can be false if event is not
     * handled or when the form is invalid.
     */
    [authorizeOauth1]() {
      if (!this.validate()) {
        return false;
      }
      this._authorizing = true;
      const detail = {};
      /* istanbul ignore else */
      if (this.consumerKey) {
        detail.consumerKey = this.consumerKey;
      }
      /* istanbul ignore else */
      if (this.consumerSecret) {
        detail.consumerSecret = this.consumerSecret;
      }
      /* istanbul ignore else */
      if (this.token) {
        detail.token = this.token;
      }
      /* istanbul ignore else */
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
      /* istanbul ignore else */
      if (this.realm) {
        detail.realm = this.realm;
      }
      /* istanbul ignore else */
      if (this.signatureMethod) {
        detail.signatureMethod = this.signatureMethod;
      }
      /* istanbul ignore else */
      if (this.requestTokenUri) {
        detail.requestTokenUri = this.requestTokenUri;
      }
      /* istanbul ignore else */
      if (this.accessTokenUri) {
        detail.accessTokenUri = this.accessTokenUri;
      }
      /* istanbul ignore else */
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
      /* istanbul ignore else */
      if (this.authorizationUri) {
        detail.authorizationUri = this.authorizationUri;
      }
      detail.type = 'oauth1';
      this.dispatchEvent(
        new CustomEvent('oauth1-token-requested', {
          detail,
          bubbles: true,
          composed: true,
          cancelable: true,
        })
      );
      return true;
    }

    [oauth1TokenMethodTemplate]() {
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
          @selected-changed="${this[selectionHandler]}"
          data-name="authTokenMethod"
          .outlined="${outlined}"
          .compatibility="${compatibility}"
          .readOnly="${readOnly}"
          .disabled="${disabled}"
          attrforselected="data-value"
        >
          <anypoint-item .compatibility="${compatibility}" data-value="GET"
            >GET</anypoint-item
          >
          <anypoint-item .compatibility="${compatibility}" data-value="POST"
            >POST</anypoint-item
          >
        </anypoint-listbox>
      </anypoint-dropdown-menu>`;
    }

    [oauth1ParamLocationTemplate]() {
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
          @selected-changed="${this[selectionHandler]}"
          data-name="authParamsLocation"
          .outlined="${outlined}"
          .compatibility="${compatibility}"
          .readOnly="${readOnly}"
          .disabled="${disabled}"
          attrforselected="data-value"
        >
          <anypoint-item
            .compatibility="${compatibility}"
            data-value="querystring"
            >Query string</anypoint-item
          >
          <anypoint-item
            .compatibility="${compatibility}"
            data-value="authorization"
            >Authorization header</anypoint-item
          >
        </anypoint-listbox>
      </anypoint-dropdown-menu>`;
    }

    [oauth1TimestampTemplate]() {
      const { outlined, compatibility, readOnly, disabled, timestamp } = this;
      return html`<anypoint-input
        required
        autovalidate
        name="timestamp"
        .value="${timestamp}"
        @input="${this[inputHandler]}"
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
          @click="${this[timestampHandler]}"
        >
          <span class="icon">${cached}</span>
        </anypoint-icon-button>
      </anypoint-input>`;
    }

    [oauth1NonceTemplate]() {
      const { outlined, compatibility, readOnly, disabled, nonce } = this;
      return html`<anypoint-input
        required
        autovalidate
        name="nonce"
        .value="${nonce}"
        @input="${this[inputHandler]}"
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
          @click="${this[nonceHandler]}"
        >
          <span class="icon">${cached}</span>
        </anypoint-icon-button>
      </anypoint-input>`;
    }

    [oauth1SignatureMethodsTemplate]() {
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
          @selected-changed="${this[selectionHandler]}"
          data-name="signatureMethod"
          .outlined="${outlined}"
          .compatibility="${compatibility}"
          .readOnly="${readOnly}"
          .disabled="${disabled}"
          attrforselected="data-value"
        >
          ${signatureMethods.map(
            (item) =>
              html`<anypoint-item
                .compatibility="${compatibility}"
                data-value="${item}"
                >${item}</anypoint-item
              >`
          )}
        </anypoint-listbox>
      </anypoint-dropdown-menu>`;
    }

    [renderOauth1Auth]() {
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
        _authorizing,
      } = this;
      const hasSignatureMethods = !!(
        signatureMethods && signatureMethods.length
      );
      return html`<form autocomplete="on" class="oauth1-auth">
          ${this[oauth1TokenMethodTemplate]()}
          ${this[oauth1ParamLocationTemplate]()}
          ${passwordTemplate(
            'consumerKey',
            consumerKey,
            'Consumer key',
            this[inputHandler],
            {
              required: true,
              autoValidate: true,
              invalidLabel: 'Consumer key is required',
            }
          )}
          ${passwordTemplate(
            'consumerSecret',
            consumerSecret,
            'Consumer secret',
            this[inputHandler]
          )}
          ${passwordTemplate('token', token, 'Token', this[inputHandler])}
          ${passwordTemplate(
            'tokenSecret',
            tokenSecret,
            'Token secret',
            this[inputHandler]
          )}
          ${inputTemplate(
            'requestTokenUri',
            requestTokenUri,
            'Request token URI',
            this[inputHandler]
          )}
          ${inputTemplate(
            'accessTokenUri',
            accessTokenUri,
            'Token Authorization URI',
            this[inputHandler],
            {
              type: 'url',
            }
          )}
          ${inputTemplate(
            'authorizationUri',
            authorizationUri,
            'User authorization dialog URI',
            this[inputHandler],
            {
              type: 'url',
            }
          )}
          ${inputTemplate(
            'redirectUri',
            redirectUri,
            'Redirect URI',
            this[inputHandler],
            {
              type: 'url',
            }
          )}
          ${this[oauth1TimestampTemplate]()} ${this[oauth1NonceTemplate]()}
          ${passwordTemplate('realm', realm, 'Realm', this[inputHandler])}
          ${hasSignatureMethods ? this[oauth1SignatureMethodsTemplate]() : ''}
        </form>

        <div class="authorize-actions">
          <anypoint-button
            ?disabled="${_authorizing}"
            class="auth-button"
            @click="${this.authorize}"
            >Authorize</anypoint-button
          >
          <paper-spinner .active="${_authorizing}"></paper-spinner>
        </div>`;
    }
  }
  return Oauth1MethodMixinImpl;
};
/**
 * A mixin that adds support for OAuth 1 method computations.
 *
 * @mixin
 */
export const Oauth1MethodMixin = dedupeMixin(mxFunction);
