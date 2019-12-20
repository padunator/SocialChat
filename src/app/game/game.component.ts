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

  constructor(private gameService: GameService, private  router: Router, private socket: GameSocket,
              private  authService: AuthService) {}

   ngOnInit() {
     // Load actual values from local storage (must be done before loading Questions)
     console.log('IN ON INIT');
     this.gameService.restoreGameDate();


     if (this.gameService.seconds > 0) {
       console.log('Rejoining game');
       this.gameService.joinGame({
         user: this.gameService.opponent,
         from: this.authService.userMail,
         message: 'Rejoining room',
         title: this.gameService.roomTitle
       });
     }

     // Load Question Catalog
     this.gameService.getQuestions();
     // this.questions = this.gameService.questions;

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
       console.log('FIRST OR SECOND  ' + this.gameService.waitingForPlayer.toString());
       if (this.gameService.waitingForPlayer) {
         console.log('GETTING NEXT QUESTION');
         this.getNextQuestion();
       } else { // first time
         console.log('OPPENENT FINISHED!!');
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
