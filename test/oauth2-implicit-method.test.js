import { html, fixture, assert, oneEvent, nextFrame, aTimeout } from '@open-wc/testing';
import { spy } from 'sinon';
import { tap, focus } from '@polymer/iron-test-helpers/mock-interactions.js';
import { METHOD_OAUTH2 } from '../index.js';
import '../authorization-method.js';
import {
  oauth2GrantTypes,
  setOauth2Defaults
} from '../src/Oauth2MethodMixin.js';

describe('OAuth 2, implicit method', () => {
  const redirectUri = 'https://redirect.com/';
  const grantType = 'implicit';
  const inputFields = [
    ['clientId', '821776164331-rserncqpdsq32lmbf5cfeolgcoujb6fm.apps.googleusercontent.com'],
    ['authorizationUri', 'https://accounts.google.com/o/oauth2/v2/auth'],
    ['scopes', ['email', 'profile']],
  ];

  function createParamsMap() {
    const props = {
      redirectUri,
      grantType,
    };
    inputFields.forEach(([n, v]) => props[n] = v);
    return props;
  }

  async function basicFixture(opts) {
    opts = opts || {};
    const {
      clientId,
      authorizationUri,
      redirectUri,
      scopes,
    } = opts;
    return (await fixture(html`<authorization-method
      type="${METHOD_OAUTH2}"
      granttype="implicit"
      .clientId="${clientId}"
      .authorizationUri="${authorizationUri}"
      .redirectUri="${redirectUri}"
      .scopes="${scopes}"></authorization-method>`));
  }

  function clearStorage() {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.indexOf('auth.methods.latest') === 0) {
        sessionStorage.removeItem(key);
      }
    });
  }

  describe('DOM rendering', () => {
    let element;
    let form;
    beforeEach(async () => {
      element = await basicFixture();
      form = element.shadowRoot.querySelector('form.oauth2-auth');
    });

    it('has form in the DOM', async () => {
      assert.ok(form);
    });

    it('has form has autocomplete', async () => {
      assert.equal(form.getAttribute('autocomplete'), 'on');
    });

    inputFields.forEach(([name]) => {
      it(`form has ${name} input`, async () => {
        const input = form.querySelector(`*[name="${name}"]`);
        assert.ok(input);
      });
    });

    it('renders redirect URI filed', async () => {
      element.redirectUri = redirectUri;
      await nextFrame();
      const node = element.shadowRoot.querySelector('.redirect-section');
      assert.ok(node);
      const label = node.querySelector('.code');
      assert.equal(label.textContent.trim(), redirectUri);
    });

    it('does not render token section when no token information', () => {
      const node = element.shadowRoot.querySelector('.current-token');
      assert.notOk(node);
    });

    it('renders token section when token information is set', async () => {
      element.accessToken = 'test-token';
      await nextFrame();
      const node = element.shadowRoot.querySelector('.current-token');
      assert.ok(node);
      const label = node.querySelector('.code');
      assert.equal(label.textContent.trim(), 'test-token');
    });
  });

  describe('Advanced mode', () => {
    it('renders all fields when no initial values', async () => {
      const element = await basicFixture();
      assert.isTrue(element.advancedOpened, 'advanced view is opened');
      assert.isUndefined(element.isAdvanced, 'isAdvanced is undefined');
    });

    it('does not render advanced switch', async () => {
      const element = await basicFixture();
      const node = element.shadowRoot.querySelector('.adv-toggle');
      assert.notOk(node);
    });

    it('hides advanced fields when has all data', async () => {
      const element = await basicFixture(createParamsMap());
      assert.isFalse(element.advancedOpened, 'advanced view is not opened');
      assert.isTrue(element.isAdvanced, 'isAdvanced is set');
    });

    it('renders advanced switch when advanced is enabled', async () => {
      const element = await basicFixture(createParamsMap());
      const node = element.shadowRoot.querySelector('.adv-toggle');
      assert.ok(node);
    });

    it('toggles advanced visibility when switch is clicked', async () => {
      const element = await basicFixture(createParamsMap());
      const section = element.shadowRoot.querySelector('.advanced-section');
      assert.equal(getComputedStyle(section).display, 'none', 'section is hidden');
      const button = element.shadowRoot.querySelector('.adv-settings-input');
      tap(button);
      await nextFrame();
      assert.equal(getComputedStyle(section).display, 'block', 'section is not hidden');
    });
  });

  describe('Data initialization', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture(createParamsMap());
    });

    inputFields.forEach(([name, value]) => {
      it(`input ${name} has value`, async () => {
        const input = element.shadowRoot.querySelector(`*[name="${name}"]`);
        assert.equal(input.value, value);
      });
    });
  });

  describe('Change notification', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture({});
    });

    inputFields.forEach(([name, value]) => {
      it(`notifies when ${name} changes`, async () => {
        const input = element.shadowRoot.querySelector(`*[name="${name}"]`);
        setTimeout(() => {
          input.value = value;
          input.dispatchEvent(new CustomEvent('input'));
        });
        const e = await oneEvent(element, 'change');
        assert.ok(e);
      });
    });

    it('does not notify when sets default values', () => {
      const handler = spy();
      element.addEventListener('change', handler);
      element[setOauth2Defaults]();
      assert.isFalse(handler.called);
    });

    it('notifies when changing scopes', async () => {
      const node = element.shadowRoot.querySelector('oauth2-scope-selector');
      setTimeout(() => {
        node.value = ['test'];
      });
      const e = await oneEvent(element, 'change');
      assert.ok(e);
    });
  });

  describe('Data serialization', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture(createParamsMap());
    });

    inputFields.forEach(([name, value]) => {
      it(`serialization has ${name}`, async () => {
        const result = element.serialize();
        assert.equal(result[name], value);
      });
    });
  });

  describe('Data restoration', () => {
    let element;
    let restoreMap;

    beforeEach(async () => {
      element = await basicFixture();
      restoreMap = createParamsMap();
    });

    inputFields.forEach(([name, value]) => {
      it(`restores ${name}`, () => {
        element.restore(restoreMap);
        assert.equal(element[name], value);
      });
    });

    it('restores when settings has legacy "type" instead of grantType', () => {
      restoreMap.type = restoreMap.grantType;
      delete restoreMap.grantType;
      element.restore(restoreMap);
      assert.equal(element.grantType, 'implicit');
    });
  });

  describe('Default values', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('sets default oauthDeliveryName', () => {
      assert.equal(element.oauthDeliveryName, 'authorization');
    });

    it('sets default oauthDeliveryMethod', () => {
      assert.equal(element.oauthDeliveryMethod, 'header');
    });

    it('sets grantTypes', () => {
      assert.deepEqual(element.grantTypes, oauth2GrantTypes);
    });

    it('sets tokenType', () => {
      assert.equal(element.tokenType, 'Bearer');
    });

    it('has default lastState', () => {
      assert.equal(element.lastState, null);
    });
  });

  describe('authorization request', () => {
    let element;

    beforeEach(async () => {
      element = await basicFixture(createParamsMap());
    });

    function sendTokenResponse(state, tokenType) {
      const e = new CustomEvent('oauth2-token-response', {
        bubbles: true,
        composed: true,
        cancelable: true,
        detail: {
          accessToken: 'token-value',
          tokenType,
          state
        }
      });
      document.body.dispatchEvent(e);
    }

    function handleAuthorizationEvent(element) {
      element.addEventListener('oauth2-token-requested', (e) => {
        e.preventDefault();
      });
    }

    inputFields.forEach(([name, value]) => {
      it(`authorization event has ${name} property`, async () => {
        const handler = spy();
        element.addEventListener('oauth2-token-requested', handler);
        element.authorize();
        const { detail } = handler.args[0][0];
        assert.equal(detail[name], value);
      });
    });

    it('calls authorize() from button click', () => {
      const button = element.shadowRoot.querySelector('.auth-button');
      const handler = spy();
      element.addEventListener('oauth2-token-requested', handler);
      tap(button);
      assert.isTrue(handler.called);
    });

    it('sets #authorizing flag', () => {
      handleAuthorizationEvent(element);
      const button = element.shadowRoot.querySelector('.auth-button');
      tap(button);
      assert.isTrue(element.authorizing);
    });

    it('ignores authorization when did not pass validation', async () => {
      element.clientId = '';
      await nextFrame();
      element.authorize();
      assert.isFalse(element.authorizing);
    });

    it('resets the #authorizing flag when token response', async () => {
      handleAuthorizationEvent(element);
      element.authorize();
      await nextFrame();
      sendTokenResponse();
      assert.isFalse(element.authorizing);
    });

    it('sets state on the event and on the element', async () => {
      const handler = spy();
      element.addEventListener('oauth2-token-requested', handler);
      element.authorize();
      const { detail } = handler.args[0][0];
      const eventState = detail.state;
      assert.typeOf(eventState, 'string', 'event state is set');
      const elementState = element.lastState;
      assert.typeOf(elementState, 'string', 'element state is set');
      assert.equal(elementState, eventState, 'states are the same');
    });

    it('sets values from response event when no state', async () => {
      element.authorize();
      await nextFrame();
      sendTokenResponse(undefined, 'other');
      assert.equal(element.accessToken, 'token-value');
      assert.equal(element.tokenType, 'other');
    });

    it('sets values from the response event with state', async () => {
      element.authorize();
      await nextFrame();
      sendTokenResponse(element.lastState, 'other');
      assert.equal(element.accessToken, 'token-value');
      assert.equal(element.tokenType, 'other');
    });

    it('ignores events with different state', async () => {
      element.authorize();
      await nextFrame();
      sendTokenResponse('unknown-state', 'other');
      assert.isUndefined(element.accessToken);
    });

    it('clears last state', async () => {
      element.authorize();
      await nextFrame();
      sendTokenResponse(element.lastState);
      assert.notOk(element.lastState);
    });

    it('ignores the response event when token is already set', async () => {
      element.authorize();
      element.tokenValue = 'token-value';
      await nextFrame();
      sendTokenResponse(element.lastState);
      assert.equal(element.accessToken, 'token-value');
    });

    it('restores default token type from the response event', async () => {
      element.authorize();
      element.tokenType = 'custom';
      await nextFrame();
      sendTokenResponse(element.lastState);
      assert.equal(element.tokenType, 'Bearer');
    });

    function fireError(state) {
      const e = new CustomEvent('oauth2-error', {
        bubbles: true,
        composed: true,
        cancelable: true,
        detail: {
          state
        }
      });
      document.body.dispatchEvent(e);
    }

    it('resets the #authorizing flag when token error', async () => {
      element.authorize();
      await nextFrame();
      fireError();
      assert.isFalse(element.authorizing);
    });

    it('ignores token error when different state', async () => {
      handleAuthorizationEvent(element);
      element.authorize();
      await nextFrame();
      fireError('other');
      assert.isTrue(element.authorizing);
    });

    it('accepts token error when the same state', async () => {
      handleAuthorizationEvent(element);
      element.authorize();
      await nextFrame();
      fireError(element.lastState);
      assert.isFalse(element.authorizing);
    });
  });

  describe('request-header-changed event', () => {
    function fire(name, value) {
      const ev = new CustomEvent('request-header-changed', {
        detail: {
          name: name,
          value: value
        },
        bubbles: true
      });
      document.body.dispatchEvent(ev);
    }

    const authName = 'authorization';
    let element;
    beforeEach(async () => {
      clearStorage();
      element = await basicFixture(createParamsMap());
    });

    it('Updates accessToken from the event', () => {
      fire(authName, 'bearer testToken');
      assert.equal(element.accessToken, 'testToken');
    });

    it('Updates accessToken from the event when tokenType is not set', () => {
      element.tokenType = undefined;
      fire(authName, 'bearer testToken');
      assert.equal(element.accessToken, 'testToken');
    });

    it('Updates "Bearer" uppercase', () => {
      fire(authName, 'Bearer testToken');
      assert.equal(element.accessToken, 'testToken');
    });

    it('Does not change values for other headers', () => {
      element.accessToken = 'test';
      fire('x-test', 'something');
      assert.equal(element.accessToken, 'test');
    });

    it('Clears the value for empty header', () => {
      element.accessToken = 'test-1';
      fire(authName, '');
      assert.equal(element.accessToken, '');
    });

    it('Clears token value for unmatched bearer', () => {
      element.tokenType = 'other';
      element.accessToken = 'test';
      fire(authName, 'xxxx: yyyyy');
      assert.equal(element.accessToken, '');
    });
  });

  describe('clipboard copy', () => {
    let element;
    let copy;
    beforeEach(async () => {
      element = await basicFixture(createParamsMap());
      copy = element.shadowRoot.querySelector('clipboard-copy');
    });

    // Note (pawel): there's no way to tell whether content was coppied to
    // clipboard or not. Instead it tests whether the content is passed to the
    // clipboard-copy element.

    it('coppies redirect URL to clipboard', () => {
      const node = element.shadowRoot.querySelector('.redirect-section');
      const label = node.querySelector('.code');
      tap(label);
      assert.equal(copy.content, label.innerText);
    });

    it('coppies token value to clipboard', async () => {
      const tokenValue = 'test-token';
      element.accessToken = tokenValue;
      await nextFrame();
      const node = element.shadowRoot.querySelector('.current-token');
      const label = node.querySelector('.code');
      tap(label);
      assert.equal(copy.content, tokenValue);
    });

    it('makes text selection from click', async () => {
      const node = element.shadowRoot.querySelector('.redirect-section');
      const label = node.querySelector('.code');
      tap(label);
      await aTimeout();
      const selection = window.getSelection();
      assert.ok(selection.anchorNode);
    });

    it('makes text selection from focus', () => {
      const node = element.shadowRoot.querySelector('.redirect-section');
      const label = node.querySelector('.code');
      focus(label);
      const selection = window.getSelection();
      assert.ok(selection.anchorNode);
    });
  });
});
