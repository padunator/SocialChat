import {Socket} from 'ngx-socket-io';
import {Injectable} from '@angular/core';

/**
 * This class is initializing the socket connection for socket communication within the game namespace
 */

@Injectable()
export class GameSocket extends Socket {

  constructor() {
    super({ url: 'http://localhost:3000/game', options: {} });
  }
}
