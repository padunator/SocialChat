import {AfterContentChecked, AfterViewInit, ChangeDetectorRef, Component, OnChanges, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {GameSocket} from '../Sockets/GameSocket';
import {Router} from '@angular/router';
import {GameService} from '../services/game.service';
import {Question} from '../interfaces/question.model';
import {Subscription} from 'rxjs/internal/Subscription';
import {AuthService} from '../services/auth.service';
import { slideInAnimation } from '../Animations/animations';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import {MatSnackBar} from '@angular/material';
import {JokerSelectedComponent} from '../joker-selected/joker-selected.component';


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  animations: [
    slideInAnimation
    // animation triggers go here
  ]
})
export class GameComponent implements OnInit, OnDestroy {
  private questionSub: Subscription;
  private playerAnsweredSub: Subscription;
  private jokerSelectedSub: Subscription;
  private fiftyJokerIsPressed: boolean;
  private newQnJokerIsPressed: boolean;
  questions: Question[] = [];
  initialized: boolean;

  constructor(private gameService: GameService, private  router: Router, private socket: GameSocket,
              private  authService: AuthService, private ref: ChangeDetectorRef, private _snackBar: MatSnackBar) {}

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
       // this.questions = this.gameService.questions;
       if (questions.length !== 0 && this.gameService.qnProgress === questions.length) {
          this.router.navigate(['/result']);
       }
     });

     // Subscription which gets called when the player receives the answers of the opponent
     this.playerAnsweredSub = this.gameService.playerAnswered.subscribe((newAnswer: {email: String, own: String, guess: String}) => {
       // Update answer array for specific  question (answers of the other player)
       const  currAnswer = this.gameService.getAnswer(newAnswer.email);
       currAnswer.own = newAnswer.own;
       currAnswer.guess = newAnswer.guess;
        // Second time - if 50/50 has not been selected - got to the next question
       if (this.gameService.waitingForPlayer && !this.fiftyJokerIsPressed) {
         console.log('NEW ANSWER SUB: GETTING NEXT QUESTION');
         this.getNextQuestion();
       } else { // first time
         console.log('NEW ANSWER SUB: SETTING OPPONENT FINISHED');
         this.gameService.opponentFinished = true;
         // This code is executed if Waiting For Player has been set due to Fifty-Fifty Joker selection
         if (this.fiftyJokerIsPressed) {
           this.gameService.waitingForPlayer = false;
           setTimeout(() => this.calculateExcludedOptions(), 400);
         }
       }
     });

     // Subscription which gets called when the player receives  the edited question of the opponent which has been created by selecting
     // the corresponding JOKER
     this.jokerSelectedSub = this.gameService.jokerSelected.subscribe(
       (question: {roomID: String, qnProgress: number, question: Question}) => {
        console.log('QUESTION UPDATE NOW ON OTHER SIDE!');
        console.log(question.question);
        this.gameService.questions[this.gameService.qnProgress] = question.question;
        this.resetQuestionData();
     });


     // Start Quiz-Game Timer
     this.startTimer();
  }

  openSnackBar(message) {
    this._snackBar.open(message, 'dismiss' , {
      duration: 3000
    });
/*    this._snackBar.openFromComponent(JokerSelectedComponent, {
      duration: 3000,
    });*/
  }

  private resetQuestionData() {
    this.gameService.waitingForPlayer = true;
    this.gameService.opponentFinished = false;
    this.gameService.waitingForPlayer = false;
    this.gameService.ownSelection = true;
    this.gameService.selectionString = 'own';
    this.gameService.waitingForPlayer = false;
    this.openSnackBar('Custom-Joker Used: The current Question has been replaced !');
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
      this.gameService.updateQuestionCatalog();
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
    console.log('GET NEXT QN : DETECT CHANGES');
    // this.ref.detectChanges();
    // Reset the crossed Options if selected
    if (this.fiftyJokerIsPressed) {
      this.updateView();
    }
    console.log('GET NEXT QN: REINIT VARIABLES');
    this.gameService.opponentFinished = this.gameService.waitingForPlayer = this.fiftyJokerIsPressed = false;
    localStorage.setItem('questions', JSON.stringify(this.gameService.questions));
    if (this.gameService.qnProgress === this.gameService.questions.length) {
      console.log('GO TO RESULT PAGE!!');
      clearInterval(this.gameService.timer);
      this.gameService.insertHighScore();
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
    this.jokerSelectedSub.unsubscribe();
  }

  backToChat() {
    this.socket.emit('leaveGame');
    this.gameService.clearLocalGameStorage();
    this.gameService.seconds = 0;
    this.router.navigate(['/chat']);
  }



  // Method for applying the 50 / 50 Joker
  fifty_fifty() {
    this.fiftyJokerIsPressed = true;
    if (this.gameService.ownSelection) {
      setTimeout(() => this.fiftyJokerIsPressed = false, 2000);
    } else {
      this.gameService.fiftyFiftyJokerSelected = true;
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
    // Modify the questions
    this.gameService.questions[this.gameService.qnProgress].question = document.getElementById('question').innerText;

    // Modify the Answers
    let i = 0;
    for (const qn of this.gameService.questions[this.gameService.qnProgress].options) {
      const el = 'text' + i;
      qn.text =  document.getElementById(el).innerText;
      i = i + 1;
    }

    this.gameService.executeQuestionUpdate();
    this.resetQuestionData();
    this.gameService.newQnSelected = true;
    this.newQnJokerIsPressed = false;
    document.getElementById('create').classList.add('display_none');
    this.ref.detectChanges();
    // this.ref.markForCheck();

  }

/*  const oldQn = this.gameService.questions[this.gameService.qnProgress];

  const newQn: Question = ({
    question: document.getElementById('question').innerText,
    options: oldQn.options,
    room: this.gameService.roomTitle,
    answers: oldQn.answers,
    createdAt: oldQn.createdAt
  });
  this.gameService.questions[this.gameService.qnProgress] = newQn;
  console.log(newQn);*/
  // Helper Method for setting the Answer/Option Fields to editable in order to be able to create custom answers
  askOwnQuestion() {
    this.newQnJokerIsPressed = true;
/*    this.newQnJokerIsPressed = true;
    const els = document.getElementsByClassName('answers');
    Array.prototype.forEach.call(els, function (el) {
     // el.contentEditable = 'true';
    });
    document.getElementById('question').contentEditable = 'true';
    // Display CREATE Button in the Page*/
    document.getElementById('create').classList.remove('display_none');
  }

  private calculateExcludedOptions() {
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
  }

  private updateView() {
    document.getElementById('option1').classList.remove('crossed');
    document.getElementById('option2').classList.remove('crossed');
    document.getElementById('option3').classList.remove('crossed');
    document.getElementById('option0').classList.remove('crossed');
  }
}
