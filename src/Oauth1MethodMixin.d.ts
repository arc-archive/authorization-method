// tslint:disable:variable-name Describing an API that's defined elsewhere.
// tslint:disable:no-any describes the API as best we are able today

/// <reference path="AuthorizationBase.d.ts" />

import {html} from 'lit-element';
import {AuthorizationBase} from './AuthorizationBase.js';

import {notifyChange, normalizeType} from './Utils.js';

export const setOauth1Defaults: Symbol;
export const restoreOauth1Auth: Symbol;
export const serializeOauth1Auth: Symbol;
export const renderOauth1Auth: Symbol;
export const defaultSignatureMethods: string[];
export const clearOauth1Auth: string[];

export {Oauth1MethodMixin};

declare type Constructor<T = AuthorizationBase> = new (...args: any[]) => T;
interface Oauth1Mixin {
  consumerKey: string;
  consumerSecret: string;
  token: string;
  tokenSecret: string;
  timestamp: string;
  nonce: string;
  realm: string;
  signatureMethod: string;
  requestTokenUri: string;
  authTokenMethod: string;
  authParamsLocation: string;
  signatureMethods: string[];

  authorize(): any;
}

declare function Oauth1MethodMixin<TBase extends Constructor>(Base: TBase) : TBase & Oauth1Mixin;
