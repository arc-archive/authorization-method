export const serializeBearerAuth: symbol;
export const restoreBearerAuth: symbol;
export const renderBearerAuth: symbol;
export const clearBearerAuth: symbol;

declare function BearerMethodMixin<T extends new (...args: any[]) => {}>(base: T): T & BearerMethodMixinConstructor;
interface BearerMethodMixinConstructor {
  new(...args: any[]): BearerMethodMixin;
}

interface BearerMethodMixin {
}

export {BearerMethodMixinConstructor};
export {BearerMethodMixin};
