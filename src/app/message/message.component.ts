import {Component, OnInit, Input} from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ChatMessage} from '../interfaces/chatMessage.model';

/**
 * This code serves as logic, view & style related component, exclusively for the message box inside the chat-feed
 */

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit {

  /**
   * The actual message, introduced in the corresponding Template (html)
   */
  @Input() chatMessage: ChatMessage;
  userEmail: string;
  userName: string;
  messageContent: string;
  timeStamp: string;
  isOwnMessage: boolean;
  url_matches: any;

  /**
   * Constructor for injecting the needed object instances into the Component
   * @param authService The authentication service which holds user related data
   */
  constructor(private authService: AuthService) {}

  /**
   * OnInit method which gets called always when this page/component is loaded
   * @param chatMessage The introduced chat message which holds message, user, date etc.
   */
  ngOnInit(chatMessage = this.chatMessage) {
    // this.url_matches = this.chatMessage.message.match(/\b(http|https)?:\/\/\S+/gi) || [];
    this.messageContent = chatMessage.message;
    this.timeStamp = chatMessage.timeSent;
    this.userEmail = chatMessage.email;
    this.userName = chatMessage.username;
    this.isOwnMessage = chatMessage.email === this.authService.userMail;
    this.url_matches = chatMessage.url_matches;
  }
}
