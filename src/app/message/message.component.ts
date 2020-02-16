import {Component, OnInit, Input, AfterViewChecked, ViewChild, ElementRef} from '@angular/core';
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
export class MessageComponent implements OnInit, AfterViewChecked {

  @Input() chatMessage: ChatMessage;
  userEmail: string;
  userName: string;
  messageContent: string;
  timeStamp: string;
  isOwnMessage: boolean;
  url_matches: any;

  // Needed for Microlink Preview
/*  @Input() url: string;
  @Input() options: object;
  @Input() style: object;
  @ViewChild('card', { static: false }) card: ElementRef;*/
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

  ngAfterViewChecked(): void {
    // @ts-ignore
    // eslint-disable-next-line no-undef
    // microlink(this.card.nativeElement, this.options);
  }

}
