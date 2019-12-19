import {Component, OnInit, Input, AfterViewChecked} from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ChatMessage} from '../interfaces/chatMessage.model';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit {

  @Input() chatMessage: ChatMessage;
  userEmail: string;
  userName: string;
  messageContent: string;
  timeStamp: string;
  isOwnMessage: boolean;
  url_matches: any;

  constructor(private authService: AuthService) {}

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
