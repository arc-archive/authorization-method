
// tslint:disable:variable-name Describing an API that's defined elsewhere.
// tslint:disable:no-any describes the API as best we are able today

import {LitElement, html} from 'lit-element';

import {notifyChange} from './Utils.js';

export const typeChangedSymbol: Symbol;

export {AuthorizationBase};

/**
 * A base class for authorization methods.
 * The public methods of this class should be implemented on a child class.
 *
 * The class has minimal setup and mostly do nothing. It provides a sceleton
 * for other authorization methods that implemented the same interface.
 */
declare class AuthorizationBase extends LitElement {
  type: string;
  readOnly: boolean;
  disabled: boolean;
  compatibility: boolean;
  outlined: boolean;
  narrow: boolean;
  onchange: any|null;
  constructor();
  /**
   * Clears settings for current type.
   */
  clear(): void;

  /**
   * Creates a settings object with user provided data for current method.
   *
   * @returns User provided data
   */
  serialize(): object|null;

  /**
   * Restores previously serialized values.
   *
   * @param settings Previously serialized settings.
   */
  restore(settings: object|null): void;

  /**
   * @returns Valudation state for current authorization method.
   */
  validate(): Boolean|null;

  /**
   * This method only works for OAuth 1 and OAuth 2 authorization methods.
   *
   * Authorizes the user by starting OAuth flow.
   */
  authorize(): any|null;
}
