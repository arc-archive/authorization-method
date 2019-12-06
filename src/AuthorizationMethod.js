// @ts-check
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
import { EventsTargetMixin } from '@advanced-rest-client/events-target-mixin/events-target-mixin.js';

import {
  BasicMethodMixin,
  _serializeBasicAuth,
  _restoreBasicAuth,
  _renderBasicAuth,
} from './BasicMethodMixin.js';
import {
  NtlmMethodMixin,
  _serializeNtlmAuth,
  _restoreNtlmAuth,
  _renderNtlmAuth,
} from './NtlmMethodMixin.js';
import {
  DigestMethodMixin,
  _renderDigestAuth,
  _setDigestDefaults,
  _serializeDigestAuth,
  _restoreDigestAuth,
} from './DigestMethodMixin.js';
import {
  Oauth1MethodMixin,
  _setOauth1Defaults,
  _restoreOauth1Auth,
  _serializeOauth1Auth,
  _renderOauth1Auth,
} from './Oauth1MethodMixin.js';
import {
  Oauth2MethodMixin,
  _setOauth2Defaults,
  _renderOauth2Auth,
  _restoreOauth2Auth,
  _serializeOauth2Auth,
} from './Oauth2MethodMixin.js';
import { validateForm } from './Validation.js';
import {
  normalizeType,
  METHOD_BASIC,
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
        BasicMethodMixin(
          EventsTargetMixin(AuthorizationBase)))))) {

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
      case METHOD_DIGEST: return this[_setDigestDefaults]();
      case METHOD_OAUTH1: return this[_setOauth1Defaults]();
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
      case METHOD_BASIC: return this[_serializeBasicAuth]();
      case METHOD_NTLM: return this[_serializeNtlmAuth]();
      case METHOD_DIGEST: return this[_serializeDigestAuth]();
      case METHOD_OAUTH1: return this[_serializeOauth1Auth]();
      case METHOD_OAUTH2: return this[_serializeOauth2Auth]();
      default: return '';
    }
  }
  /**
   * Validates current method.
   * @return {Boolean}
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
      case METHOD_BASIC: return this[_restoreBasicAuth](settings);
      case METHOD_NTLM: return this[_restoreNtlmAuth](settings);
      case METHOD_DIGEST: return this[_restoreDigestAuth](settings);
      case METHOD_OAUTH1: return this[_restoreOauth1Auth](settings);
      case METHOD_OAUTH2: return this[_restoreOauth2Auth](settings);
      default: return '';
    }
  }

  render() {
    const { styles } = this;
    let tpl;
    const type = normalizeType(this.type);
    switch(type) {
      case METHOD_BASIC: tpl = this[_renderBasicAuth](); break;
      case METHOD_NTLM: tpl = this[_renderNtlmAuth](); break;
      case METHOD_DIGEST: tpl = this[_renderDigestAuth](); break;
      case METHOD_OAUTH1: tpl = this[_renderOauth1Auth](); break;
      case METHOD_OAUTH2: tpl = this[_renderOauth2Auth](); break;
      default: tpl = '';
    }
    return html`
    <style>${styles}</style>
    ${tpl}
    `;
  }
}
