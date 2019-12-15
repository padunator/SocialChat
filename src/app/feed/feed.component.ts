import {Component, OnInit, OnChanges, OnDestroy, Input, Output, EventEmitter} from '@angular/core';
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
  @Input() showEmojiPicker: boolean;
  @Output() emojiSelected = new EventEmitter<any>();

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

  addEmoji($event: any) {
    this.emojiSelected.emit($event);
  }
}
