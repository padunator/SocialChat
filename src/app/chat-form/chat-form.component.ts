import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import { ChatService } from '../services/chat.service';
import {ChatMessage} from '../interfaces/chatMessage.model';
import {User} from '../interfaces/user.model';
import {AuthService} from '../services/auth.service';
import {Subscription} from 'rxjs/internal/Subscription';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';

@Component({
  selector: 'app-chat-form',
  templateUrl: './chat-form.component.html',
  styleUrls: ['./chat-form.component.css'],
})

export class ChatFormComponent implements OnInit {
  showEmojiPicker = false;
  message: string;
  currUser: User;
  userAuthenticated = false;
  private authListenerSubscription: Subscription;
/*  @ViewChild('autosize', {static: false}) autosize: CdkTextareaAutosize;
  @Output()
  keyPressed = new EventEmitter<boolean>();*/
  @Output() emojiButtonPressed = new EventEmitter<boolean>();
  constructor(private chatService: ChatService, private authService: AuthService) { }

  ngOnInit() {
    this.userAuthenticated = this.authService.isAuthenticated;
    this.authListenerSubscription = this.authService.getUserLoggedListener().subscribe( (loggedUser: User) => {
      this.currUser =  loggedUser;
    });
  }

  send() {
    if (this.message !== '') {
      const chatMessage: ChatMessage = {
        timeSent: this.getTimeStamp(),
        email: this.authService.currUser.email,
        username: this.authService.currUser.username,
        message: this.message
      };
      this.chatService.sendMessage(chatMessage);
      this.message = '';
    }
  }

  getTimeStamp() {
    const now = new Date();
    const date = now.getUTCDate() + '.' +
      (now.getUTCMonth() + 1) + '.' +
      now.getUTCFullYear();
    const time = now.getUTCHours() + ':' +
      now.getMinutes() + ':' +
      now.getUTCSeconds();

    return (date + ' ' + time);
  }

/*  updateSize() {
    this.keyPressed.emit(true);
  }*/

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
    this.emojiButtonPressed.emit(this.showEmojiPicker);
  }

  addEmoji(event) {
    const { message } = this;
    const text = `${message}${event.emoji.native}`;

    this.message = text;
    this.showEmojiPicker = false;
  }
}
