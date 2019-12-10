import { html } from 'lit-element';

import {
  renderInput,
  renderPasswordInput,
} from './Utils.js';

export const serializeBasicAuth = Symbol();
export const restoreBasicAuth = Symbol();
export const renderBasicAuth = Symbol();


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
  [serializeBasicAuth]() {
    return {
      password: this.password || '',
      username: this.username || '',
    };
  }

  /**
   * Resotrespreviously serialized Basic authentication values.
   * @param {BasicParams} settings Previously serialized values
   */
  [restoreBasicAuth](settings) {
    this.password = settings.password;
    this.username = settings.username;
  }

  [renderBasicAuth]() {
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
      ${this[renderInput]('username', username, 'User name', uConfig)}
      ${this[renderPasswordInput]('password', password, 'Password', {
        classes: { block: true }
      })}
    </form>`;
  }
};
