import { Injectable } from '@angular/core';
import {Subject} from 'rxjs/internal/Subject';
import {HttpClient} from '@angular/common/http';
import {ChatMessage} from '../interfaces/chatMessage.model';
import {Router} from '@angular/router';
import {User} from '../interfaces/user.model';
import {map} from 'rxjs/operators';
import {ChatSocket} from '../Sockets/ChatSocket';


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
    this.http.post<{ message: string, id: string }>('http://localhost:3000/api/chat', chatMsg)
      .subscribe(responseData => {
        chatMsg.key = responseData.id;
        // this.chatMessages.push(chatMsg);
        // this.chatUpdated.next([...this.chatMessages]);
      });
  }

  addEmoji($event: any) {
    this.emojiSelected.next($event);
  }

  getMessages() {
    this.http.get<{ message: string, chatMessages: any }>('http://localhost:3000/api/chat')
      .subscribe(mappedMessage => {
        this.chatMessages = mappedMessage.chatMessages;
        this.chatUpdated.next([...this.chatMessages]);
      });
  }

  getChatUpdatedListener() {
    return this.chatUpdated.asObservable();
  }

  getEmojiSelectedListener() {
    return this.emojiSelected.asObservable();
  }

  getUserLoggedListener() {
    return this.userLoggedListener.asObservable();
  }

  getUsers() {
    this.http.get<{ user: User[] }>('http://localhost:3000/api/user/getUsers')
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
