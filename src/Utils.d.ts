export const METHOD_OAUTH2: string;
export const METHOD_OAUTH1: string;
export const METHOD_BASIC: string;
export const METHOD_BEARER: string;
export const METHOD_NTLM: string;
export const METHOD_DIGEST: string;
export const CUSTOM_CREDENTIALS: string;

export const selectionHandler: symbol;
export const inputHandler: symbol;

export {normalizeType};


/**
 * Normalizes type name to a string identifier.
 * It casts input to a string and lowercase it.
 *
 * @returns Normalized value.
 */
declare function normalizeType(type: String): String;

export {notifyChange};


/**
 * Dispatches `change` event on passed `element`
 */
declare function notifyChange(element: HTMLElement): void;

export {restoreSessionProperty};


/**
 * Restores an item from a session store and assigns it to a local
 * property.
 */
declare function restoreSessionProperty(element: HTMLElement, sessionKey: String, localKey: String, force?: Boolean): void;

export {storeSessionProperty};


/**
 * Stores a property in a session storage.
 */
declare function storeSessionProperty(sessionKey: String, value: String|Array<String>): void;

/**
 * Gets credentials from sources if defined
 * @param clientIdValue
 * @param clientSecretValue
 * @param disabled
 * @param credentialsSource
 * @param selectedSource
 * @param grantType
 */
declare function clientCredentials(clientIdValue: String, clientSecretValue: String, disabled: Boolean, credentialsSource: Array<Object>, selectedSource: String, grantType: String): {clientId: String, clientSecret: String, editable: Boolean}

export {clientCredentials};