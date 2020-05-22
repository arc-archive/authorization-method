import { html } from 'lit-element';
import { dedupeMixin } from '@open-wc/dedupe-mixin';
import { passwordTemplate } from './CommonTemplates.js';
import { inputHandler } from './Utils.js';

/** @typedef {import('./AuthorizationMethod').AuthorizationMethod} AuthorizationMethod */

export const serializeBearerAuth = Symbol('serializeBearerAuth');
export const restoreBearerAuth = Symbol('restoreBearerAuth');
export const renderBearerAuth = Symbol('renderBearerAuth');
export const clearBearerAuth = Symbol('clearBearerAuth');

/**
 * @typedef {Object} BearerParams
 * @property {string} token - Berarer token value
 */

/**
 * @param {AuthorizationMethod} base
 */
const mxFunction = (base) => {
  class BearerMethodMixinImpl extends base {
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
      const { token, outlined, compatibility, readOnly, disabled } = this;
      const tokenConfig = {
        required: true,
        autoValidate: true,
        invalidLabel: 'Token is required',
        classes: { block: true },
        outlined,
        compatibility,
        readOnly,
        disabled,
      };
      return html` <form autocomplete="on" class="bearer-auth">
        ${passwordTemplate(
          'token',
          token,
          'Token',
          this[inputHandler],
          tokenConfig
        )}
      </form>`;
    }
  }
  return BearerMethodMixinImpl;
};

/**
 *
 *
 * @mixin
 */
export const BearerMethodMixin = dedupeMixin(mxFunction);
