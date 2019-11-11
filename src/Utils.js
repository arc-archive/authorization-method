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
export const METHOD_NTLM = 'ntlm';
export const METHOD_DIGEST = 'digest';
export const METHOD_OAUTH1 = 'oauth 1';
export const METHOD_OAUTH2 = 'oauth 2';

/**
 * Dispatches `change` event on passed `element`
 * @param {HTMLElement} element Event target
 */
export const notifyChange = (element) => {
  element.dispatchEvent(new CustomEvent('change'));
}
