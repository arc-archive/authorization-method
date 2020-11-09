/* eslint-disable lit-a11y/click-events-have-key-events */
import { html } from 'lit-element';
import { dedupeMixin } from '@open-wc/dedupe-mixin';
import { AuthorizationEvents } from '@advanced-rest-client/arc-events';
import '@advanced-rest-client/oauth2-scope-selector/oauth2-scope-selector.js';
import '@anypoint-web-components/anypoint-switch/anypoint-switch.js';
import { notifyChange, selectionHandler, inputHandler } from './Utils.js';
import { passwordTemplate, inputTemplate } from './CommonTemplates.js';

/** @typedef {import('./AuthorizationMethod').AuthorizationMethod} AuthorizationMethod */
/** @typedef {import('./Oauth2MethodMixin').ResponseType} ResponseType */
/** @typedef {import('./Oauth2MethodMixin').OAuth2Settings} OAuth2Settings */
/** @typedef {import('@advanced-rest-client/arc-types').OAuth2.TokenInfo} TokenInfo */
/** @typedef {import('@advanced-rest-client/oauth2-scope-selector').OAuth2ScopeSelector} OAuth2ScopeSelector */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */

/* eslint-disable no-plusplus */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */

export const clickCopyAction = Symbol('clickCopyAction');
export const scopesChanged = Symbol('scopesChanged');
export const oauth2RedirectTemplate = Symbol('oauth2RedirectTemplate');
export const oauth2ResponseTypeTemplate = Symbol('oauth2ResponseTypeTemplate');
export const oauth2AdvancedTemplate = Symbol('oauth2AdvancedTemplate');
export const oath2AuthorizeTemplate = Symbol('oath2AuthorizeTemplate');
export const oauth2TokenTemplate = Symbol('oauth2TokenTemplate');
export const advHandler = Symbol('advHandler');
export const readUrlValue = Symbol('readUrlValue');
export const setOauth2Defaults = Symbol('setOauth2Defaults');
export const authorizeOauth2 = Symbol('authorizeOauth2');
export const renderOauth2Auth = Symbol('renderOauth2Auth');
export const restoreOauth2Auth = Symbol('restoreOauth2Auth');
export const serializeOauth2Auth = Symbol('serializeOauth2Auth');
export const oauth2CustomPropertiesTemplate = Symbol('oauth2CustomPropertiesTemplate');
export const autoHide = Symbol('autoHide');
export const clearOauth2Auth = Symbol('clearOauth2Auth');
export const clientIdTemplate = Symbol('clientIdTemplate');
export const clientSecretTemplate = Symbol('clientSecretTemplate');
export const toggleAdvViewSwitchTemplate = Symbol('toggleAdvViewSwitchTemplate');
export const authorizationUriTemplate = Symbol('authorizationUriTemplate');
export const accessTokenUriTemplate = Symbol('accessTokenUriTemplate');
export const usernameTemplate = Symbol('usernameTemplate');
export const passwordTemplateLocal = Symbol('passwordTemplateLocal');
export const scopesTemplate = Symbol('scopesTemplate');

/**
 * List of OAuth 2.0 default response types.
 * This list can be extended by custom grants
 *
 * @return {ResponseType[]} List of objects with `type` and `label`
 * properties.
 */
