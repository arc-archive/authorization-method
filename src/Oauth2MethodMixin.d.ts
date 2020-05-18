declare interface GrantType {
  type: string;
  label: string;
}

export const setOauth2Defaults: symbol;
export const authorizeOauth2: symbol;
export const renderOauth2Auth: symbol;
export const restoreOauth2Auth: symbol;
export const serializeOauth2Auth: symbol;
export const oauth2CustomPropertiesTemplate: symbol;
export const autoHide: symbol;
export const clearOauth2Auth: symbol;
export const oauth2GrantTypes: Array<GrantType>;

declare function Oauth2MethodMixin<T extends new (...args: any[]) => {}>(base: T): T & Oauth2MethodMixinConstructor;
interface Oauth2MethodMixinConstructor {
  new(...args: any[]): Oauth2MethodMixin;
}

interface Oauth2MethodMixin {
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

export {Oauth2MethodMixinConstructor};
export {Oauth2MethodMixin};
