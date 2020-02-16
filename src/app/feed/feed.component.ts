import {Component, OnInit, OnChanges, OnDestroy, Input, Output, EventEmitter, AfterViewChecked, ViewChild, ElementRef} from '@angular/core';
import { ChatService } from '../services/chat.service';
import { ChatMessage} from '../interfaces/chatMessage.model';
import {Subscription} from 'rxjs/internal/Subscription';

/**
 * This code serves as logic, view & style related component and represents the actual Chat feed within the application
 */

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})

export class FeedComponent implements OnInit, OnDestroy {
  /**
   * The locally loaded/saved chat messages / feed
   */
  feed: ChatMessage[] = [];
  messages = [];
  /**
   * Subscription which gets called as soon as the chat feed was loaded from the DB
   */
  private feedSub: Subscription;
  /**
   * Subscription which gets called as soon any user sent a new question - updates the existing array
   */
  private runningChatSub: Subscription;
  /**
   * Indicates if the Emoji Mart/Dialog should be shown
   */
  @Input() showEmojiPicker: boolean;

  /**
   * Constructor with injected object instances needed during game execution
   * @param chatService Chat Service which holds all chat related data needed
   */
  constructor(private chatService: ChatService) { }

  /**
   * OnInit method which gets called always when this page/component is loaded
   * Holds all subscriptions and the related logic to be executed as soon the events take place
   */
  ngOnInit() {
    this.chatService.getMessages();

    this.feedSub = this.chatService.getChatUpdatedListener().
    subscribe((feed: ChatMessage[]) => {
      this.feed = feed;
    });

    this.runningChatSub = this.chatService.newMessage.subscribe((msg) => {
        this.feed.push({...msg});
    });
  }

  /**
   * Unsubscribe from all active subscription as soon as the page is closeds
   */
  ngOnDestroy(): void {
    this.feedSub.unsubscribe();
    this.runningChatSub.unsubscribe();
  }

  /**
   * Method which gets called as soon as the emoji is being selected in the view
   * @param $event The actual emoji
   */
  addEmoji($event: any) {
    this.chatService.addEmoji($event);
  }
}
