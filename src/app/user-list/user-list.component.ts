import {Component, OnDestroy, OnInit} from '@angular/core';
import { User} from '../interfaces/user.model';
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
  private userReconnectedSub: Subscription;
  private userDisconnectedSub: Subscription;

  constructor(private chatService: ChatService, private gameService: GameService) {}

  ngOnInit(): void {
    this.loggingSub = this.chatService.getUserLoggedListener().subscribe((users: User[]) => {
      this.users = users;
    });

    this.joiningSub = this.gameService.getPlayersJoinedListener().subscribe((users: User[]) => {
      console.log('GET USERS IN GAME ROOM');
      this.users = users;
    });

    this.logEventSub = this.chatService.newUser.subscribe(user => {
        this.users.find(eachUser => eachUser.email === user.email).status = user.status;
    });

/*    this.userReconnectedSub = this.gameService.userReconnected.subscribe( (user: User) => {
      console.log('REASSIGN USER TO GAMEROOM');
      console.log(this.users);
      console.log(user);
      this.users.push(user);
    });*/

    this.userDisconnectedSub = this.gameService.userDisconnected.subscribe( (user: User) => {
      console.log(this.users);
      const pos = this.users.map(eachUser => eachUser.email).indexOf(user.email);
      this.users.splice(pos, 1);
    });

  }

  ngOnDestroy(): void {
    this.loggingSub.unsubscribe();
    this.logEventSub.unsubscribe();
    // this.userReconnectedSub.unsubscribe();
    this.userDisconnectedSub.unsubscribe();
  }
}
