/** @module authorization-method/AuthorizationBase */
import { LitElement } from 'lit-element';

export const typeChangedSymbol = Symbol();

/**
 * A base class for authorization methods.
 * The public methods of this class should be implemented on a child class.
 *
 * The class has minimal setup and mostly do nothing. It provides a sceleton
 * for other authorization methods that implemented the same interface.
 */
export class AuthorizationBase extends LitElement {
  static get properties() {
    return {
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
      type: { type: String, reflect: true },
      /**
       * When set the editor is in read only mode.
       */
      readOnly: { type: Boolean },
      /**
       * When set the inputs are disabled
       */
      disabled: { type: Boolean },
      /**
       * Enables compatibility with Anypoint components.
       */
      compatibility: { type: Boolean },
      /**
       * Enables Material Design outlined style
       */
      outlined: { type: Boolean },
      /**
       * Renders mobile friendly view.
       */
      narrow: { type: Boolean, reflect: true },
    };
  }

  get type() {
    return this._type;
  }

  set type(value) {
    const old = this._type;
    if (old === value) {
      return;
    }
    this._type = value;
    this.requestUpdate('type', old);
    this[typeChangedSymbol](value);
  }

  get onchange() {
    return this._onChange;
  }

  set onchange(value) {
    if (this._onChange) {
      this.removeEventListener('change', this._onChange);
    }
    if (typeof value !== 'function') {
      this._onChange = null;
      return;
    }
    this._onChange = value;
    this.addEventListener('change', value);
  }
  /**
   * A function called when `type` changed.
   * Note, that other properties may not be initialized just yet.
   *
   * @param {String} type Current value.
   */
  [typeChangedSymbol](type) {
    // to be implemented by child class.
  }

  /**
   * Creates a settings object with user provided data for current method.
   *
   * @return {Object} User provided data
   */
  serialize() {
    return {};
  }
  /**
   * Restores previously serialized values.
   * @param {Object} settings Previously serialized settings.
   */
  restore(settings) {
    // to be implemented by child class.
  }
  /**
   * @return {Boolean} Valudation state for current authorization method.
   */
  validate() {
    return true;
  }

  /**
   * This method only works for OAuth 1 and OAuth 2 authorization methods.
   *
   * Authorizes the user by starting OAuth flow.
   *
   * @return {any}
   */
  authorize() {
    return null;
  }
}
