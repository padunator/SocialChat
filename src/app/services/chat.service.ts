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
  /**
   * Array of actual chat messages, loaded from the DB
   */
  private chatMessages: ChatMessage[] = [];
  /**
   * Array of currently registered users
   */
  private users: User[] = [];
  /**
   * Subject to listen for logged in users
   */
  private userLoggedListener = new Subject<User[]>();
  /**
   * Subject to indicate that chat content has been updated
   */
  private chatUpdated = new Subject<ChatMessage[]>();
  /**
   * Event to listen for or indicate emoji selection
   */
  private emojiSelected = new Subject<any>();

  /**
   * Listens for new sent messages
   */
  newMessage = this.socket.fromEvent<ChatMessage>('ChatMessage');
  /**
   * Listens for newly logged users
   */
  newUser = this.socket.fromEvent<any>('userLogged');

  /**
   * Constructor with injected object instances needed during game execution
   * @param http Http Client for REST API calls
   * @param router Router for switching pages
   * @param socket Chat Socket for socket communication within the chat namespace
   */
  constructor(private http: HttpClient, private  router: Router, private socket: ChatSocket) { }

  /**
   * Sending & Saving Chat messages - demonstration by using Socket and Rest API
   * @param chatMsg The actual message sent
   */
  sendMessage(chatMsg: ChatMessage) {
    // Sending the message to the other users
    this.socket.emit('new-message', chatMsg);
    // Saving the message and doing sentiment logic
    this.http.post<{ message: string, id: string }>('http://localhost:3000/api/chat', chatMsg)
      .subscribe(responseData => {
        chatMsg.key = responseData.id;
      });
  }

  /**
   * Inform observable that emoji was selected and send the emoji to the observable
   * @param $event The actual emoji which has been selected
   */
  addEmoji($event: any) {
    this.emojiSelected.next($event);
  }

  /**
   *  Rest API call for getting whole chat feed
   */
  getMessages() {
    this.http.get<{ message: string, chatMessages: any }>('http://localhost:3000/api/chat')
      .subscribe(mappedMessage => {
        this.chatMessages = mappedMessage.chatMessages;
        this.chatUpdated.next([...this.chatMessages]);
      });
  }

  /**
   * Returns the observable for updated chats
   */
  getChatUpdatedListener() {
    return this.chatUpdated.asObservable();
  }

  /**
   * Returns the observable for selected emojis
   */
  getEmojiSelectedListener() {
    return this.emojiSelected.asObservable();
  }

  /**
   * Returns the observable for logged users
   */
  getUserLoggedListener() {
    return this.userLoggedListener.asObservable();
  }

  /**
   * Rest API call for getting all registered users
   */
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
