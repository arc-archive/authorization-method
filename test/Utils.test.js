import { assert } from '@open-wc/testing';
import * as Utils  from '../src/Utils.js';

describe('Utils', () => {
  describe('normalizeType()', () => {
    it('returns when no argument', () => {
      const result = Utils.normalizeType(undefined);
      assert.isUndefined(result);
    });

    it('lowercase the input', () => {
      const result = Utils.normalizeType('BAsic');
      assert.equal(result, 'basic');
    });
  });

  describe('getEventTarget()', () => {
    it('returns first item of composedPath', () => {
      const obj = {
        composedPath: () => ['test'],
      };
      const result = Utils.getEventTarget(obj);
      assert.equal(result, 'test');
    });

    it('returns first item of path', () => {
      const obj = {
        path: ['test'],
      };
      const result = Utils.getEventTarget(obj);
      assert.equal(result, 'test');
    });

    it('returns target', () => {
      const obj = {
        target: 'test',
      };
      const result = Utils.getEventTarget(obj);
      assert.equal(result, 'test');
    });
  });

  describe('restoreSessionProperty()', () => {
    const sessionKey = 'test.session.key';
    beforeEach(() => {
      sessionStorage.removeItem(sessionKey);
    });

    after(() => {
      sessionStorage.removeItem(sessionKey);
    });

    it('restores session value on the target', () => {
      sessionStorage[sessionKey] = 'test-value';
      const result = {};
      Utils.restoreSessionProperty(result, sessionKey, 'restored');
      assert.equal(result.restored, 'test-value');
    });

    it('skips when the value is already set', () => {
      sessionStorage[sessionKey] = 'test-value';
      const result = {
        restored: 'other-value'
      };
      Utils.restoreSessionProperty(result, sessionKey, 'restored');
      assert.equal(result.restored, 'other-value');
    });

    it('uses "force" argumet to override the value', () => {
      sessionStorage[sessionKey] = 'test-value';
      const result = {
        restored: 'other-value'
      };
      Utils.restoreSessionProperty(result, sessionKey, 'restored', true);
      assert.equal(result.restored, 'test-value');
    });

    it('parses array values', () => {
      sessionStorage[sessionKey] = '["test-value"]';
      const result = {};
      Utils.restoreSessionProperty(result, sessionKey, 'restored');
      assert.deepEqual(result.restored, ['test-value']);
    });

    it('ignores invalid JSON', () => {
      sessionStorage[sessionKey] = '["test-value", ]';
      const result = {};
      Utils.restoreSessionProperty(result, sessionKey, 'restored');
      assert.isUndefined(result.restored);
    });
  });

  describe('storeSessionProperty()', () => {
    const sessionKey = 'test.session.key';
    beforeEach(() => {
      sessionStorage.removeItem(sessionKey);
    });

    after(() => {
      sessionStorage.removeItem(sessionKey);
    });

    it('ignores empty values', () => {
      Utils.storeSessionProperty(sessionKey, '');
      const result = sessionStorage.getItem(sessionKey);
      assert.equal(result, null);
    });

    it('serializes an array', () => {
      Utils.storeSessionProperty(sessionKey, ['test']);
      const result = sessionStorage.getItem(sessionKey);
      assert.equal(result, '["test"]');
    });
  });
});
