import {Component, OnInit, OnChanges, OnDestroy, Input, Output, EventEmitter, AfterViewChecked} from '@angular/core';
import { ChatService } from '../services/chat.service';
import { ChatMessage} from '../interfaces/chatMessage.model';
import {Subscription} from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})

export class FeedComponent implements OnInit, OnDestroy {
  feed: ChatMessage[] = [];
  messages = [];
  private feedSub: Subscription;
  private runningChatSub: Subscription;
  @Input() showEmojiPicker: boolean;

  constructor(private chatService: ChatService) { }

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

  ngOnDestroy(): void {
    this.feedSub.unsubscribe();
    this.runningChatSub.unsubscribe();
  }

  addEmoji($event: any) {
    this.chatService.addEmoji($event);
  }
}
