import {AfterContentChecked, AfterViewInit, Component, OnChanges, OnDestroy, OnInit, ViewChild} from '@angular/core';
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
  private fiftyJokerIsPressed: boolean;
  private newQnJokerIsPress: boolean;
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
       // Update answer array for specific  question (answers of the other player)
       const  currAnswer = this.gameService.getAnswer(newAnswer.email);
       currAnswer.own = newAnswer.own;
       currAnswer.guess = newAnswer.guess;
        // Second time - if 50/50 has not been selected - got to the next question
       if (this.gameService.waitingForPlayer && !this.fiftyJokerIsPressed) {
         this.getNextQuestion();
       } else { // first time
         this.gameService.opponentFinished = true;
         // This code is executed if Waiting For Player has been set due to Fifty-Fifty Joker selection
         if (this.fiftyJokerIsPressed) {
           this.gameService.waitingForPlayer = false;
           setTimeout(() => this.calculateExcludedOptions(), 400);
         }
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
    console.log('GET NEXT QN: GET TO NEXT QN!');
    this.gameService.qnProgress++;
    // Reset the crossed Options if selected
    if (this.fiftyJokerIsPressed) {
      this.updateView();
    }
    this.gameService.opponentFinished = this.gameService.waitingForPlayer = this.fiftyJokerIsPressed = false;

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
    this.gameService.seconds = 0;
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
      localStorage.removeItem('fiftyJoker');
      localStorage.removeItem('newQnJoker');
  }

  // Method for applying the 50 / 50 Joker
  fifty_fifty() {
    this.gameService.fiftyFiftyJokerSelected = true;
    this.fiftyJokerIsPressed = true;
    if (this.gameService.ownSelection) {
      setTimeout(() => this.fiftyJokerIsPressed = false, 2000);
    } else {
      // If other player has already answered - cross 2 wrong answers directly
      if (this.gameService.opponentFinished) {
        this.calculateExcludedOptions();
      } else { // Otherwise wait until the other player provides the right answer
        this.gameService.waitingForPlayer = true;
      }
    }
  }

  // Method for creating a custom answered Question
  createNewQn() {

  }

  // Helper Method for setting the Answer/Option Fields to editable in order to be able to create custom answers
  askOwnQuestion() {
    this.newQnJokerIsPress = true;
    const els = document.getElementsByClassName('answers');
    Array.prototype.forEach.call(els, function (el) {
      el.contentEditable = 'true';
    });

    // Display CREATE Button in the Page
    document.getElementById('create').classList.remove('display_none');
  }

  private calculateExcludedOptions() {
    console.log('IN CALCULATE EXCLUDED OPTIONS');
   const optionArray = [0, 1, 2, 3];
   const opponentAnswers = this.gameService.getAnswer(this.gameService.opponent);
   const corrAnswer = +opponentAnswers.own;
   optionArray.splice(corrAnswer, 1);
   const optionPos = Math.floor(Math.random() * 3);
   // The first option field to be crossed
   const cross1 = optionArray[optionPos];
   optionArray.splice(optionPos, 1);
   let cross2 = Math.floor(Math.random() * 2);
   // The second option field to be crossed
   cross2 = optionArray[cross2];
   // Go through the option fields and mark two wrong options
    console.log('CROSSING OPTIONS : ' + cross1 + ' AND ' + cross2);
   this.crossOptionsFields(cross1);
   this.crossOptionsFields(cross2);
  }

  private crossOptionsFields(crossOption: number) {
    // window.onload = function() {
      switch (crossOption) {
        case 0: {
          document.getElementById('option0').classList.add('crossed');
          break;
        }
        case 1: {
          document.getElementById('option1').classList.add('crossed');
          break;
        }
        case 2: {
          document.getElementById('option2').classList.add('crossed');
          break;
        }
        case 3: {
          document.getElementById('option3').classList.add('crossed');
          break;
        }
      }

      // document.getElementById('_5050').classList.add('selected');
      // document.getElementById('_5050').style.background = '#ff0000';
      // document.getElementById('_5050').style.opacity = '0.3';
    // };
  }

  private updateView() {
    console.log('UPDATE VIEW');
    document.getElementById('option1').classList.remove('crossed');
    document.getElementById('option2').classList.remove('crossed');
    document.getElementById('option3').classList.remove('crossed');
    document.getElementById('option0').classList.remove('crossed');
  }

}
