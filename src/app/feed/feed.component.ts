import {Component, OnInit, OnChanges, OnDestroy} from '@angular/core';
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
  private feedSub: Subscription;
  private runningChatSub: Subscription;
  constructor(private chatService: ChatService) { }

  ngOnInit() {
    this.chatService.getMessages();
    this.feedSub = this.chatService.getChatUpdatedListener().
    subscribe((feed: ChatMessage[]) => {
      this.feed = feed;
    });

    this.runningChatSub = this.chatService.newMessage.subscribe((newMsg) => {
      this.feed.push(newMsg);
    });
  }

  ngOnDestroy(): void {
    this.feedSub.unsubscribe();
    this.runningChatSub.unsubscribe();
  }
}
