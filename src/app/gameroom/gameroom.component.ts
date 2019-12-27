import { Component, OnInit } from '@angular/core';
import {GameService} from '../services/game.service';

@Component({
  selector: 'app-gameroom',
  templateUrl: './gameroom.component.html',
  styleUrls: ['./gameroom.component.css']
})
export class GameroomComponent implements OnInit {

  constructor(private gameService: GameService) { }

  ngOnInit() {
    // Load actual values from local storage (must be done before loading Questions)
    console.log('ON INIT GAMEROOM');
    this.gameService.restoreGameDate();

  }

}
