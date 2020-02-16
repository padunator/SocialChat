/**
 * This Interface represents the data model of the user information which is sent between Client and Server
 */

export interface User {
  _id?: string;
  email: string;
  username: string;
  password: string;
  status: boolean;
}
