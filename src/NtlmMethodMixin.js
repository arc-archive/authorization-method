import { html } from 'lit-element';
import { dedupeMixin } from '@open-wc/dedupe-mixin';
import { inputHandler } from './Utils.js';
import { passwordTemplate, inputTemplate } from './CommonTemplates.js';

/** @typedef {import('./AuthorizationMethod').AuthorizationMethod} AuthorizationMethod */

export const serializeNtlmAuth = Symbol('serializeNtlmAuth');
export const restoreNtlmAuth = Symbol('restoreNtlmAuth');
export const renderNtlmAuth = Symbol('renderNtlmAuth');
export const clearNtlmAuth = Symbol('clearNtlmAuth');

/**
 * @typedef {Object} NtlmParams
 * @property {string} password - User password value
 * @property {string} username - User name value
 * @property {string} domain - NT domain
 */

/**
 * @param {AuthorizationMethod} base
 */
const mxFunction = (base) => {
  class NtlmMethodMixinImpl extends base {
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
      const { username, password, domain } = this;
      return html` <form autocomplete="on" class="ntlm-auth">
        ${inputTemplate('username', username, 'User name', this[inputHandler], {
          required: true,
          autoValidate: true,
          invalidLabel: 'Username is required',
          classes: { block: true },
        })}
        ${passwordTemplate(
          'password',
          password,
          'Password',
          this[inputHandler],
          {
            classes: { block: true },
          }
        )}
        ${inputTemplate('domain', domain, 'NT domain', this[inputHandler], {
          classes: { block: true },
        })}
      </form>`;
    }
  }
  return NtlmMethodMixinImpl;
};

/**
 * A mixin that adds support for NTLM method computations.
 *
 * @mixin
 */
export const NtlmMethodMixin = dedupeMixin(mxFunction);
