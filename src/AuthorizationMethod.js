import { html } from 'lit-element';
import authStyles from './CommonStyles.js';
import '@anypoint-web-components/anypoint-input/anypoint-input.js';
import '@anypoint-web-components/anypoint-input/anypoint-masked-input.js';
import '@anypoint-web-components/anypoint-dropdown-menu/anypoint-dropdown-menu.js';
import '@anypoint-web-components/anypoint-listbox/anypoint-listbox.js';
import '@anypoint-web-components/anypoint-item/anypoint-item.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@advanced-rest-client/clipboard-copy/clipboard-copy.js';
import '@polymer/paper-spinner/paper-spinner.js';

import {
  BasicMethodMixin,
  serializeBasicAuth,
  restoreBasicAuth,
  renderBasicAuth,
} from './BasicMethodMixin.js';
import {
  BearerMethodMixin,
  serializeBearerAuth,
  restoreBearerAuth,
  renderBearerAuth,
} from './BearerMethodMixin.js';
import {
  NtlmMethodMixin,
  serializeNtlmAuth,
  restoreNtlmAuth,
  renderNtlmAuth,
} from './NtlmMethodMixin.js';
import {
  DigestMethodMixin,
  renderDigestAuth,
  setDigestDefaults,
  serializeDigestAuth,
  restoreDigestAuth,
} from './DigestMethodMixin.js';
import {
  Oauth1MethodMixin,
  setOauth1Defaults,
  restoreOauth1Auth,
  serializeOauth1Auth,
  renderOauth1Auth,
} from './Oauth1MethodMixin.js';
import {
  Oauth2MethodMixin,
  setOauth2Defaults,
  renderOauth2Auth,
  restoreOauth2Auth,
  serializeOauth2Auth,
} from './Oauth2MethodMixin.js';
import { validateForm } from './Validation.js';
import {
  normalizeType,
  METHOD_BASIC,
  METHOD_BEARER,
  METHOD_NTLM,
  METHOD_DIGEST,
  METHOD_OAUTH1,
  METHOD_OAUTH2,
} from './Utils.js';

import {
  AuthorizationBase,
  typeChangedSymbol,
} from './AuthorizationBase.js';


/**
 * An element that renders various authorization methods.
 *
 * ## Development
 *
 * The element mixes in multimple mixins from `src/` directory.
 * Each mixin support an authorization method. When selection change (the `type`
 * property) a render function from correcponding mixin is called.
 *
 * @extends AuthorizationBase
 * @mixes Oauth2MethodMixin
 * @mixes Oauth1MethodMixin
 * @mixes DigestMethodMixin
 * @mixes BasicMethodMixin
 * @mixes NtlmMethodMixin
 */
export class AuthorizationMethod extends Oauth2MethodMixin(
  Oauth1MethodMixin(
    DigestMethodMixin(
      NtlmMethodMixin(
        BearerMethodMixin(
          BasicMethodMixin(AuthorizationBase)))))) {

  get styles() {
    return authStyles;
  }

  static get properties() {
    return {
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
       * True when currently authorizing the user.
       *
       * Used in the following types:
       * - OAuth 1
       * - OAuth 2
       */
      _authorizing: { type: Boolean },
      /**
       * Oauth 1 or Bearer token (from the oauth console or received from auth server)
       *
       * Used in the following types:
       * - OAuth 1
       * - bearer
       */
      token: { type: String },
    };
  }
  /**
   * Used in the following types:
   * - OAuth 1
   * - OAuth 2
   *
   * @return {Boolean} True when currently authorizing the user.
   */
  get authorizing() {
    return this._authorizing || false;
  }

  connectedCallback() {
    super.connectedCallback();
    this[typeChangedSymbol](this.type);
  }

  [typeChangedSymbol](type) {
    type = normalizeType(type);
    switch (type) {
      case METHOD_DIGEST: return this[setDigestDefaults]();
      case METHOD_OAUTH1: return this[setOauth1Defaults]();
      case METHOD_OAUTH2: return this[setOauth2Defaults]();
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
      case METHOD_BASIC: return this[serializeBasicAuth]();
      case METHOD_BEARER: return this[serializeBearerAuth]();
      case METHOD_NTLM: return this[serializeNtlmAuth]();
      case METHOD_DIGEST: return this[serializeDigestAuth]();
      case METHOD_OAUTH1: return this[serializeOauth1Auth]();
      case METHOD_OAUTH2: return this[serializeOauth2Auth]();
      default: return '';
    }
  }
  /**
   * Validates current method.
   * @return {boolean}
   */
  validate() {
    return validateForm(this);
  }

  /**
   * Restores previously serialized settings.
   * A method type must be selected before calling this function.
   *
   * @param {Object} settings Depends on current type.
   * @return {any}
   */
  restore(settings) {
    const type = normalizeType(this.type);
    switch(type) {
      case METHOD_BASIC: return this[restoreBasicAuth](settings);
      case METHOD_BEARER: return this[restoreBearerAuth](settings);
      case METHOD_NTLM: return this[restoreNtlmAuth](settings);
      case METHOD_DIGEST: return this[restoreDigestAuth](settings);
      case METHOD_OAUTH1: return this[restoreOauth1Auth](settings);
      case METHOD_OAUTH2: return this[restoreOauth2Auth](settings);
      default: return '';
    }
  }

  render() {
    const { styles } = this;
    let tpl;
    const type = normalizeType(this.type);
    switch(type) {
      case METHOD_BASIC: tpl = this[renderBasicAuth](); break;
      case METHOD_BEARER: tpl = this[renderBearerAuth](); break;
      case METHOD_NTLM: tpl = this[renderNtlmAuth](); break;
      case METHOD_DIGEST: tpl = this[renderDigestAuth](); break;
      case METHOD_OAUTH1: tpl = this[renderOauth1Auth](); break;
      case METHOD_OAUTH2: tpl = this[renderOauth2Auth](); break;
      default: tpl = '';
    }
    return html`
    <style>${styles}</style>
    ${tpl}
    `;
  }
}
