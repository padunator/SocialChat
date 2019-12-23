import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import { ChatService } from '../services/chat.service';
import {ChatMessage} from '../interfaces/chatMessage.model';
import {User} from '../interfaces/user.model';
import {AuthService} from '../services/auth.service';
import {Subscription} from 'rxjs/internal/Subscription';

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
  private emojiSelectedSubscription: Subscription;

  @Output() emojiButtonPressed = new EventEmitter<boolean>();
  constructor(private chatService: ChatService, private authService: AuthService) { }

  ngOnInit() {
    this.userAuthenticated = this.authService.isAuthenticated;
    this.authListenerSubscription = this.authService.getUserLoggedListener().subscribe( (loggedUser: User) => {
      this.currUser =  loggedUser;
    });

    this.emojiSelectedSubscription = this.chatService.getEmojiSelectedListener().subscribe( (event) => {
      this.addEmoji(event);
    });
  }

  send() {

    if (this.message.length !== 1) {
      let { message } = this;
      const urlMatches = this.message.match(/\b(http|https)?:\/\/\S+/gi) || [];
      function insertTextAtIndices(text, obj) {
        return text.replace(/./g, function(character, index) {
          return obj[index] ? obj[index] + character : character;
        });
      }

      urlMatches.forEach(link => {
        const startIndex = message.indexOf(link);
        const endIndex = startIndex + link.length;
        message = insertTextAtIndices(message, {
          [startIndex]: `<a href="${link}" target="_blank" rel="noopener noreferrer" class="embedded-link">`,
          [endIndex]: '</a>',
        });
      });

      const chatMessage: ChatMessage = {
        timeSent: this.getTimeStamp(),
        email: this.authService.currUser.email,
        username: this.authService.currUser.username, // or CurrUser from Subscription
        message: this.message,
        url_matches: urlMatches
      };

      this.chatService.sendMessage(chatMessage);
    }
    this.message = '';
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

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
    this.emojiButtonPressed.emit(this.showEmojiPicker);
}

  addEmoji(event) {
    let message = '';
    if (this.message) {
      message = this.message;
    }
    const text = `${message}${event.emoji.native}`;

    console.log('MESSAGE ' + message);
    console.log('TEXT ' + text  );

    this.message = text;
    this.toggleEmojiPicker();
  }
}
