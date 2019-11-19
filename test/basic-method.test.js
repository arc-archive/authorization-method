import { html, fixture, assert, oneEvent } from '@open-wc/testing';

import '../authorization-method.js';

describe('Basic method', () => {
  const usernameSelector = 'anypoint-input[name="username"]';
  const passwordSelector = 'anypoint-masked-input[name="password"]';

  const username = 'test-username';
  const password = 'test-password';

  async function basicFixture(username, password) {
    return (await fixture(html`<authorization-method
      type="basic"
      .username="${username}"
      .password="${password}"></authorization-method>`));
  }

  describe('DOM rendering', () => {
    let element;
    let form;
    beforeEach(async () => {
      element = await basicFixture();
      form = element.shadowRoot.querySelector('form.basic-auth');
    });

    it('has form in the DOM', async () => {
      assert.ok(form);
    });

    it('has form has autocomplete', async () => {
      assert.equal(form.getAttribute('autocomplete'), 'on');
    });

    it('form has username input', async () => {
      const input = form.querySelector(usernameSelector);
      assert.ok(input);
    });

    it('username has autovalidate', async () => {
      const input = form.querySelector(usernameSelector);
      assert.isTrue(input.autoValidate);
    });

    it('username is required', async () => {
      const input = form.querySelector(usernameSelector);
      assert.isTrue(input.required);
    });

    it('username has invalid label', async () => {
      const input = form.querySelector(usernameSelector);
      assert.equal(input.invalidMessage, 'Username is required');
    });

    it('form has password input', async () => {
      const input = form.querySelector(passwordSelector);
      assert.ok(input);
    });

    it('has no other inputs', () => {
      const ctrls = form.querySelectorAll('anypoint-input,anypoint-masked-input');
      assert.lengthOf(ctrls, 2);
    });
  });

  describe('Change notification', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('notifies when username changes', async () => {
      const input = element.shadowRoot.querySelector(usernameSelector);
      setTimeout(() => {
        input.value = 'test';
        input.dispatchEvent(new CustomEvent('input'));
      });
      const e = await oneEvent(element, 'change');
      assert.ok(e);
    });

    it('notifies when password changes', async () => {
      const input = element.shadowRoot.querySelector(passwordSelector);
      setTimeout(() => {
        input.value = 'test-password';
        input.dispatchEvent(new CustomEvent('input'));
      });
      const e = await oneEvent(element, 'change');
      assert.ok(e);
    });
  });

  describe('Data serialization', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture(username, password);
    });

    it('serialization has username', () => {
      const result = element.serialize();
      assert.equal(result.username, username);
    });

    it('serialization has password', () => {
      const result = element.serialize();
      assert.equal(result.password, password);
    });

    it('serialization default username', () => {
      element.username = undefined;
      const result = element.serialize();
      assert.equal(result.username, '');
    });

    it('serialization default password', () => {
      element.password = undefined;
      const result = element.serialize();
      assert.equal(result.password, '');
    });
  });

  describe('Data restoration', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture('initial-username', 'initial-password');
    });

    it('serialization has username', () => {
      assert.notEqual(element.username, username);
      element.restore({
        username,
        password
      });
      assert.equal(element.username, username);
    });

    it('serialization has password', () => {
      assert.notEqual(element.password, password);
      element.restore({
        username,
        password
      });
      assert.equal(element.password, password);
    });
  });
});
