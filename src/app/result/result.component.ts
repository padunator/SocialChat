import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {GameService} from '../services/game.service';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
})
export class ResultComponent implements OnInit {




  constructor(private gameService: GameService, private router: Router) { }

  ngOnInit() {
    this.gameService.restoreGameDate();
    if (parseInt(localStorage.getItem('qnProgress'), 10) !== this.gameService.questions.length) {
      this.router.navigate(['/game']);
    }
  }


  OnSubmit() {
    // Implmement Promise here for getting score here
    // this.gameService.submitScore().subscribe(() => {
    //   this.restart();
    // });
  }

  restart() {
    localStorage.setItem('qnProgress', '0');
    localStorage.setItem('questions', '');
    localStorage.setItem('seconds', '0');
    localStorage.setItem('selection', JSON.stringify(true));
    this.router.navigate(['/game']);
  }

  backToChat() {
    this.gameService.clearLocalGameStorage();
    this.gameService.seconds = 0;
    this.router.navigate(['/chat']);
  }
}
