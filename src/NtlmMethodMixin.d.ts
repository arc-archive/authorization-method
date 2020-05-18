export const serializeNtlmAuth: symbol;
export const restoreNtlmAuth: symbol;
export const renderNtlmAuth: symbol;
export const clearNtlmAuth: symbol;

declare function NtlmMethodMixin<T extends new (...args: any[]) => {}>(base: T): T & NtlmMethodMixinConstructor;
interface NtlmMethodMixinConstructor {
  new(...args: any[]): NtlmMethodMixin;
}

interface NtlmMethodMixin {
  /**
   * Authorization domain
   *
   * Used in the following types:
   * - NTLM
   */
  domain?: string;
}

export {NtlmMethodMixinConstructor};
export {NtlmMethodMixin};
