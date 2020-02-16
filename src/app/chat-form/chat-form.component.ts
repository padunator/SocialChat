import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { ChatService } from '../services/chat.service';
import {ChatMessage} from '../interfaces/chatMessage.model';
import {User} from '../interfaces/user.model';
import {AuthService} from '../services/auth.service';
import {Subscription} from 'rxjs/internal/Subscription';

/**
 * This code serves as logic, view & style related component which represents the Input Form for text input within the chat room
 */

@Component({
  selector: 'app-chat-form',
  templateUrl: './chat-form.component.html',
  styleUrls: ['./chat-form.component.css'],
})

export class ChatFormComponent implements OnInit {
  /**
   * Indicates if Emoji Dialog is currently shown or hidden
   */
  showEmojiPicker = false;
  /**
   * Holds the actual message introduced in the Chat fom
   */
  message: string;
  /**
   * Holds the currently connected user
   */
  currUser: User;
  /**
   * Indicates if user is currently authenticated
   */
  userAuthenticated = false;
  /**
   * Subscription which executes logic as soon user authenticates
   */
  private authListenerSubscription: Subscription;
  /**
   * Subscription which executes as soon as an emoji is being selected in the ChatFeed Component's Emoji Mart
   * Chat Feed -> Chat Service "next" -> Chat Form Subscription -> Chat Form addEmoji
   */
  private emojiSelectedSubscription: Subscription;

  /**
   * Event Emitter which gets called if EmojiButton has been pressed
   */
  @Output() emojiButtonPressed = new EventEmitter<boolean>();

  /**
   * Constructor with injected object instances needed during game execution
   * @param chatService Chat Service which holds all chat related data
   * @param authService Auth Service which holds all authentication & Connection related data
   */
  constructor(private chatService: ChatService, private authService: AuthService) { }

  /**
   * OnInit Method which gets called every time the page is (re)loaded
   * Executes the logic of the defined subscription as soon as the corresponding events are emitted
   */
  ngOnInit() {
    this.userAuthenticated = this.authService.isAuthenticated;
    this.authListenerSubscription = this.authService.getUserLoggedListener().subscribe( (loggedUser: User) => {
      this.currUser =  loggedUser;
    });
    // Chat Feed -> Chat Service "next" -> Chat Form Subscription -> Chat Form addEmoji
    this.emojiSelectedSubscription = this.chatService.getEmojiSelectedListener().subscribe( (event) => {
      this.addEmoji(event);
    });
  }

  /**
   * Prepare data for sending the actual chat message, and also extract URIs for Link Preview within the Chat feed
   */
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

  /**
   * Get the current date/time
   */
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

  /**
   * Toggles emoji dialog to show/hide the dialog
   */
  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
    this.emojiButtonPressed.emit(this.showEmojiPicker);
}

  /**
   * Adds the selected emoji into the current input dialog
   * @param event The current selection
   */
  addEmoji(event) {
    let message = '';
    if (this.message) {
      message = this.message;
    }
    const text = `${message}${event.emoji.native}`;

    this.message = text;
    this.toggleEmojiPicker();
  }
}
