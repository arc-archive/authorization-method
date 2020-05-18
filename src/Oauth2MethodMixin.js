import { html } from 'lit-element';
import { dedupeMixin } from '@open-wc/dedupe-mixin';
import '@advanced-rest-client/oauth2-scope-selector/oauth2-scope-selector.js';
import '@anypoint-web-components/anypoint-switch/anypoint-switch.js';
import { notifyChange, selectionHandler, inputHandler } from './Utils.js';
import { passwordTemplate, inputTemplate } from './CommonTemplates.js';

/** @typedef {import('./AuthorizationMethod').AuthorizationMethod} AuthorizationMethod */

/* eslint-disable no-plusplus */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */

/** Functions */
const _oauth2ErrorHandler = Symbol('oauth2ErrorHandler');
const _tokenSuccessHandler = Symbol('tokenSuccessHandler');
const _clickCopyAction = Symbol('clickCopyAction');
const _scopesChanged = Symbol('scopesChanged');
const _oauth2RedirectTemplate = Symbol('oauth2RedirectTemplate');
const _oauth2GrantTypeTemplate = Symbol('oauth2GrantTypeTemplate');
const _oauth2AdvancedTemplate = Symbol('oauth2AdvancedTemplate');
const _oath2AuthorizeTemplate = Symbol('oath2AuthorizeTemplate');
const _oauth2TokenTemplate = Symbol('oauth2TokenTemplate');
const _advHandler = Symbol('advHandler');
const readUrlValue = Symbol('readUrlValue');
export const setOauth2Defaults = Symbol('setOauth2Defaults');
export const authorizeOauth2 = Symbol('authorizeOauth2');
export const renderOauth2Auth = Symbol('renderOauth2Auth');
export const restoreOauth2Auth = Symbol('restoreOauth2Auth');
export const serializeOauth2Auth = Symbol('serializeOauth2Auth');
export const oauth2CustomPropertiesTemplate = Symbol(
  'oauth2CustomPropertiesTemplate'
);
export const autoHide = Symbol('autoHide');
export const clearOauth2Auth = Symbol('clearOauth2Auth');

/**
 * List of OAuth 2.0 default grant types.
 * This list can be extended by custom grants
 *
 * @return {Array<Object>} List of objects with `type` and `label`
 * properties.
 */
export const oauth2GrantTypes = [
  {
    type: 'implicit',
    label: 'Access token (browser flow)',
  },
  {
    type: 'authorization_code',
    label: 'Authorization code (server flow)',
  },
  {
    type: 'client_credentials',
    label: 'Client credentials',
  },
  {
    type: 'password',
    label: 'Password',
  },
];

const makeNodeSelection = (node) => {
  const body = /** @type {HTMLBodyElement} */ (document.body);
  /* istanbul ignore if */
  // @ts-ignore
  if (body.createTextRange) {
    // @ts-ignore
    const range = body.createTextRange();
    range.moveToElementText(node);
    range.select();
  } else if (window.getSelection) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNode(node);
    selection.removeAllRanges();
    selection.addRange(range);
  }
};

/**
 * A handler for `focus` event on a label that contains text and
 * should be coppied to clipboard when user is interacting with it.
 *
 * @param {KeyboardEvent} e
 */
const selectFocusable = (e) => {
  const node = /** @type {HTMLElement} */ (e.target);
  makeNodeSelection(node);
};

const errorTemplate = (msg) => {
  return html`<p class="error-message">⚠ ${msg}</p>`;
};

/**
 * @typedef {Object} Oauth2Params
 * @property {string} grantType - OAuth 2 grant type
 * @property {string} type - The same as `grantType`, used fpor compatibility.
 * @property {string=} clientId - Registered client ID
 * @property {string=} clientSecret - Registered client secret
 * @property {string=} accessToken - Current access token
 * @property {String[]=} scopes - List of token scopes. Can be undefined
 * @property {string=} password - User password value
 * @property {string=} username - User name value
 * @property {string=} authorizationUri - User authorization URI
 * @property {string=} accessTokenUri - Token exchange URI
 * @property {string=} state - Generated state parameter for current request
 */

/**
 * @param {AuthorizationMethod} base
 */
