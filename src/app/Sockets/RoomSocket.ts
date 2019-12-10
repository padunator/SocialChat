import {Socket} from 'ngx-socket-io';
import {Injectable} from '@angular/core';

@Injectable()
export class RoomSocket extends Socket {

  constructor() {
    super({ url: 'http://localhost:3000/rooms', options: {} });
  }
}
