import { html } from 'lit-element';

import {
  _renderInput,
  _renderPasswordInput,
} from './Utils.js';

export const _serializeBasicAuth = Symbol();
export const _restoreBasicAuth = Symbol();
export const _renderBasicAuth = Symbol();


/**
 * @typedef {Object} BasicParams
 * @property {string} password - User password value
 * @property {string} username - User name value
 */

/**
 * Mixin that adds support for Basic method computations
 *
 * @param {*} superClass
 * @return {*}
 * @mixin
 */
export const BasicMethodMixin = (superClass) => class extends superClass {
  /**
   * Serialized input values
   * @return {BasicParams} An object with user input
   */
  [_serializeBasicAuth]() {
    return {
      password: this.password || '',
      username: this.username || '',
    };
  }

  /**
   * Resotrespreviously serialized Basic authentication values.
   * @param {BasicParams} settings Previously serialized values
   */
  [_restoreBasicAuth](settings) {
    this.password = settings.password;
    this.username = settings.username;
  }

  [_renderBasicAuth]() {
    const {
      username,
      password,
    } = this;
    const uConfig = {
      required: true,
      autoValidate: true,
      invalidLabel: 'Username is required',
      classes: { block: true }
    };
    return html`
    <form autocomplete="on" class="basic-auth">
      ${this[_renderInput]('username', username, 'User name', uConfig)}
      ${this[_renderPasswordInput]('password', password, 'Password', {
        classes: { block: true }
      })}
    </form>`;
  }
};