export const oauth2ResponseTypes = [
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
 * should be copied to clipboard when user is interacting with it.
 *
 * @param {KeyboardEvent} e
 */
const selectFocusable = (e) => {
  const node = /** @type {HTMLElement} */ (e.target);
  makeNodeSelection(node);
};

/**
 * @param {AuthorizationMethod} base
 */
const mxFunction = (base) => {
  class Oauth2MethodMixinImpl extends base {
    /**
     * @return {boolean} Computed value, true if the response type is a custom definition.
     */
    get isCustomResponseType() {
      const { responseType } = this;
      return (!!responseType &&
        ![
          'implicit',
          'authorization_code',
          'client_credentials',
          'password',
        ].includes(responseType)
      );
    }

    get clientIdRequired() {
      const { responseType } = this;
      return !['client_credentials', 'password'].includes(responseType);
    }

    get oauth2ClientSecretRendered() {
      const { responseType, isCustomResponseType } = this;
      return (
        isCustomResponseType ||
        (!!responseType && ['authorization_code', 'client_credentials', 'password'].includes(responseType))
      );
    }

    get oauth2ClientSecretRequired() {
      const { responseType } = this;
      return ['authorization_code'].includes(responseType);
    }

    get oauth2AuthorizationUriRendered() {
      const { responseType, isCustomResponseType } = this;
      return (
        isCustomResponseType ||
        (!!responseType &&
          ['implicit', 'authorization_code'].includes(responseType))
      );
    }

    get oauth2AccessTokenUriRendered() {
      const { responseType, isCustomResponseType } = this;
      return (
        isCustomResponseType ||
        (!!responseType &&
          ['client_credentials', 'authorization_code', 'password'].includes(responseType))
      );
    }

    get oauth2PasswordRendered() {
      const { responseType, isCustomResponseType } = this;
      return (
        isCustomResponseType || (!!responseType && ['password'].includes(responseType))
      );
    }

    static get properties() {
      return {
        /** 
         * Selected authorization grand type.
         */
        responseType: { type: String },
        /** 
         * The client ID for the auth token.
         */
        clientId: { type: String },
        /** 
         * The client secret. It to be used when selected server flow.
         */
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
         * the token request event and perform the authorization.
         */
        accessToken: { type: String },
        /**
         * By default it is "bearer" as the only one defined in OAuth 2.0 spec.
         * If the token response contains `tokenType` property then this value is updated.
         */
        tokenType: { type: String },
        /**
         * Currently available response types.
         */
        responseTypes: { type: Array },
        /**
         * If set it renders authorization url, token url and scopes as advanced options
         * which are then invisible by default. User can oen setting using the UI.
         */
        advanced: { type: Boolean },
        /**
         * If true then the advanced options are opened.
         */
        advancedOpened: { type: Boolean },
        /**
         * If set, the response type selector is hidden from the UI.
         */
        noResponseType: { type: Boolean },
        /**
         * Informs about what filed of the authenticated request the token property should be set.
         * By default the value is `header` which corresponds to the `authorization` by default,
         * but it is configured by the `deliveryName` property.
         * 
         * This can be used by the AMF model when the API spec defines where the access token should be
         * put in the authenticated request.
         * 
         * @default header
         */
        oauthDeliveryMethod: { type: String },
        /**
         * The name of the authenticated request property that carries the token.
         * By default it is `authorization` which corresponds to `header` value of the `deliveryMethod` property.
         * 
         * By setting both `deliveryMethod` and `deliveryName` you instruct the application (assuming it reads this values)
         * where to put the authorization token.
         * 
         * @default authorization
         */
        oauthDeliveryName: { type: String },
        /**
         * The base URI to use to construct the correct URLs to the authorization endpoints.
         * 
         * When the paths are relative then base URI is added to the path.
         * Relative paths must start with '/'.
         * 
         * Note, URL processing is happening internally in the component. The produced authorize event
         * will have base URI already applied.
         */
        baseUri: { type: String },
        /**
         * The error message returned by the authorization library.
         * It renders error dialog when an error ocurred. 
         * It is automatically cleared when the user request the token again.
         */
        lastErrorMessage: { type: String },
      };
    }

    constructor() {
      super();
      /**
       * @type {ResponseType[]}
       */
      this.responseTypes = [];
      this.noResponseType = false;
    }

    /**
     * Restores previously serialized values
     * @param {OAuth2Settings} settings
     */
    [restoreOauth2Auth](settings) {
      const type = settings.responseType;
      this.responseType = type;
      this.clientId = settings.clientId;
      this.accessToken = settings.accessToken;
      this.scopes = settings.scopes;
      if (settings.tokenType) {
        this.tokenType = settings.tokenType;
      }
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
     * @return {OAuth2Settings}
     */
    [serializeOauth2Auth]() {
      const { responseType, tokenType, } = this;
      const detail = /** @type OAuth2Settings */ ({
        responseType,
        tokenType,
        clientId: this.clientId,
        accessToken: this.accessToken || '',
        scopes: this.scopes,
        deliveryMethod: this.oauthDeliveryMethod,
        deliveryName: this.oauthDeliveryName,
      });

      switch (responseType) {
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
          // Custom response type.
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
      if (!Array.isArray(this.responseTypes) || !this.responseTypes.length) {
        this.responseTypes = oauth2ResponseTypes;
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
      this.tokenType = '';
      this.accessToken = '';
      this.responseType = '';
      this.scopes = /** @type string[] */ ([]);
      this.oauthDeliveryMethod = undefined;
      this.oauthDeliveryName = undefined;
      this.authorizationUri = '';
      this.accessTokenUri = '';
      this.clientId = '';
      this.clientSecret = '';
      this.username = '';
      this.password = '';

      this[setOauth2Defaults]();
    }

    /**
     * Performs the authorization.
     * 
     * @returns {Promise<TokenInfo|null>} The auth token or null if couldn't be requested.
     * @throws {Error} When authorization error
     */
    async [authorizeOauth2]() {
      if (this.lastErrorMessage) {
        this.lastErrorMessage = undefined;
      }
      const validationResult = this.validate();
      if (!validationResult) {
        return null;
      }
      this._authorizing = true;
      const detail = this[serializeOauth2Auth]();
      const state = this.generateState();
      detail.state = state;
      let tokenInfo = /** @type TokenInfo */(null);
      try {
        tokenInfo = await AuthorizationEvents.OAuth2.authorize(this, detail);
        this._authorizing = false;
        if (!tokenInfo) {
          return null;
        }
        if (tokenInfo.state !== state) {
          return null;
        }
        if (tokenInfo.accessToken && tokenInfo.accessToken !== this.accessToken) {
          if (tokenInfo.tokenType && tokenInfo.tokenType !== this.tokenType) {
            this.tokenType = tokenInfo.tokenType;
          } else if (!tokenInfo.tokenType && this.tokenType !== 'Bearer') {
            this.tokenType = 'Bearer';
          }
          this.accessToken = tokenInfo.accessToken;
          notifyChange(this);
        }
      } catch (e) {
        const { message = 'Unknown error' } = e;
        this.lastErrorMessage = message;
        this._authorizing = false;
        await this.requestUpdate();
        throw e;
      }
      return tokenInfo;
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
      const { responseType, scopes } = this;
      const hasScopes = !!(scopes && scopes.length);
      let advOpened;
      switch (responseType) {
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
        this.advanced = true;
      }
    }

    /**
     * A handler for `focus` event on a label that contains text and
     * should be copied to clipboard when user is interacting with it.
     *
     * @param {MouseEvent} e
     */
    [clickCopyAction](e) {
      const node = /** @type {HTMLElement} */ (e.target);
      const elm = this.shadowRoot.querySelector('clipboard-copy');
      elm.content = node.innerText;
      /* istanbul ignore if */
      if (elm.copy()) {
        // this.shadowRoot.querySelector('#clipboardToast').opened = true;
      }
      setTimeout(() => makeNodeSelection(node));
    }

    /**
     * Event handler for the scopes element changed state
     * @param {CustomEvent} e
     */
    [scopesChanged](e) {
      this.scopes = /** @type OAuth2ScopeSelector */ (e.target).value;
      notifyChange(this);
    }

    [advHandler](e) {
      this.advancedOpened = e.target.checked;
    }

    /**
     * @returns {TemplateResult|string} The template for the OAuth 2 redirect URI label
     */
    [oauth2RedirectTemplate]() {
      const { redirectUri } = this;
      return html`
      <div class="subtitle">Redirect URI</div>
      <section>
        <div class="redirect-section">
          <p class="redirect-info">
            Set this redirect URI in OAuth 2.0 provider settings.
          </p>
          <p class="read-only-param-field padding">
            <span
              class="code"
              @click="${this[clickCopyAction]}"
              @focus="${selectFocusable}"
              title="Click to copy the URI"
              tabindex="0"
            >${redirectUri}</span>
          </p>
        </div>
      </section>
      `;
    }

    /**
     * @returns {TemplateResult|string} The template for the OAuth 2 response type selector
     */
    [oauth2ResponseTypeTemplate]() {
      const {
        responseType,
        outlined,
        compatibility,
        readOnly,
        disabled,
        noResponseType,
        isCustomResponseType,
      } = this;
      const items = this.responseTypes || [];
      return html`
      <anypoint-dropdown-menu
        name="responseType"
        ?required="${!isCustomResponseType}"
        class="grant-dropdown"
        ?hidden="${noResponseType}"
        .outlined="${outlined}"
        .compatibility="${compatibility}"
        .disabled="${disabled||readOnly}"
      >
        <label slot="label">Response type</label>
        <anypoint-listbox
          slot="dropdown-content"
          .selected="${responseType}"
          @selected-changed="${this[selectionHandler]}"
          data-name="responseType"
          .compatibility="${compatibility}"
          .disabled="${disabled||readOnly}"
          attrforselected="data-value"
        >
          ${items.map((item) => html`
          <anypoint-item
            .compatibility="${compatibility}"
            data-value="${item.type}"
          >${item.label}</anypoint-item>`)}
        </anypoint-listbox>
      </anypoint-dropdown-menu>`;
    }

    /**
     * @returns {TemplateResult|string} The template for the OAuth 2 advanced options.
     */
    [oauth2AdvancedTemplate]() {
      const {
        advancedOpened,
        baseUri,
      } = this;
      // When the baseUri is set then validation won't allow to provide
      // relative paths to the authorization endpoint hence this should be
      // defined as string and not "url".
      const urlType = baseUri ? 'string' : 'url';
      return html`
      <div class="advanced-section" ?hidden="${!advancedOpened}">
        ${this[authorizationUriTemplate](urlType)}
        ${this[accessTokenUriTemplate](urlType)}
        ${this[usernameTemplate]()}
        ${this[passwordTemplateLocal]()}
        ${this[scopesTemplate]()}
      </div>`;
    }

    /**
     * @returns {TemplateResult|string} The template for the "authorize" button.
     */
    [oath2AuthorizeTemplate]() {
      const { _authorizing, compatibility } = this;
      return html`
      <div class="authorize-actions">
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

    /**
     * @returns {TemplateResult|string} The template for the OAuth 2 token value
     */
    [oauth2TokenTemplate]() {
      const { accessToken, compatibility, _authorizing } = this;
      return html`
      <div class="current-token">
        <label class="token-label">Current token</label>
        <p class="read-only-param-field padding">
          <span class="code" @click="${this[clickCopyAction]}">${accessToken}</span>
        </p>
        <div class="authorize-actions">
          <anypoint-button
            ?disabled="${_authorizing}"
            class="auth-button"
            ?compatibility="${compatibility}"
            emphasis="medium"
            data-type="refresh-token"
            @click="${this.authorize}"
          >Refresh access token</anypoint-button>
        </div>
      </div>`;
    }

    /**
     * @returns {TemplateResult} The template for the OAuth 2 editor.
     */
    [renderOauth2Auth]() {
      const {
        accessToken,
        lastErrorMessage,
      } = this;
      return html`
      <form autocomplete="on" class="oauth2-auth">
        ${this[oauth2ResponseTypeTemplate]()}
        ${this[clientIdTemplate]()}
        ${this[clientSecretTemplate]()}
        ${this[oauth2CustomPropertiesTemplate]()}
        ${this[toggleAdvViewSwitchTemplate]()}
        ${this[oauth2AdvancedTemplate]()}
      </form>
      ${this[oauth2RedirectTemplate]()}
      ${accessToken ? this[oauth2TokenTemplate]() : this[oath2AuthorizeTemplate]()}
      ${lastErrorMessage ? html`<p class="error-message">⚠ ${lastErrorMessage}</p>` : ''}
      <clipboard-copy></clipboard-copy>
      `;
    }

    [oauth2CustomPropertiesTemplate]() {
      return '';
    }

    /**
     * @returns {TemplateResult|string} The template for the OAuth 2 client secret input.
     */
    [clientSecretTemplate]() {
      const { oauth2ClientSecretRendered } = this;
      if (!oauth2ClientSecretRendered) {
        return '';
      }
      const { clientSecret, outlined, compatibility, readOnly, disabled, oauth2ClientSecretRequired } = this;
      return passwordTemplate(
        'clientSecret',
        clientSecret,
        'Client secret',
        this[inputHandler],
        {
          outlined,
          compatibility,
          readOnly,
          disabled,
          required: oauth2ClientSecretRequired,
          autoValidate: true,
          invalidLabel: 'Client secret is required for this response type',
        }
      );
    }

    /**
     * @returns {TemplateResult|string} The template for the OAuth 2 client id input.
     */
    [clientIdTemplate]() {
      const { clientId, outlined, compatibility, readOnly, disabled, clientIdRequired } = this;
      return passwordTemplate(
        'clientId',
        clientId,
        'Client id',
        this[inputHandler],
        {
          outlined,
          compatibility,
          readOnly,
          disabled,
          required: clientIdRequired,
          autoValidate: true,
          invalidLabel: 'Client ID is required for this response type',
          infoLabel: clientIdRequired
            ? undefined
            : 'Client id is optional for this response type',
        }
      );
    }

    /**
     * @returns {TemplateResult|string} The template for the toggle advanced view switch
     */
    [toggleAdvViewSwitchTemplate]() {
      const { advanced } = this;
      if (!advanced) {
        return '';
      }
      const { readOnly, advancedOpened, compatibility } = this;
      return html` 
      <div class="adv-toggle">
        <anypoint-switch
          class="adv-settings-input"
          .checked="${advancedOpened}"
          @change="${this[advHandler]}"
          ?disabled="${readOnly}"
          ?compatibility="${compatibility}"
        >Advanced settings</anypoint-switch>
      </div>`;
    }

    /**
     * @param {string} urlType The input type to render
     * @returns {TemplateResult|string} The template for the authorization URI input
     */
    [authorizationUriTemplate](urlType) {
      if (!this.oauth2AuthorizationUriRendered) {
        return '';
      }
      const { readOnly, authorizationUri, compatibility, outlined, disabled, isCustomResponseType } = this;
      return inputTemplate(
        'authorizationUri',
        authorizationUri,
        'Authorization URI',
        this[inputHandler],
        {
          outlined,
          compatibility,
          readOnly,
          disabled,
          type: urlType,
          required: !isCustomResponseType,
          autoValidate: true,
          invalidLabel: 'Authorization URI is required for this response type',
        }
      );
    }

    /**
     * @param {string} urlType The input type to render
     * @returns {TemplateResult|string} The template for the access token URI input
     */
    [accessTokenUriTemplate](urlType) {
      if (!this.oauth2AccessTokenUriRendered) {
        return '';
      }
      const { readOnly, accessTokenUri, compatibility, outlined, disabled, isCustomResponseType } = this;
      return inputTemplate(
        'accessTokenUri',
        accessTokenUri,
        'Access token URI',
        this[inputHandler],
        {
          outlined,
          compatibility,
          readOnly,
          disabled,
          type: urlType,
          required: !isCustomResponseType,
          autoValidate: true,
          invalidLabel: 'Access token URI is required for this response type',
        }
      );
    }

    /**
     * @returns {TemplateResult|string} The template for the user name input
     */
    [usernameTemplate]() {
      if (!this.oauth2PasswordRendered) {
        return '';
      }
      const { readOnly, username, compatibility, outlined, disabled, isCustomResponseType } = this;
      return inputTemplate(
        'username',
        username,
        'Username',
        this[inputHandler],
        {
          outlined,
          compatibility,
          readOnly,
          disabled,
          required: !isCustomResponseType,
          autoValidate: true,
          invalidLabel: 'User name is required for this response type',
        }
      );
    }

    /**
     * @returns {TemplateResult|string} The template for the user password input
     */
    [passwordTemplateLocal]() {
      if (!this.oauth2PasswordRendered) {
        return '';
      }
      const { readOnly, password, compatibility, outlined, disabled, isCustomResponseType } = this;
      return inputTemplate(
        'password',
        password,
        'Password',
        this[inputHandler],
        {
          outlined,
          compatibility,
          readOnly,
          disabled,
          required: !isCustomResponseType,
          autoValidate: true,
          invalidLabel: 'Password is required for this response type',
        }
      );
    }

    /**
     * @returns {TemplateResult} The template for the OAuth 2 scopes input
     */
    [scopesTemplate]() {
      const {
        allowedScopes,
        preventCustomScopes,
        outlined,
        compatibility,
        readOnly,
        disabled,
        scopes,
      } = this;
      return html`
      <oauth2-scope-selector
        .allowedScopes="${allowedScopes}"
        .preventCustomScopes="${preventCustomScopes}"
        .value="${scopes}"
        ?readOnly="${readOnly}"
        ?disabled="${disabled}"
        ?outlined="${outlined}"
        ?compatibility="${compatibility}"
        name="scopes"
        @change="${this[scopesChanged]}"
      ></oauth2-scope-selector>`;
    }
  }
  return Oauth2MethodMixinImpl;
};

/**
 * A mixin that adds support for OAuth 2 method computations.
 *
 * @mixin
 */
export const Oauth2MethodMixin = dedupeMixin(mxFunction);
