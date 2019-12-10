import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {GameSocket} from '../Sockets/GameSocket';
import {Router} from '@angular/router';
import {GameService} from '../services/game.service';
import {Question} from '../interfaces/question.model';
import {Subscription} from 'rxjs/internal/Subscription';
import {AuthService} from '../services/auth.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {
  private questionSub: Subscription;
  private playerAnsweredSub: Subscription;
  questions: Question[] = [];
  initialized: boolean;
  // @ViewChild('options', {static: false}) private options: MatSelectionList;
  // private selectionString = 'own';
  // private ownSelection: boolean;
  // private opponentFinished: boolean;
  // private waitingForPlayer: boolean;

  constructor(private gameService: GameService, private  router: Router, private socket: GameSocket,
              private  authService: AuthService) {}

   ngOnInit() {
     // Load actual values from local storage (must be done before loading Questions)
     this.gameService.restoreGameDate();

     // Load Question Catalog
     this.gameService.getQuestions();
     // this.questions = this.gameService.questions;
     // Load Question Catalog and wait for response before loading the Page

/*     if (parseInt(localStorage.getItem('seconds'), 10) > 0) {
       console.log('Game Component OnInit in IF for running game with seconds ' +  localStorage.getItem('seconds'));
       // Load actual values from local storage
       this.gameService.restoreGameDate();
       // this.questions = this.gameService.questions;
       if (this.gameService.qnProgress === this.gameService.questions.length) {
         this.router.navigate(['/result']);
       }
     } else {
       // Init game-variables
       this.gameService.seconds = 0;
       this.gameService.qnProgress = 0;
       this.gameService.score = 0;
       this.gameService.ownSelection = true;
       this.gameService.opponentFinished = false;
       this.gameService.waitingForPlayer = false;
     }*/

     // Get question Catalog at startup
     this.questionSub = this.gameService.getQuestionUpdatedListener().
     subscribe((questions: Question[]) => {
       if (questions.length !== 0 && this.gameService.qnProgress === questions.length) {
          this.router.navigate(['/result']);
       }
     });

     this.playerAnsweredSub = this.gameService.playerAnswered.subscribe((newAnswer: {email: String, own: String, guess: String}) => {
       console.log('OTHER PLAYER ANSWERED  mail' + newAnswer.email);
       // Update answer array for specific  question
       const  currAnswer = this.gameService.getAnswer(newAnswer.email);
       currAnswer.own = newAnswer.own;
       currAnswer.guess = newAnswer.guess;
        // Second time
       if (this.gameService.waitingForPlayer) {
         this.getNextQuestion();
       } else { // first time
         this.gameService.opponentFinished = true;
       }
     });

     // Start Quiz-Game Timer
     this.startTimer();
  }

  startTimer() {
    this.gameService.timer = setInterval(() => {
      this.gameService.seconds++;
    }, 1000);
  }

  registerAnswer(qID, choice) {
    const result = this.gameService.getAnswer(this.authService.userMail);
    console.log('IN RegisterAnswer with email ' + this.authService.userMail);
    console.log('RESULT ' +  result.email);
    if (this.gameService.ownSelection) {
      result.own = choice;
    } else {
      result.guess = choice;
      this.gameService.updateQuestionCatalog(this.gameService.questions[this.gameService.qnProgress]);
      this.waitOrProceed();
    }
    this.changeSelectionString();
  }

  private waitOrProceed() {
    if (this.gameService.opponentFinished) {
      this.getNextQuestion();
    } else {
      this.gameService.waitingForPlayer = true;
    }
  }

  private getNextQuestion() {
    this.gameService.calculateScore();
    this.gameService.qnProgress++;
    this.gameService.opponentFinished = this.gameService.waitingForPlayer = false;

    localStorage.setItem('questions', JSON.stringify(this.gameService.questions));
    if (this.gameService.qnProgress === this.gameService.questions.length) {
      clearInterval(this.gameService.timer);
      this.router.navigate(['/result']);
    }
  }

  private changeSelectionString() {
    this.gameService.ownSelection = this.gameService.ownSelection ? false : true;
    this.gameService.selectionString = this.gameService.ownSelection ? 'own' : 'opponents';
  }

  ngOnDestroy(): void {
    this.playerAnsweredSub.unsubscribe();
    this.questionSub.unsubscribe();
  }

}
