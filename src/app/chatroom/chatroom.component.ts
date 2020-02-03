import {Component, OnInit, ViewChild, ElementRef, AfterViewChecked} from '@angular/core';
import {ChatService} from '../services/chat.service';


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
