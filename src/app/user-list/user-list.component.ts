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

/**
 * This code serves as logic, view & style related component and represents the list of registered users within the application.
 * Additionally it holds the single User components of the mentioned users
 */

export class UserListComponent implements OnInit, OnDestroy {
  private users: User[] = [];
  /***
   * Subscription which gets called as soon as a user logs in to load all registered users
   */
  private loggingSub: Subscription;
  /**
   * Subscription which gets called as soon as a user joins a game
   */
  private joiningSub: Subscription;
  /**
   * Subscription which gets called as soon as a user changes its status to update the (online/offline status)
   */
  private logEventSub: Subscription;
  /**
   * Subscription which executes as soon as a user disconnets during the game to remove him from the user list
   */
  private userDisconnectedSub: Subscription;
  /**
   * Constructor with injected object instances needed during game execution
   * @param chatService Chat Service which holds all chat related data
   * @param gameService Auth Service which holds all game related data and methods
   */
  constructor(private chatService: ChatService, private gameService: GameService) {}

  /**
   * OnInit Method which gets called every time the page is (re)loaded
   * Executes the logic of the defined subscription as soon as the corresponding events are emitted
   */
  ngOnInit(): void {
    this.loggingSub = this.chatService.getUserLoggedListener().subscribe((users: User[]) => {
      this.users = users;
    });

    this.joiningSub = this.gameService.getPlayersJoinedListener().subscribe((users: User[]) => {
      this.users = users;
    });

    this.logEventSub = this.chatService.newUser.subscribe(user => {
       if (this.users.length === 0) {
         this.chatService.getUsers();
       } else {
        this.users.find(eachUser => eachUser.email === user.email).status = user.status;
      }
    });

    this.userDisconnectedSub = this.gameService.userDisconnected.subscribe( (user: User) => {
      const pos = this.users.map(eachUser => eachUser.email).indexOf(user.email);
      this.users.splice(pos, 1);
    });

  }

  /**
   * Unsubscribe from all active subscriptions if page is closed
   */
  ngOnDestroy(): void {
    this.loggingSub.unsubscribe();
    this.logEventSub.unsubscribe();
    this.userDisconnectedSub.unsubscribe();
  }
}
