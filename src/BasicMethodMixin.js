import { html } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map.js';
import {
  notifyChange,
  _renderInput,
  _renderPasswordInput,
  _inputHandler,
  _selectionHandler,
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
  static get properties() {
    return {

    };
  }

  [_inputHandler](e) {
    const { name, value } = e.target;
    this[name] = value;
    notifyChange(this);
  }

  [_selectionHandler](e) {
    const { parentElement, selected } = e.target;
    const name = parentElement.name;
    this[name] = selected;
    notifyChange(this);
  }

  [_renderInput](name, value, label, opts) {
    const {
      outlined,
      compatibility,
      readOnly,
      disabled
    } = this;
    opts = opts || {};
    opts.type = opts.type || 'text';
    if (opts.autocomplete === undefined) {
      opts.autocomplete = true;
    }
    return html`<anypoint-input
      .value="${value}"
      @input="${this[_inputHandler]}"
      name="${name}"
      type="${opts.type}"
      ?required="${opts.required}"
      ?autoValidate="${opts.autoValidate}"
      ?autocomplete="${opts.autocomplete}"
      .outlined="${outlined}"
      .compatibility="${compatibility}"
      .readOnly="${readOnly}"
      .disabled="${disabled}"
      .invalidMessage="${opts.invalidLabel}"
      class="${classMap(opts.classes)}"
      ?data-persistent="${opts.persistent}"
    >
      <label slot="label">${label}</label>
    </anypoint-input>`;
  }

  [_renderPasswordInput](name, value, label, opts) {
    const {
      outlined,
      compatibility,
      readOnly,
      disabled
    } = this;
    opts = opts || {};
    if (opts.autocomplete === undefined) {
      opts.autocomplete = true;
    }
    return html`<anypoint-masked-input
      .value="${value}"
      @input="${this[_inputHandler]}"
      name="${name}"
      ?required="${opts.required}"
      ?autoValidate="${opts.autoValidate}"
      ?autocomplete="${opts.autocomplete}"
      .outlined="${outlined}"
      .compatibility="${compatibility}"
      .readOnly="${readOnly}"
      .disabled="${disabled}"
      .invalidMessage="${opts.invalidLabel}"
      class="${classMap(opts.classes)}"
      ?data-persistent="${opts.persistent}"
    >
      <label slot="label">${label}</label>
    </anypoint-masked-input>`;
  }

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
