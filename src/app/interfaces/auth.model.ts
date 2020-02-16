import * as SocketIO from 'socket.io';
import {Socket} from 'ngx-socket-io';

/**
 * This Interface represents the data model of the authentication data which is sent between Client and Server
 */

export interface AuthData {
  email: string;
  password: string;
  socket?: Socket;
}
