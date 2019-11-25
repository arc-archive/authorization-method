import { html, fixture, assert } from '@open-wc/testing';
import { AuthorizationBase, typeChangedSymbol } from '../src/AuthorizationBase.js';

window.customElements.define('authorization-method-base', AuthorizationBase);

describe('AuthorizationBase', () => {
  async function basicFixture(type) {
    return (await fixture(html`<authorization-method-base .type="${type}"></authorization-method-base>`));
  }

  it('has serialize() function', async () => {
    const element = await basicFixture();
    const result = element.serialize();
    assert.deepEqual(result, {});
  });

  it('has restore() function', async () => {
    const element = await basicFixture();
    assert.typeOf(element.restore, 'function');
    element.restore();
  });

  it('has validate() function', async () => {
    const element = await basicFixture();
    assert.typeOf(element.validate, 'function');
    const result = element.validate();
    assert.isTrue(result);
  });

  it('has authorize() function', async () => {
    const element = await basicFixture();
    assert.typeOf(element.authorize, 'function');
    const result = element.authorize();
    assert.equal(result, null);
  });

  it('has typeChangedSymbol function', async () => {
    const element = await basicFixture();
    assert.typeOf(element[typeChangedSymbol], 'function');
    element[typeChangedSymbol]();
  });
});
