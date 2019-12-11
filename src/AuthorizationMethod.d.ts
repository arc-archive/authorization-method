
// tslint:disable:variable-name Describing an API that's defined elsewhere.
// tslint:disable:no-any describes the API as best we are able today

import {html} from 'lit-element';

import {BasicMethodMixin} from './BasicMethodMixin.js';

import {NtlmMethodMixin} from './NtlmMethodMixin.js';

import {DigestMethodMixin} from './DigestMethodMixin.js';

import {Oauth1MethodMixin} from './Oauth1MethodMixin.js';

import {Oauth2MethodMixin} from './Oauth2MethodMixin.js';

import {validateForm} from './Validation.js';

import {normalizeType} from './Utils.js';

import {AuthorizationBase} from './AuthorizationBase.js';

export {AuthorizationMethod};

/**
 * An element that renders various authorization methods.
 *
 * ## Development
 *
 * The element mixes in multimple mixins from `src/` directory.
 * Each mixin support an authorization method. When selection change (the `type`
 * property) a render function from correcponding mixin is called.
 */
declare class AuthorizationMethod extends
  Oauth2MethodMixin(
  Oauth1MethodMixin(
  DigestMethodMixin(
  BasicMethodMixin(
  NtlmMethodMixin(
  AuthorizationBase))))) {
  readonly styles: any;

  /**
   * Used in the following types:
   * - OAuth 1
   * - OAuth 2
   */
  readonly authorizing: Boolean|null;
  _authorizing: Boolean|null;
  password: string;
  username: string;
  redirectUri: string;
  accessTokenUri: string;
  authorizationUri: string;

  constructor();
  connectedCallback(): void;
  render(): any;

  /**
   * Creates a settings object with user provided data for current method.
   *
   * @returns User provided data
   */
  serialize(): object|null;

  /**
   * Restores previously serialized settings.
   * A method type must be selected before calling this function.
   *
   * @param settings Depends on current type.
   */
  restore(settings: object|null): any|null;

  /**
   * Validates current method.
   */
  validate(): Boolean|null;
}
