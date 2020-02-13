// tslint:disable:variable-name Describing an API that's defined elsewhere.
// tslint:disable:no-any describes the API as best we are able today

export const serializeBasicAuth: Symbol;
export const restoreBasicAuth: Symbol;
export const renderBasicAuth: Symbol;
export const clearBasicAuth: Symbol;


import {html} from 'lit-element';

export {BasicMethodMixin};


/**
 * Mixin that adds support for Basic method computations
 */
declare function BasicMethodMixin(superClass: any): any;
