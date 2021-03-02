/* eslint-disable no-param-reassign */

/**
 * Normalizes type name to a string identifier.
 * It casts input to a string and lowercase it.
 * @param {string} type Type value
 * @return {string} Normalized value.
 */
export const normalizeType = (type) => {
  if (!type) {
    return undefined;
  }
  return String(type).toLowerCase();
};

export const METHOD_BASIC = 'basic';
export const METHOD_BEARER = 'bearer';
export const METHOD_NTLM = 'ntlm';
export const METHOD_DIGEST = 'digest';
export const METHOD_OAUTH1 = 'oauth 1';
export const METHOD_OAUTH2 = 'oauth 2';
export const CUSTOM_CREDENTIALS = 'Custom credentials';

/**
 * Dispatches `change` event on passed `element`
 * @param {HTMLElement} element Event target
 */
export const notifyChange = (element) => {
  element.dispatchEvent(new CustomEvent('change'));
};

export const selectionHandler = Symbol('selectionHandler');
export const inputHandler = Symbol('inputHandler');

/**
 * Restores an item from a session store and assigns it to a local
 * property.
 *
 * @param {HTMLElement} element An element to set properties onto
 * @param {string} sessionKey Session storage key
 * @param {string} localKey This component's property
 * @param {boolean=} force When true it overrides current value when set
 */
export const restoreSessionProperty = (
  element,
  sessionKey,
  localKey,
  force
) => {
  if (force || !element[localKey]) {
    let value = sessionStorage.getItem(sessionKey);
    if (value) {
      if (value[0] === '[') {
        try {
          value = JSON.parse(value);
        } catch (_) {
          return;
        }
      }
      element[localKey] = value;
    }
  }
};
/**
 * Stores a property in a session storage.
 * @param {string} sessionKey A storage key
 * @param {string|string[]} value Value to store
 */
export const storeSessionProperty = (sessionKey, value) => {
  if (!value) {
    return;
  }
  if (typeof value === 'object') {
    value = JSON.stringify(value);
  }
  sessionStorage.setItem(sessionKey, value);
};
