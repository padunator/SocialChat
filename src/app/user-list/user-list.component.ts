import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import { User} from '../interfaces/user.model';
import {AuthService} from '../services/auth.service';
import {Subscription} from 'rxjs/internal/Subscription';
import {ChatService} from '../services/chat.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, OnDestroy {
  users: User[];
  private loggingSub: Subscription;


  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.chatService.getUsers();
    this.loggingSub = this.chatService.getUserLoggedListener().subscribe((users: User[]) => {
      this.users = users;
    });
  }

  ngOnDestroy(): void {
    this.loggingSub.unsubscribe();
  }
}
