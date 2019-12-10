
// tslint:disable:variable-name Describing an API that's defined elsewhere.
// tslint:disable:no-any describes the API as best we are able today

export const METHOD_OAUTH2: string;
export const METHOD_OAUTH1: string;
export const METHOD_BASIC: string;
export const METHOD_NTLM: string;
export const METHOD_DIGEST: string;

export const renderInput: Symbol;
export const renderPasswordInput: Symbol;
export const _selectionHandler: Symbol;
export const _inputHandler: Symbol;

export {normalizeType};


/**
 * Normalizes type name to a string identifier.
 * It casts input to a string and lowercase it.
 *
 * @returns Normalized value.
 */
declare function normalizeType(type: String|null): String|null;

export {notifyChange};


/**
 * Dispatches `change` event on passed `element`
 */
declare function notifyChange(element: AuthorizationMethod|null): void;

export {getEventTarget};


/**
 * Returns the event target.
 */
declare function getEventTarget(e: Event|null): any|null;

export {restoreSessionProperty};


/**
 * Restores an item from a session store and assigns it to a local
 * property.
 */
declare function restoreSessionProperty(element: AuthorizationMethod|null, sessionKey: String|null, localKey: String|null, force?: Boolean|null): void;

export {storeSessionProperty};


/**
 * Stores a property in a session storage.
 */
declare function storeSessionProperty(sessionKey: String|null, value: String|Array<String|null>|null): void;
