/**
 * Normalizes type name to a string identifier.
 * It casts input to a string and lowercase it.
 * @param {String} type Type value
 * @return {String} Normalized value.
 */
export const normalizeType = (type) => {
  if (!type) {
    return;
  }
  return String(type).toLowerCase();
};

export const METHOD_BASIC = 'basic';
export const METHOD_BEARER = 'bearer';
export const METHOD_NTLM = 'ntlm';
export const METHOD_DIGEST = 'digest';
export const METHOD_OAUTH1 = 'oauth 1';
export const METHOD_OAUTH2 = 'oauth 2';

/**
 * Dispatches `change` event on passed `element`
 * @param {AuthorizationMethod} element Event target
 */
export const notifyChange = (element) => {
  element.dispatchEvent(new CustomEvent('change'));
}

export const renderInput = Symbol();
export const renderPasswordInput = Symbol();
export const _selectionHandler = Symbol();
export const _inputHandler = Symbol();

/**
 * Restores an item from a session store and assigns it to a local
 * property.
 *
 * @param {AuthorizationMethod} element An eelement to set properties onto
 * @param {String} sessionKey Session storage key
 * @param {String} localKey This component's property
 * @param {Boolean=} force When true it overrides current value when set
 */
export const restoreSessionProperty = (element, sessionKey, localKey, force) => {
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
}
/**
 * Stores a property in a session storage.
 * @param {String} sessionKey A storage key
 * @param {String|Array<String>} value Value to store
 */
export const storeSessionProperty = (sessionKey, value) => {
  if (!value) {
    return;
  }
  if (typeof value === 'object') {
    value = JSON.stringify(value);
  }
  sessionStorage.setItem(sessionKey, value);
}
