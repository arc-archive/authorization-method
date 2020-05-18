import { html } from 'lit-element';
import { dedupeMixin } from '@open-wc/dedupe-mixin';
import { passwordTemplate, inputTemplate } from './CommonTemplates.js';
import { inputHandler } from './Utils.js';

/** @typedef {import('./AuthorizationMethod').AuthorizationMethod} AuthorizationMethod */

export const serializeBasicAuth = Symbol('serializeBasicAuth');
export const restoreBasicAuth = Symbol('restoreBasicAuth');
export const renderBasicAuth = Symbol('renderBasicAuth');
export const clearBasicAuth = Symbol('clearBasicAuth');

/**
 * @typedef {Object} BasicParams
 * @property {string} password - User password value
 * @property {string} username - User name value
 */

/**
 * @param {AuthorizationMethod} base
 */
const mxFunction = (base) => {
  class BasicMethodMixinImpl extends base {
    /**
     * Clears basic auth settings
     */
    [clearBasicAuth]() {
      this.password = '';
      this.username = '';
    }

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
      const { username, password } = this;
      const uConfig = {
        required: true,
        autoValidate: true,
        invalidLabel: 'Username is required',
        classes: { block: true },
      };
      return html` <form autocomplete="on" class="basic-auth">
        ${inputTemplate(
          'username',
          username,
          'User name',
          this[inputHandler],
          uConfig
        )}
        ${passwordTemplate(
          'password',
          password,
          'Password',
          this[inputHandler],
          {
            classes: { block: true },
          }
        )}
      </form>`;
    }
  }
  return BasicMethodMixinImpl;
};

/**
 *
 *
 * @mixin
 */
export const BasicMethodMixin = dedupeMixin(mxFunction);
