import { Injectable } from '@angular/core';
import {GameSocket} from '../Sockets/GameSocket';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {Room} from '../interfaces/room.model';
import {User} from '../interfaces/user.model';
import {ChatSocket} from '../Sockets/ChatSocket';
import {map} from 'rxjs/operators';
import {AuthService} from './auth.service';
import {Question} from '../interfaces/question.model';
import {Subject} from 'rxjs/internal/Subject';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private game: Room;
  private _questions: Question[] = [];
  private _opponent: string;
  private _seconds: number;
  private _qnProgress: number;
  private _score: number;
  private _roomTitle: string;
  private _correctAnswerCount: number;
  private _selectionString = 'own';
  private _ownSelection: boolean;
  private _opponentFinished: boolean;
  private _waitingForPlayer: boolean;
  questionsLoaded: Promise<boolean>;
  questionsUpdated  = new Subject<Question[]>();
  private playersJoined = new Subject<User[]>();
  timer;

  // Socket listeners
  gameRequest = this.socket.fromEvent<any>('ConfirmGame');
  joinRequest = this.socket.fromEvent<any>('JoinGame');
  gameReady = this.gameSocket.fromEvent<any>('GameReady');
  gameUsers = this.gameSocket.fromEvent<User[]>('updateUsersList');
  playerAnswered = this.gameSocket.fromEvent<any>('PlayerAnswered');

  // Event emitter erstellen - alle Clients & Componenten können an diesen
  // Alle lokalen - spielrelevanten variablen werden durch events an die entsprechenden Komponenten gesendet und entsprechend
  // aktualisiert. In den Templates werden ausschließlich die lokalen variablen angesprochen.

  constructor(private http: HttpClient, private  router: Router, private authService: AuthService,
              private socket: ChatSocket,  private gameSocket: GameSocket) { }


  createNewRoom(req: any) {
    const room: Room = ({title: req.title});
    this.http.post<{roomId: string, message: string}>('http://localhost:3000/api/game/createRoom', {
      room: room,
      email: this.authService.userMail
    }).subscribe(response => {
          this.joinGame(req);
      });
  }

  getGameRoom(title: string) {
    this.game = ({title: title});
    this.http.get<{room: Room}>('http://localhost:3000/api/game/createRoom' + title)
      .subscribe(room => {
        // this.game.title = room.title;
        this.router.navigate(['/game']);
      });
  }

  joinGame(req: any) {
    this.roomTitle = req.title;
    this.gameSocket.emit('join', {
      title: req.title,
      userId: this.authService.userMail
    },  (response) => {
      if (response) { // Player which gets Confirm Dialog creates game and gets into this part (First Player)
        this.socket.emit('joinGameRequest', req);
        this.opponent = req.from;
      } else { // Player which sent the game request joins second and gets into this part (Second Player)
        this.opponent = req.to;
      }
    });
  }

  createRoom(title: string) {
    this.gameSocket.emit('createRoom', title);
  }

  displayTimeElapsed() {
    return Math.floor(this._seconds / 3600) + ':' + Math.floor(this._seconds / 60) + ':' + Math.floor(this._seconds % 60);
  }

  sendGameRequest(title: string, user: User, userMail: String) {
    this.socket.emit('sendGameRequest', {
      to: user.email,
      from: userMail,
      message: 'Would you like to join a Quiz Game with ' + userMail,
      title: title
    });
  }

  getRoom() {
    this.http.get<{room: any}>('http://localhost:3000/api/getRoom')
      .pipe(map(postData => {
        return postData.room.map(room => {
          return {
            _id: room._id,
            title: room.title,
            connections: room.connections,
            isOpen: room.isOpen,
            owner: room.owner,
            rounds: room.rounds,
            currentRound: room.currentRound,
            noOfPlayers: room.noOfPlayers,
            createdAt: room.createdAt,
            score: room._score
          };
        });
      }))
      .subscribe(mappedRoom => {
        this.game = mappedRoom;
      });
  }


  calculateScore() {
    const ownAnswer = this.getAnswer(this.authService.userMail);
    const oppAnswer = this.getAnswer(this._opponent);
    const rightAnswer = ownAnswer.guess === oppAnswer.own;
    const sameAnswer = ownAnswer.own === oppAnswer.own;
    if (rightAnswer && sameAnswer) {
      this.score += 15;
      this.correctAnswerCount++;
    } else if (rightAnswer) {
      this.score += 10;
      this.correctAnswerCount++;
    }
  }

  getAnswer(email, qnProgress = this._qnProgress) {
    return this.questions[qnProgress].answers.
    find(answer => answer.email === email);
  }

  getParticipantName() {
    return this.authService.currUser.username;
  }

  getQuestions() {
      this.http.get<{message: string, questions: Question[]}>('http://localhost:3000/api/game/getQuestions/' + this._roomTitle)
        .pipe(map(data => {
          return data.questions.map(result => {
            return {
              _id: result._id,
              question: result.question,
              room: result.room,
              answers: result.answers,
              options: result.options,
              createdAt: result.createdAt
            };
          });
        })).subscribe(mappedQuestions => {
          console.log('Questions loaded now!');
          console.log(mappedQuestions);
        this._questions = mappedQuestions;
        // this.initialized = true;
        this.questionsUpdated.next([...this._questions]);
        // this.questionsLoaded = Promise.resolve(true);
      });
   // });
  }

  getQuestionUpdatedListener() {
    return this.questionsUpdated.asObservable();
  }

  updateQuestionCatalog(question: Question) {
    console.log('ROOM TITLE  ' + this._roomTitle);
    this.gameSocket.emit('new-game-response', {
      question: question,
      roomID: this._roomTitle,
      email: this.authService.userMail
    });
    // localStorage.setItem('questions', JSON.stringify(this._questions));
  }

  isCorrect(qnNo: number, optNo: number) {
    const oppAnswer = this.getAnswer(this._opponent, qnNo);
    return (parseInt(oppAnswer.own.toString(), 10) === optNo);
  }

  mySelection(qnNo: number, optNo: number) {
    const ownAnswer = this.getAnswer(this.authService.userMail, qnNo);
    return (parseInt(ownAnswer.guess.toString(), 10) === optNo);
  }

  restoreGameDate() {
    this._seconds = parseInt(localStorage.getItem('seconds'), 10) || 0;
    this._qnProgress = parseInt(localStorage.getItem('qnProgress'), 10) || 0;
    this._score = parseInt(localStorage.getItem('score'), 10) || 0;
    this._correctAnswerCount = parseInt(localStorage.getItem('counter'), 10) || 0;
    this._waitingForPlayer = JSON.parse(localStorage.getItem('waiting')) || false;
    this._opponentFinished = JSON.parse(localStorage.getItem('opponentFinished')) || false;
    // console.log('BEFORE OWN SELECTION ' + this._ownSelection.toString());
    this._ownSelection = JSON.parse(localStorage.getItem('selection')) ===  null ||
      JSON.parse(localStorage.getItem('selection'));
    console.log('OWN SELECTION ' + this._ownSelection.toString());
    this._questions = JSON.parse(localStorage.getItem('questions'));
    this._selectionString = localStorage.getItem('selectionString');
    this._roomTitle = localStorage.getItem('room');
    this._opponent = localStorage.getItem('opponent');
  }

  set questions(value: Question[]) {
    this._questions = value;
    localStorage.setItem('questions', JSON.stringify(this._questions));
  }

  set seconds(value: number) {
    this._seconds = value;
    localStorage.setItem('seconds', this._seconds.toString());
  }

  set qnProgress(value: number) {
    this._qnProgress = value;
    localStorage.setItem('qnProgress', this._qnProgress.toString());
  }

  set score(value: number) {
    this._score = value;
    localStorage.setItem('score', this._score.toString());
  }

  set roomTitle(value: string) {
    console.log('SET ROOM TITLE TO ' + value);
    this._roomTitle = value;
    localStorage.setItem('room', this._roomTitle);
  }

  set selectionString(value: string) {
    this._selectionString = value;
    localStorage.setItem('selectionString', value);
  }

  set ownSelection(value: boolean) {
    this._ownSelection = value;
    console.log('SETTER SELECTION = ' + this._ownSelection.toString());
    localStorage.setItem('selection', JSON.stringify(this._ownSelection));
  }

  set opponentFinished(value: boolean) {
    this._opponentFinished = value;
    localStorage.setItem('opponentFinished', JSON.stringify(this.opponentFinished));
  }


  set correctAnswerCount(value: number) {
    this._correctAnswerCount = value;
    localStorage.setItem('counter', this._correctAnswerCount.toString());
  }

  set waitingForPlayer(value: boolean) {
    this._waitingForPlayer = value;
    localStorage.setItem('waiting', JSON.stringify(this.waitingForPlayer));
  }

  set opponent(value: string) {
    this._opponent = value;
    localStorage.setItem('opponent', this._opponent);
  }

  get questions(): Question[] {
    return this._questions;
  }

  get seconds(): number {
    return this._seconds;
  }

  get qnProgress(): number {
    return this._qnProgress;
  }


  get opponent(): string {
    return this._opponent;
  }

  get score(): number {
    return this._score;
  }

  get roomTitle(): string {
    return this._roomTitle;
  }

  get selectionString(): string {
    return this._selectionString;
  }

  get ownSelection(): boolean {
    return this._ownSelection;
  }

  get opponentFinished(): boolean {
    return this._opponentFinished;
  }

  get waitingForPlayer(): boolean {
    return this._waitingForPlayer;
  }


  get correctAnswerCount(): number {
    return this._correctAnswerCount;
  }

  sendGameDecline() {
    this.gameSocket.emit('DeclineGame');
  }

  getPlayersJoinedListener() {
    return this.playersJoined.asObservable();
  }

  getUsersInRoom() {
    console.log('GET USERS - CLIENT SIDE');
    this.http.get<{ user: User[] }>('http://localhost:3000/api/user/getUsersInRoom/' + this._roomTitle)
      .pipe(map(postData => {
        return postData.user.map(user => {
          return {
            email: user.email,
            password: user.password,
            username: user.username,
            status: user.status
          };
        });
      }))
      .subscribe(mappedResult => {
        // this.users = mappedResult;
        console.log('USER RECEIVED');
        console.log(mappedResult);
        this.playersJoined.next([...mappedResult]);
      });
  }
}
