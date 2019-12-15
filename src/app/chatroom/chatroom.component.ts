import {Component, OnInit, ViewChild, ElementRef, AfterViewChecked, NgZone, Input} from '@angular/core';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {take} from 'rxjs/operators';
import {ChatFormComponent} from '../chat-form/chat-form.component';

@Component({
  selector: 'app-chatroom',
  templateUrl: './chatroom.component.html',
  styleUrls: ['./chatroom.component.css']
})
export class ChatroomComponent implements OnInit, AfterViewChecked {
  @ViewChild('scroller', {static: false}) private feedContainer: ElementRef;
    @ViewChild('chatForm', {static: false}) private chatFormWrapper: HTMLElement;
    @ViewChild('userList', {static: false}) private userList;
    @ViewChild('autosize', {static: false}) private messageContainer: CdkTextareaAutosize;
    private showEmojiPicker: boolean;
  @ViewChild(ChatFormComponent, {static: false})
  private chatFormComponent: ChatFormComponent;

  constructor() { }

  ngOnInit() {
  }


  scrollToBottom(): void {
    this.feedContainer.nativeElement.scrollTop
    = this.feedContainer.nativeElement.scrollHeight;
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  openEmojiMart($event: boolean) {
    console.log('IN CHATROOM - OPENEMOJIMART WITH EVENT VALUE ' + $event.toString());
    this.showEmojiPicker = $event;
  }

  addEmoji($event: any) {
    
  }
}
