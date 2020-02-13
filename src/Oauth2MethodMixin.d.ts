// tslint:disable:variable-name Describing an API that's defined elsewhere.
// tslint:disable:no-any describes the API as best we are able today

import {html} from 'lit-element';
import {AuthorizationBase} from './AuthorizationBase.js';
import {notifyChange, restoreSessionProperty, storeSessionProperty, normalizeType} from './Utils.js';

export {Oauth2MethodMixin};

declare interface GrantType {
  type: string;
  label: string;
}

export const setOauth2Defaults: Symbol;
export const authorizeOauth2: Symbol;
export const renderOauth2Auth: Symbol;
export const restoreOauth2Auth: Symbol;
export const serializeOauth2Auth: Symbol;
export const oauth2CustomPropertiesTemplate: Symbol;
export const autoHide: Symbol;
export const clearOauth2Auth: Symbol;
export const oauth2GrantTypes: Array<GrantType>;

declare type Constructor<T = AuthorizationBase> = new (...args: any[]) => T;
interface Oauth2Mixin {
  readonly isCustomGrant: boolean;
  readonly clientIdRequired: boolean;
  readonly oauth2ClientSecretRendered: boolean;
  readonly oauth2AuthorizationUriRendered: boolean;
  readonly oauth2AccessTokenUriRendered: boolean;
  readonly oauth2PasswordRendered: boolean;
  readonly lastState: string;
  grantType: string;
  clientId: string;
  clientSecret: string;
  scopes: string[];
  allowedScopes: string[];
  preventCustomScopes: boolean;
  accessToken: boolean;
  tokenType: boolean;
  grantTypes: string[];
  isAdvanced: boolean;
  advancedOpened: boolean;
  noGrantType: boolean;
  oauthDeliveryMethod: string;
  oauthDeliveryName: string;
  baseUri: string;
  _lastState: string;

  authorize(): any;
  generateState(): string;
}

declare function Oauth2MethodMixin<TBase extends Constructor>(Base: TBase) : TBase & Oauth2Mixin;
