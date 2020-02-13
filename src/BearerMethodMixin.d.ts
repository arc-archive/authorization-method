// tslint:disable:variable-name Describing an API that's defined elsewhere.
// tslint:disable:no-any describes the API as best we are able today

export const serializeBearerAuth: Symbol;
export const restoreBearerAuth: Symbol;
export const renderBearerAuth: Symbol;
export const clearBearerAuth: Symbol;


import {html} from 'lit-element';

export {BearerMethodMixin};


/**
 * Mixin that adds support for Basic method computations
 */
declare function BearerMethodMixin(superClass: any): any;
