import { html } from 'lit-element';
import {
  notifyChange,
} from './Utils.js';
/**
 * Mixin that adds support for Digest method computations
 *
 * @param {Class} superClass
 * @return {Class}
 */
export const DigestMethodMixin = (superClass) => class extends superClass {
  static get properties() {
    return {
      /**
       * Server issued realm for Digest authorization.
       *
       * Used in the following types:
       * - Digest
       */
      realm: { type: String },
      /**
       * Server issued nonce for Digest authorization.
       *
       * Used in the following types:
       * - Digest
       */
      nonce: { type: String },
      /**
       * The realm value for the digest response for Digest authorization.
       *
       * Used in the following types:
       * - Digest
       */
      algorithm: { type: String },
      /**
       * The quality of protection value for the digest response.
       * Either '', 'auth' or 'auth-int'
       *
       * Used in the following types:
       * - Digest
       */
      qop: { type: String },
      /**
       * Nonce count - increments with each request used with the same nonce
       *
       * Used in the following types:
       * - Digest
       */
      nc: { type: Number },
      /**
       * Client nonce
       *
       * Used in the following types:
       * - Digest
       */
      cnonce: { type: String },
      /**
       * A string of data specified by the server
       *
       * Used in the following types:
       * - Digest
       */
      opaque: { type: String },
      /**
       * Hashed response to server challenge
       *
       * Used in the following types:
       * - Digest
       */
      response: { type: String },
      /**
       * Request HTTP method
       *
       * Used in the following types:
       * - Digest
       */
      httpMethod: { type: String },
      /**
       * Current request URL.
       *
       * Used in the following types:
       * - Digest
       */
      requestUrl: { type: String },

      _requestUri: { type: String },
      /**
       * Current request body.
       *
       * Used in the following types:
       * - Digest
       */
      requestBody: { type: String }
    };
  }

  get requestUrl() {
    return this._requestUrl;
  }

  set requestUrl(value) {
    const old = this._requestUrl;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._requestUrl = value;
    this._processRequestUrl(value);
  }

  _processRequestUrl(value) {
    if (!value || typeof value !== 'string') {
      this._requestUri = undefined;
      notifyChange(this);
      return;
    }
    try {
      const url = new URL(value);
      value = url.pathname;
    } catch (_) {
      value = value.trum();
    }
    this._requestUri = value;
    notifyChange(this);
  }

  _setDigestDefaults() {
    if (!this.nc) {
      this.nc = 1;
    }
    if (!this.algorithm) {
      this.algorithm = 'MD5';
    }
    if (!this.cnonce) {
      this.cnonce = this.generateCnonce();
    }
  }

  /**
   * Generates the response header based on the parameters provided in the
   * form.
   *
   * See https://en.wikipedia.org/wiki/Digest_access_authentication#Overview
   *
   * @return {String} A response part of the authenticated digest request.
   */
  generateDigestResponse() {
    /* global CryptoJS */
    const HA1 = this._getHA1();
    const HA2 = this._getHA2();
    const ncString = ('00000000' + this.nc).slice(-8);
    let responseStr = HA1 + ':' + this.nonce;
    if (!this.qop) {
      responseStr += ':' + HA2;
    } else {
      responseStr += ':' + ncString + ':' + this.cnonce + ':' + this.qop + ':' + HA2;
    }
    return CryptoJS.MD5(responseStr).toString();
  }

  // Generates HA1 as defined in Digest spec.
  _getHA1() {
    let HA1param = this.username + ':' + this.realm + ':' + this.password;
    let HA1 = CryptoJS.MD5(HA1param).toString();

    if (this.algorithm === 'MD5-sess') {
      HA1param = HA1 + ':' + this.nonce + ':' + this.cnonce;
      HA1 = CryptoJS.MD5(HA1param).toString();
    }
    return HA1;
  }
  // Generates HA2 as defined in Digest spec.
  _getHA2() {
    let HA2param = this.httpMethod + ':' + this._requestUri;
    if (this.qop === 'auth-int') {
      HA2param += ':' + CryptoJS.MD5(this.requestBody).toString();
    }
    return CryptoJS.MD5(HA2param).toString();
  }
  /**
   * Generates client nonce for Digest authorization.
   *
   * @return {String} Generated client nonce.
   */
  generateCnonce() {
    const characters = 'abcdef0123456789';
    let token = '';
    for (let i = 0; i < 16; i++) {
      const randNum = Math.round(Math.random() * characters.length);
      token += characters.substr(randNum, 1);
    }
    return token;
  }

  _qopTemplate() {
    const {
      outlined,
      compatibility,
      readOnly,
      disabled
    } = this;
    return html`<anypoint-dropdown-menu
      .outlined="${outlined}"
      ?compatibility="${compatibility}"
      .readOnly="${readOnly}"
      .disabled="${disabled}"
      name="qop"
    >
      <label slot="label">Quality of protection</label>
      <anypoint-listbox
        slot="dropdown-content"
        .selected="${this.qop}"
        @selected-changed="${this._selectionHandler}"
        .outlined="${outlined}"
        ?compatibility="${compatibility}"
        .readOnly="${readOnly}"
        .disabled="${disabled}"
        attrforselected="data-qop"
      >
        <anypoint-item ?compatibility="${compatibility}" data-qop="auth">auth</anypoint-item>
        <anypoint-item ?compatibility="${compatibility}" data-qop="auth-int">auth-int</anypoint-item>
      </anypoint-listbox>
    </anypoint-dropdown-menu>`;
  }

  _hashAlgorithmTemplate() {
    const {
      outlined,
      compatibility,
      readOnly,
      disabled
    } = this;
    return html`<anypoint-dropdown-menu
      .outlined="${outlined}"
      ?compatibility="${compatibility}"
      .readOnly="${readOnly}"
      .disabled="${disabled}"
      name="algorithm"
    >
      <label slot="label">Hash algorithm</label>
      <anypoint-listbox
        slot="dropdown-content"
        .selected="${this.algorithm}"
        @selected-changed="${this._selectionHandler}"
        .outlined="${outlined}"
        ?compatibility="${compatibility}"
        .readOnly="${readOnly}"
        .disabled="${disabled}"
        attrforselected="data-algorithm">
        <anypoint-item ?compatibility="${compatibility}" data-algorithm="MD5">MD5</anypoint-item>
        <anypoint-item ?compatibility="${compatibility}" data-algorithm="MD5-sess">MD5-sess</anypoint-item>
      </anypoint-listbox>
    </anypoint-dropdown-menu>`;
  }
};
