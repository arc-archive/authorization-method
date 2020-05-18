import { LitElement, CSSResult, TemplateResult } from 'lit-element';
import {EventsTargetMixin} from '@advanced-rest-client/events-target-mixin/events-target-mixin.js';
import {BasicMethodMixin} from './BasicMethodMixin';
import {NtlmMethodMixin} from './NtlmMethodMixin';
import {DigestMethodMixin} from './DigestMethodMixin';
import {Oauth1MethodMixin} from './Oauth1MethodMixin';
import {Oauth2MethodMixin} from './Oauth2MethodMixin';
import {BearerMethodMixin} from './BearerMethodMixin';

export const typeChangedSymbol: symbol;

export declare interface AuthorizationMethod extends Oauth2MethodMixin, Oauth1MethodMixin, DigestMethodMixin, BearerMethodMixin, BasicMethodMixin, NtlmMethodMixin, EventsTargetMixin, LitElement {
}

/**
 * An element that renders various authorization methods.
 *
 * ## Development
 *
 * The element mixes in multimple mixins from `src/` directory.
 * Each mixin support an authorization method. When selection change (the `type`
 * property) a render function from correcponding mixin is called.
 */
export declare class AuthorizationMethod {
  readonly styles: CSSResult;

  /**
   * Authorization method type.
   *
   * Supported types are (case insensitive, spaces sensitive):
   *
   * - Basic
   * - Client certificate
   * - Digest
   * - NTLM
   * - OAuth 1
   * - OAuth 2
   *
   * Depending on selected type different properties are used.
   * For example Basic type only uses `username` and `password` properties,
   * while NTLM also uses `domain` property.
   *
   * See readme file for detailed list of properties depending on selected type.
   */
  type: string;
  /**
   * When set the editor is in read only mode.
   */
  readOnly: boolean;
  /**
   * When set the inputs are disabled
   */
  disabled: boolean;
  /**
   * Enables compatibility with Anypoint components.
   */
  compatibility: boolean;
  /**
   * Enables Material Design outlined style
   */
  outlined: boolean;
  /**
   * Renders mobile friendly view.
   */
  narrow: boolean;

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
  token: string;
  onchange: EventListener|null;

  constructor();
  connectedCallback(): void;
  render(): TemplateResult;

  /**
   * Clears settings for current type.
   */
  clear(): void;

  /**
   * Creates a settings object with user provided data for current method.
   *
   * @returns User provided data
   */
  serialize(): object;

  /**
   * Restores previously serialized settings.
   * A method type must be selected before calling this function.
   *
   * @param settings Depends on current type.
   */
  restore(settings: object): any;

  /**
   * Validates current method.
   */
  validate(): Boolean;

  authorize(): any;
}
