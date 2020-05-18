export const serializeBasicAuth: symbol;
export const restoreBasicAuth: symbol;
export const renderBasicAuth: symbol;
export const clearBasicAuth: symbol;

declare function BasicMethodMixin<T extends new (...args: any[]) => {}>(base: T): T & BasicMethodMixinConstructor;
interface BasicMethodMixinConstructor {
  new(...args: any[]): BasicMethodMixin;
}

interface BasicMethodMixin {}

export {BasicMethodMixinConstructor};
export {BasicMethodMixin};
