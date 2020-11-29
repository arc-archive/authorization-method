import { AuthDialogElement } from './AuthDialogElement.js';

export class AuthDialogBasicElement extends AuthDialogElement {
  /** 
   * User login
   * @attribute
   */
  username: string;
  /** 
   * User password
   * @attribute
   */
  password: string;
}
