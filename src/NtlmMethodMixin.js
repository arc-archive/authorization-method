import { html } from 'lit-element';
import {
  renderInput,
  renderPasswordInput,
} from './Utils.js';

export const serializeNtlmAuth = Symbol();
export const restoreNtlmAuth = Symbol();
export const renderNtlmAuth = Symbol();
export const clearNtlmAuth = Symbol();

/**
 * @typedef {Object} NtlmParams
 * @property {string} password - User password value
 * @property {string} username - User name value
 * @property {string} domain - NT domain
 */

/**
 * Mixin that adds support for NTLM method computations
 *
 * @param {*} superClass
 * @return {*}
 * @mixin
 */
export const NtlmMethodMixin = (superClass) => class extends superClass {
  static get properties() {
    return {
      /**
       * Authorization domain
       *
       * Used in the following types:
       * - NTLM
       */
      domain: { type: String },
    };
  }

  /**
   * Clears NTLM auth settings
   */
  [clearNtlmAuth]() {
    this.password = '';
    this.username = '';
    this.domain = '';
  }

  /**
   * Serialized input values
   * @return {NtlmParams} An object with user input
   */
  [serializeNtlmAuth]() {
    return {
      password: this.password || '',
      username: this.username || '',
      domain: this.domain || '',
    };
  }

  /**
   * Resotres previously serialized NTML authentication values.
   * @param {NtlmParams} settings Previously serialized values
   */
  [restoreNtlmAuth](settings) {
    this.password = settings.password;
    this.username = settings.username;
    this.domain = settings.domain;
  }

  [renderNtlmAuth]() {
    const {
      username,
      password,
      domain
    } = this;
    return html`
    <form autocomplete="on" class="ntlm-auth">
      ${this[renderInput]('username', username, 'User name', {
        required: true,
        autoValidate: true,
        invalidLabel: 'Username is required',
        classes: { block: true }
      })}
      ${this[renderPasswordInput]('password', password, 'Password', {
        classes: { block: true }
      })}
      ${this[renderInput]('domain', domain, 'NT domain', {
        classes: { block: true }
      })}
    </form>`;
  }
};