const mxFunction = (base) => {
  class Oauth2MethodMixinImpl extends base {
    /**
     * @return {Boolean} Computed value, true if the grant type is a cutom definition.
     */
    get isCustomGrant() {
      const { grantType } = this;
      return (
        !!grantType &&
        [
          'implicit',
          'authorization_code',
          'client_credentials',
          'password',
        ].indexOf(grantType) === -1
      );
    }

    get clientIdRequired() {
      const { grantType } = this;
      return ['client_credentials', 'password'].indexOf(grantType) === -1;
    }

    get oauth2ClientSecretRendered() {
      const { grantType, isCustomGrant } = this;
      return (
        isCustomGrant ||
        (!!grantType &&
          ['authorization_code', 'client_credentials', 'password'].indexOf(
            grantType
          ) !== -1)
      );
    }

    get oauth2ClientSecretRequired() {
      const { grantType } = this;
      return ['authorization_code'].indexOf(grantType) !== -1;
    }

    get oauth2AuthorizationUriRendered() {
      const { grantType, isCustomGrant } = this;
      return (
        isCustomGrant ||
        (!!grantType &&
          ['implicit', 'authorization_code'].indexOf(grantType) !== -1)
      );
    }

    get oauth2AccessTokenUriRendered() {
      const { grantType, isCustomGrant } = this;
      return (
        isCustomGrant ||
        (!!grantType &&
          ['client_credentials', 'authorization_code', 'password'].indexOf(
            grantType
          ) !== -1)
      );
    }

    get oauth2PasswordRendered() {
      const { grantType, isCustomGrant } = this;
      return (
        isCustomGrant || (!!grantType && ['password'].indexOf(grantType) !== -1)
      );
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

        /**
         * A base URI to use to construct correct URLs to authorization endpoints.
         * The UI will present authorization endpoints as provided by the user
         * or attributes. However, if the paths are relative (must start with '/')
         * then base URI is added to the path.
         */
        baseUri: { type: String },

        /**
         * An error message returned by the authorizartion.
         * It renders error dialog when an error ocurred. It is automaticzally cleared
         * when the user request the token again.
         */
        lastErrorMessage: { type: String },
      };
    }

    /**
     * @return {string|null} Last generated state or null of not generated.
     */
    get lastState() {
      return this._lastState || null;
    }

    constructor() {
      super();
      this[_oauth2ErrorHandler] = this[_oauth2ErrorHandler].bind(this);
      this[_tokenSuccessHandler] = this[_tokenSuccessHandler].bind(this);
    }

    _attachListeners(node) {
      super._attachListeners(node);
      node.addEventListener('oauth2-error', this[_oauth2ErrorHandler]);
      node.addEventListener(
        'oauth2-token-response',
        this[_tokenSuccessHandler]
      );
    }

    _detachListeners(node) {
      super._detachListeners(node);
      node.removeEventListener('oauth2-error', this[_oauth2ErrorHandler]);
      node.removeEventListener(
        'oauth2-token-response',
        this[_tokenSuccessHandler]
      );
    }

    /**
     * Restores previously serialized values
     * @param {Oauth2Params} settings
     */
    [restoreOauth2Auth](settings) {
      const type = settings.grantType || settings.type;
      this.grantType = type;
      this.clientId = settings.clientId;
      this.accessToken = settings.accessToken;
      this.scopes = settings.scopes;
      switch (type) {
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
          this.clientSecret = settings.clientSecret;
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
     * Serializes OAuth2 parameters into a configuration object.
     * @return {Oauth2Params}
     */
    [serializeOauth2Auth]() {
      const { grantType } = this;
      const detail = {
        type: grantType,
        grantType,
        clientId: this.clientId,
        accessToken: this.accessToken || '',
        tokenType: this.tokenType,
        scopes: this.scopes,
        deliveryMethod: this.oauthDeliveryMethod,
        deliveryName: this.oauthDeliveryName,
      };

      switch (grantType) {
        case 'implicit':
          // The browser flow.
          detail.authorizationUri = this[readUrlValue](this.authorizationUri);
          detail.redirectUri = this[readUrlValue](this.redirectUri);
          break;
        case 'authorization_code':
          // The server flow.
          detail.authorizationUri = this[readUrlValue](this.authorizationUri);
          detail.clientSecret = this.clientSecret;
          detail.accessTokenUri = this[readUrlValue](this.accessTokenUri);
          detail.redirectUri = this[readUrlValue](this.redirectUri);
          break;
        case 'client_credentials':
          // The server flow.
          detail.accessTokenUri = this[readUrlValue](this.accessTokenUri);
          detail.clientSecret = this.clientSecret;
          break;
        case 'password':
          // The server flow.
          detail.username = this.username;
          detail.password = this.password;
          detail.accessTokenUri = this[readUrlValue](this.accessTokenUri);
          detail.clientSecret = this.clientSecret;
          break;
        default:
          // Custom grant type.
          detail.authorizationUri = this[readUrlValue](this.authorizationUri);
          detail.clientSecret = this.clientSecret;
          detail.accessTokenUri = this[readUrlValue](this.accessTokenUri);
          detail.redirectUri = this[readUrlValue](this.redirectUri);
          detail.username = this.username;
          detail.password = this.password;
          break;
      }
      return detail;
    }

    /**
     * When defined and the `url` is a relative path staring with `/` then it
     * adds base URI to the path and returns concatenated value.
     *
     * @param {string} url
     * @return {string} Final URL value.
     */
    [readUrlValue](url) {
      const { baseUri } = this;
      if (!url || !baseUri) {
        return url;
      }
      url = String(url);
      if (url[0] === '/') {
        let uri = baseUri;
        if (uri[uri.length - 1] === '/') {
          uri = uri.substr(0, uri.length - 1);
        }
        return `${uri}${url}`;
      }
      return url;
    }

    [setOauth2Defaults]() {
      if (!this.oauthDeliveryName) {
        this.oauthDeliveryName = 'authorization';
      }
      if (!this.oauthDeliveryMethod) {
        this.oauthDeliveryMethod = 'header';
      }
      if (!this.grantTypes) {
        this.grantTypes = oauth2GrantTypes;
      }
      this[autoHide]();
      if (!this.tokenType) {
        this.tokenType = 'Bearer';
      }
    }

    /**
     * Clears OAuth 1 auth settings
     */
    [clearOauth2Auth]() {
      this.grantType = '';
      this.accessToken = '';
      this.tokenType = '';
      this.scopes = [];
      this.oauthDeliveryMethod = '';
      this.oauthDeliveryName = '';
      this.authorizationUri = '';
      this.accessTokenUri = '';
      this.clientId = '';
      this.clientSecret = '';
      this.username = '';
      this.password = '';

      this[setOauth2Defaults]();
    }

    [authorizeOauth2]() {
      if (this.lastErrorMessage) {
        this.lastErrorMessage = undefined;
      }
      const validationResult = this.validate();
      if (!validationResult) {
        return false;
      }
      const detail = this[serializeOauth2Auth]();
      this._lastState = this.generateState();
      detail.state = this._lastState;
      const e = new CustomEvent('oauth2-token-requested', {
        detail,
        bubbles: true,
        composed: true,
        cancelable: true,
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
      const { message = 'Unknown error' } = e.detail;
      this.lastErrorMessage = message;
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
        notifyChange(this);
      }
    }

    /**
     * Generates `state` parameter for the OAuth2 call.
     *
     * @return {string} Generated state string.
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
    [autoHide]() {
      const { grantType, scopes } = this;
      const hasScopes = !!(scopes && scopes.length);
      let advOpened;
      switch (grantType) {
        case 'implicit':
          advOpened = !(hasScopes && !!this.authorizationUri);
          break;
        case 'authorization_code':
          advOpened = !(
            hasScopes &&
            !!this.authorizationUri &&
            !!this.accessTokenUri
          );
          break;
        case 'client_credentials':
          advOpened = !this.accessTokenUri;
          break;
        default:
          advOpened = true;
          break;
      }
      this.advancedOpened = advOpened;
      if (!advOpened) {
        this.isAdvanced = true;
      }
    }

    /**
     * A handler for `focus` event on a label that contains text and
     * should be coppied to clipboard when user is interacting with it.
     *
     * @param {MouseEvent} e
     */
    [_clickCopyAction](e) {
      const node = /** @type {HTMLElement} */ (e.target);
      const elm = this.shadowRoot.querySelector('clipboard-copy');
      elm.content = node.innerText;
      /* istanbul ignore if */
      if (elm.copy()) {
        // this.shadowRoot.querySelector('#clipboardToast').opened = true;
      }
      setTimeout(() => {
        makeNodeSelection(node);
      });
    }

    [_scopesChanged](e) {
      this.scopes = e.detail.value;
      notifyChange(this);
    }

    [_advHandler](e) {
      this.advancedOpened = e.target.checked;
    }

    [_oauth2RedirectTemplate]() {
      const { redirectUri } = this;
      return html`<div class="subtitle">Redirect URI</div>
        <section>
          <div class="redirect-section">
            <p class="redirect-info">
              Set this redirect URI in OAuth 2.0 provider settings.
            </p>
            <p class="read-only-param-field padding">
              <span
                class="code"
                @click="${this[_clickCopyAction]}"
                @focus="${selectFocusable}"
                title="Click to copy the URI"
                tabindex="0"
                >${redirectUri}</span
              >
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
        noGrantType,
        isCustomGrant,
      } = this;
      const items = this.grantTypes || [];
      return html` <anypoint-dropdown-menu
        name="grantType"
        ?required="${!isCustomGrant}"
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
          @selected-changed="${this[selectionHandler]}"
          data-name="grantType"
          .outlined="${outlined}"
          .compatibility="${compatibility}"
          .readOnly="${readOnly}"
          .disabled="${disabled}"
          attrforselected="data-value"
        >
          ${items.map(
            (item) =>
              html`<anypoint-item
                .compatibility="${compatibility}"
                data-value="${item.type}"
                >${item.label}</anypoint-item
              >`
          )}
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
        baseUri,
      } = this;
      // When the baseUri is set then validation won't allow to provide
      // relative paths to the authorization endpoint hence this should be
      // defined as string and not "url".
      const urlType = baseUri ? 'string' : 'url';
      return html`<div class="advanced-section" ?hidden="${!advancedOpened}">
        ${oauth2AuthorizationUriRendered
          ? inputTemplate(
              'authorizationUri',
              authorizationUri,
              'Authorization URI',
              this[inputHandler],
              {
                type: urlType,
                required: !isCustomGrant,
                autoValidate: true,
                invalidLabel:
                  'Authorization URI is required for this grant type',
              }
            )
          : ''}
        ${oauth2AccessTokenUriRendered
          ? inputTemplate(
              'accessTokenUri',
              accessTokenUri,
              'Access token URI',
              this[inputHandler],
              {
                type: urlType,
                required: !isCustomGrant,
                autoValidate: true,
                invalidLabel:
                  'Access token URI is required for this grant type',
              }
            )
          : ''}
        ${oauth2PasswordRendered
          ? inputTemplate(
              'username',
              username,
              'Username',
              this[inputHandler],
              {
                required: !isCustomGrant,
                autoValidate: true,
                invalidLabel: 'User name is required for this grant type',
              }
            )
          : ''}
        ${oauth2PasswordRendered
          ? inputTemplate(
              'password',
              password,
              'Password',
              this[inputHandler],
              {
                required: !isCustomGrant,
                autoValidate: true,
                invalidLabel: 'Password is required for this grant type',
              }
            )
          : ''}
        <oauth2-scope-selector
          .allowedScopes="${allowedScopes}"
          .preventCustomScopes="${preventCustomScopes}"
          .value="${scopes}"
          .readOnly="${readOnly}"
          .disabled="${disabled}"
          .outlined="${outlined}"
          .compatibility="${compatibility}"
          name="scopes"
          @value-changed="${this[_scopesChanged]}"
        ></oauth2-scope-selector>
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
          >Request access token</anypoint-button
        >
      </div>`;
    }

    [_oauth2TokenTemplate]() {
      const { accessToken, compatibility, _authorizing } = this;
      return html`<div class="current-token">
        <label class="token-label">Current token</label>
        <p class="read-only-param-field padding">
          <span class="code" @click="${this[_clickCopyAction]}"
            >${accessToken}</span
          >
        </p>
        <div class="authorize-actions">
          <anypoint-button
            ?disabled="${_authorizing}"
            class="auth-button"
            ?compatibility="${compatibility}"
            emphasis="medium"
            data-type="refresh-token"
            @click="${this.authorize}
          "
            >Refresh access token</anypoint-button
          >
        </div>
      </div>`;
    }

    [renderOauth2Auth]() {
      const {
        clientId,
        oauth2ClientSecretRendered,
        clientSecret,
        isAdvanced,
        advancedOpened,
        readOnly,
        accessToken,
        clientIdRequired,
        oauth2ClientSecretRequired,
        lastErrorMessage,
      } = this;
      return html`<form autocomplete="on" class="oauth2-auth">
          ${this[_oauth2GrantTypeTemplate]()}
          ${passwordTemplate(
            'clientId',
            clientId,
            'Client id',
            this[inputHandler],
            {
              required: clientIdRequired,
              autoValidate: true,
              invalidLabel: 'Client ID is required for this grant type',
              infoLabel: clientIdRequired
                ? undefined
                : 'Client id is optional for this grant type',
            }
          )}
          ${oauth2ClientSecretRendered
            ? passwordTemplate(
                'clientSecret',
                clientSecret,
                'Client secret',
                this[inputHandler],
                {
                  required: oauth2ClientSecretRequired,
                  autoValidate: true,
                  invalidLabel: 'Client secret is required for this grant type',
                }
              )
            : ''}
          ${this[oauth2CustomPropertiesTemplate]()}
          ${isAdvanced
            ? html` <div class="adv-toggle">
                <anypoint-switch
                  class="adv-settings-input"
                  .checked="${advancedOpened}"
                  @change="${this[_advHandler]}"
                  .disabled="${readOnly}"
                  >Advanced settings</anypoint-switch
                >
              </div>`
            : ''}
          ${this[_oauth2AdvancedTemplate]()}
        </form>
        ${this[_oauth2RedirectTemplate]()}
        ${accessToken
          ? this[_oauth2TokenTemplate]()
          : this[_oath2AuthorizeTemplate]()}
        ${lastErrorMessage ? errorTemplate(lastErrorMessage) : ''}
        <clipboard-copy></clipboard-copy>`;
    }

    [oauth2CustomPropertiesTemplate]() {}
  }
  return Oauth2MethodMixinImpl;
};

/**
 * A mixin that adds support for OAuth 2 method computations.
 *
 * @mixin
 */
export const Oauth2MethodMixin = dedupeMixin(mxFunction);
