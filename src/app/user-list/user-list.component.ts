import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import { User} from '../interfaces/user.model';
import {AuthService} from '../services/auth.service';
import {Subscription} from 'rxjs/internal/Subscription';
import {ChatService} from '../services/chat.service';
import {GameService} from '../services/game.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, OnDestroy {
  users: User[];
  private loggingSub: Subscription;
  private joiningSub: Subscription;
  private logEventSub: Subscription;
  private gameUsers: Subscription;

  constructor(private chatService: ChatService, private gameService: GameService) {}

  ngOnInit(): void {
    this.loggingSub = this.chatService.getUserLoggedListener().subscribe((users: User[]) => {
      console.log('GET LIST OF ALL USERS');
      this.users = users;
    });

    this.joiningSub = this.gameService.getPlayersJoinedListener().subscribe((users: User[]) => {
      console.log('GET  USERS JOINED');
      this.users = users;
    });

    this.logEventSub = this.chatService.newUser.subscribe(user => {
      console.log('REASSIGNING STATUS for user ' + user.email);
        this.users.find(eachUser => eachUser.email === user.email).status = user.status;
        console.log(this.users.find(eachUser => eachUser.email === user.email));
    });

    this.gameUsers = this.gameService.gameUsers.subscribe( (users: User[]) => {
      console.log('REASSIGNING USERS !!');
      console.log(users);
      this.users = users;
    });

  }

  ngOnDestroy(): void {
    this.loggingSub.unsubscribe();
    this.logEventSub.unsubscribe();
    this.gameUsers.unsubscribe();
  }
}
