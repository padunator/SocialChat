import {Component, OnInit, ViewChild, ElementRef, AfterViewChecked} from '@angular/core';
import {ChatService} from '../services/chat.service';

/**
 * This code serves as logic, view & style related component of the chat-room which is actually a pool of other components,
 * such as UserList, Feed and ChatForm Component
 */

@Component({
  selector: 'app-chatroom',
  templateUrl: './chatroom.component.html',
  styleUrls: ['./chatroom.component.css']
})

export class ChatroomComponent implements OnInit, AfterViewChecked {
  @ViewChild('scroller', {static: false}) private feedContainer: ElementRef;
  private showEmojiPicker: boolean;

  constructor(private chatService: ChatService) { }

  ngOnInit() {
     this.chatService.getUsers();
  }

  // Always scroll to bottom when message arrives
  scrollToBottom(): void {
    this.feedContainer.nativeElement.scrollTop
    = this.feedContainer.nativeElement.scrollHeight;
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  openEmojiMart($event: boolean) {
    this.showEmojiPicker = $event;
  }
}
