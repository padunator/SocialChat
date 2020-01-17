import {Component, OnInit, Input, OnDestroy} from '@angular/core';
import { User } from '../interfaces/user.model';
import {AuthService} from '../services/auth.service';
import {GameService} from '../services/game.service';


@Component({
  selector: 'app-user-item',
  templateUrl: './user-item.component.html',
  styleUrls: ['./user-item.component.css']
})
export class UserItemComponent implements OnInit {

  @Input() user: User;

  constructor(private gameService: GameService, private authService: AuthService) { }

  ngOnInit() {

  }

  invite(user: User) {
    if ( user.status && (user.email !==  this.authService.userMail) && this.gameService.seconds === 0)  {
      this.gameService.sendGameRequest(this.makeRandom(), user, this.authService.userMail);
    }
  }

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
