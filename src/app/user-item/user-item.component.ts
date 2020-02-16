import {Component, OnInit, Input, OnDestroy} from '@angular/core';
import { User } from '../interfaces/user.model';
import {AuthService} from '../services/auth.service';
import {GameService} from '../services/game.service';

@Component({
  selector: 'app-user-item',
  templateUrl: './user-item.component.html',
  styleUrls: ['./user-item.component.css']
})

/**
 * This code serves as logic, view & style related component and represents the actual user object within the application
 */

export class UserItemComponent {

  /**
   * User variable which holds the actual user object of the current connection
   */
  @Input() user: User;

  /**
   * Constructor with injected object instances needed during game execution
   * @param gameService Game Service which holds all game related data & methods
   * @param authService Authentication Service which holds all user & connection related data & methods
   */
  constructor(private gameService: GameService, private authService: AuthService) { }

  /**
   * Method for emiting an invitation for the selected user
   * @param user The selected user which should get the invitation
   */
  invite(user: User) {
    if ( user.status && (user.email !==  this.authService.userMail) && this.gameService.seconds === 0)  {
      this.gameService.sendGameRequest(this.makeRandom(), user, this.authService.userMail);
    }
  }

  /**
   * Method which creates a random room ID for the game which has to be instantiated
   */
  makeRandom() {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    const lengthOfCode = 10;
    let text = '';
    for (let i = 0; i < lengthOfCode; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
}
