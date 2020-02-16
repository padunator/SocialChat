import { Component, OnInit } from '@angular/core';
import {GameService} from '../services/game.service';

/**
 * This code serves as logic, view & style related component of the game-room which is actually a pool of other components,
 * such as UserList and Game Component
 */

@Component({
  selector: 'app-gameroom',
  templateUrl: './gameroom.component.html',
  styleUrls: ['./gameroom.component.css']
})
export class GameroomComponent implements OnInit {

  constructor(private gameService: GameService) { }

  /**
   * OnInit method which gets called always when this page/component is loaded
   * At the moment the local storage data is being (re)-loaded as soon as this component gets called to make sure
   * we have a persistent connection / game even is page is reloaded during the game
   */
  ngOnInit() {
    // Load actual values from local storage (must be done before loading Questions)
    this.gameService.restoreGameDate();

  }

}
