// tslint:disable:variable-name Describing an API that's defined elsewhere.
// tslint:disable:no-any describes the API as best we are able today

import {html} from 'lit-element';
import {AuthorizationBase} from './AuthorizationBase.js';

export const serializeNtlmAuth: Symbol;
export const restoreNtlmAuth: Symbol;
export const renderNtlmAuth: Symbol;
export const clearNtlmAuth: Symbol;

export {NtlmMethodMixin};

declare type Constructor<T = AuthorizationBase> = new (...args: any[]) => T;
interface NtlmMixin {
  domain: string;
}

declare function NtlmMethodMixin<TBase extends Constructor>(Base: TBase) : TBase & NtlmMixin;
