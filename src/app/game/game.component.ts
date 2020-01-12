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

     // If Game page gets reloaded while in game - rejoin to room
     if (this.gameService.seconds > 0) {
       this.gameService.joinGame({
         to: this.gameService.opponent,
         from: this.authService.userMail,
         message: 'Rejoining room',
         title: this.gameService.roomTitle
       });
      // this.gameService.updateUserList();
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
      localStorage.setItem('seconds', this.gameService.seconds.toString());
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
    this.gameService.ownSelection = !this.gameService.ownSelection ;
    this.gameService.selectionString = this.gameService.ownSelection ? 'own' : 'opponents';
  }

  ngOnDestroy(): void {
    this.playerAnsweredSub.unsubscribe();
    this.questionSub.unsubscribe();
  }

  backToChat() {
    this.socket.emit('leaveGame');
    this.clearLocalGameStorage();
    this.router.navigate(['/chat']);
  }

  private clearLocalGameStorage() {
      clearInterval(this.gameService.timer);
      localStorage.removeItem('room');
      localStorage.removeItem('opponent');
      localStorage.removeItem('seconds');
      localStorage.removeItem('questions');
      localStorage.removeItem('qnProgress');
      localStorage.removeItem('selection');
      localStorage.removeItem('selectionString');
      localStorage.removeItem('opponentFinished');
      localStorage.removeItem('waiting');
      localStorage.removeItem('seconds');
      localStorage.removeItem('score');
      localStorage.removeItem('counter');
  }

  fitty() {

  }

  createNewQn() {

  }

  askOwnQuestion() {
    console.log('BEFORE FOR EACH LOOP');
    // document.getElementById('answers').contentEditable = 'true';
    const els = document.getElementsByClassName('answers');
    console.log('AFTER ASSIGNMENT!');
    Array.prototype.forEach.call(els, function (el) {
      console.log('SETTING ELEMENT PROPERTY');
      el.contentEditable = 'true';
    });

    document.getElementById('create').classList.remove('display_none');
  }
}
