export const setOauth1Defaults: symbol;
export const restoreOauth1Auth: symbol;
export const serializeOauth1Auth: symbol;
export const renderOauth1Auth: symbol;
export const clearOauth1Auth: symbol;
export const defaultSignatureMethods: string[];

declare function Oauth1MethodMixin<T extends new (...args: any[]) => {}>(base: T): T & Oauth1MethodMixinConstructor;
interface Oauth1MethodMixinConstructor {
  new(...args: any[]): Oauth1MethodMixin;
}

interface Oauth1MethodMixin {
  consumerKey: string;
  consumerSecret: string;
  token: string;
  tokenSecret: string;
  timestamp: string;
  /**
   * Server issued nonce for OAuth 1 authorization.
   *
   * Used in the following types:
   * - Digest
   * - OAuth 1
   */
  nonce: string;
  realm: string;
  signatureMethod: string;
  requestTokenUri: string;
  authTokenMethod: string;
  authParamsLocation: string;
  signatureMethods: string[];

  authorize(): any;
}

export {Oauth1MethodMixinConstructor};
export {Oauth1MethodMixin};
