import { AuthDialogElement } from './AuthDialogElement.js';

export declare class AuthDialogNtlmElement extends AuthDialogElement {
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
  /** 
   * NT domain to login to.
   * @attribute
   */
  domain: string;
}
