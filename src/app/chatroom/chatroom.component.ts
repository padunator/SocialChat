import {Component, OnInit, ViewChild, ElementRef, AfterViewChecked, NgZone, Input} from '@angular/core';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {take} from 'rxjs/operators';

@Component({
  selector: 'app-chatroom',
  templateUrl: './chatroom.component.html',
  styleUrls: ['./chatroom.component.css']
})
export class ChatroomComponent implements OnInit, AfterViewChecked {
  @ViewChild('scroller', {static: false}) private feedContainer: ElementRef;
  @ViewChild('autosize', {static: false}) private messageContainer: CdkTextareaAutosize;

  constructor(private _ngZone: NgZone) { }

  ngOnInit() {
  }

  scrollToBottom(): void {
    this.feedContainer.nativeElement.scrollTop
    = this.feedContainer.nativeElement.scrollHeight;
  }

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1))
      .subscribe(() => this.messageContainer.resizeToFitContent(true));
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }
}
