import * as SocketIO from 'socket.io';
import {Socket} from 'ngx-socket-io';

export interface AuthData {
  email: string;
  password: string;
  socket?: Socket;
}
