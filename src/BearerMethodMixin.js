import { html } from 'lit-element';

import {
  renderPasswordInput,
} from './Utils.js';

export const serializeBearerAuth = Symbol();
export const restoreBearerAuth = Symbol();
export const renderBearerAuth = Symbol();
export const clearBearerAuth = Symbol();

/**
 * @typedef {Object} BearerParams
 * @property {string} token - Berarer token value
 */

/**
 * Mixin that adds support for Bearer method computations
 *
 * @param {*} superClass
 * @return {*}
 * @mixin
 */
export const BearerMethodMixin = (superClass) => class extends superClass {
  /**
   * Clears Bearer auth settings
   */
  [clearBearerAuth]() {
    this.token = '';
  }

  /**
   * Serialized input values
   * @return {BearerParams} An object with user input
   */
  [serializeBearerAuth]() {
    return {
      token: this.token || '',
    };
  }

  /**
   * Resotrespreviously serialized Bearer authentication values.
   * @param {BearerParams} settings Previously serialized values
   */
  [restoreBearerAuth](settings) {
    this.token = settings.token;
  }

  [renderBearerAuth]() {
    const {
      token,
    } = this;
    const tokenConfig = {
      required: true,
      autoValidate: true,
      invalidLabel: 'Token is required',
      classes: { block: true }
    };
    return html`
    <form autocomplete="on" class="bearer-auth">
      ${this[renderPasswordInput]('token', token, 'Token', tokenConfig)}
    </form>`;
  }
};
