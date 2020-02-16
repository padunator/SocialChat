import { Injectable } from '@angular/core';
import {Subject} from 'rxjs/internal/Subject';
import {HttpClient} from '@angular/common/http';
import {ChatMessage} from '../interfaces/chatMessage.model';
import {Router} from '@angular/router';
import {User} from '../interfaces/user.model';
import {map} from 'rxjs/operators';
import {ChatSocket} from '../Sockets/ChatSocket';

/**
 * This Service serves as an endpoint interface for Backend Communication, for all Chatroom related operations
 * Any operation needed inside the chatroom (Socket and REST) is being called or interpreted here
 */

@Injectable({providedIn: 'root'})
export class ChatService {
  private chatMessages: ChatMessage[] = [];
  private users: User[] = [];
  private userLoggedListener = new Subject<User[]>();
  private chatUpdated = new Subject<ChatMessage[]>();
  private emojiSelected = new Subject<any>();

  // Socket-event-listeners
  newMessage = this.socket.fromEvent<ChatMessage>('ChatMessage');
  newUser = this.socket.fromEvent<any>('userLogged');

  constructor(private http: HttpClient, private  router: Router, private socket: ChatSocket) { }

  // Sending & Saving Chat messages - demonstration by using Socket and Rest API
  sendMessage(chatMsg: ChatMessage) {
    // Sending the message to the other users
    this.socket.emit('new-message', chatMsg);
    // Saving the message and doing sentiment logic
    this.http.post<{ message: string, id: string }>('http://192.168.0.164:3000/api/chat', chatMsg)
      .subscribe(responseData => {
        chatMsg.key = responseData.id;
      });
  }

  // Inform observable if emoji was selected
  addEmoji($event: any) {
    this.emojiSelected.next($event);
  }

  // Rest API call for getting whole chat feed
  getMessages() {
    this.http.get<{ message: string, chatMessages: any }>('http://192.168.0.164:3000/api/chat')
      .subscribe(mappedMessage => {
        this.chatMessages = mappedMessage.chatMessages;
        this.chatUpdated.next([...this.chatMessages]);
      });
  }

  // Get event listeners
  getChatUpdatedListener() {
    return this.chatUpdated.asObservable();
  }

  getEmojiSelectedListener() {
    return this.emojiSelected.asObservable();
  }

  getUserLoggedListener() {
    return this.userLoggedListener.asObservable();
  }

  // Rest API call for getting list of all users
  getUsers() {
    this.http.get<{ user: User[] }>('http://192.168.0.164:3000/api/user/getUsers')
      .pipe(map(postData => {
        return postData.user.map(user => {
          return {
            email: user.email,
            password: user.password,
            username: user.username,
            status: user.status
          };
        });
      }))
      .subscribe(mappedResult => {
        this.users = mappedResult;
        this.userLoggedListener.next([...this.users]);
      });
  }
}
