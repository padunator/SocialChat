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
import {HighScore} from '../interfaces/high_score';
import {
  setInterval,
  clearInterval
} from 'timers';

/**
 * This Service serves as an endpoint interface for Backend Communication, as well as Game Related Variables!
 * Taking into account that Game & Result Components both need the game related variables, I have decided to hold them in this
 * service, instead of saving them in any component separately which would cause an overhead but would actually be state of the art
*/

@Injectable({
  providedIn: 'root'
})
export class GameService {
  /**
   * Saves the actual Room
   */
  private game: Room;
  /**
   * Saves the loaded question array locally which has been loaded from the DB
   */
  private _questions: Question[] = [];
  /**
   * Saves the player you are playing against
   */
  private _opponent: string;
  /**
   * Saves the passed time in the game
   */
  private _seconds = 0;
  /**
   * Saves the actual question progress in the game
   */
  private _qnProgress: number;
  /**
   * Saves the actual score of the current player
   */
  private _score: number;
  /**
   * Saves the score of the opponent
   */
  private _opScore = 0;
  /**
   * Saves the room title of the game the user is in
   */
  private _roomTitle: string;
  /**
   * Counts the correct answered questions
   */
  private _correctAnswerCount: number;
  /**
   * String which switches between "own" and "opponents" to indicate for which one you should answer the question
   */
  private _selectionString = 'own';
  /**
   * Boolean variable also indicates if you are currently selecting your own answer or the guess of the opponents answer
   */
  private _ownSelection: boolean;
  /**
   * Indicates if opponent already answered the current question
   */
  private _opponentFinished: boolean;
  /**
   * Indicates if you are already waiting for the other player to answer the question
   */
  private _waitingForPlayer: boolean;
  /**
   * Indicates if the 50/50 has already been selected
   */
  private _fiftyJokerIsPressed: boolean;
  /**
   * Indicates if the New Qn Joker is currently executed
   */
  private _newQnJokerIsPressed: boolean;
  /**
   * Indicates if the 50/50 Joker is currently executed
   */
  private _fiftyFiftyJokerSelected: boolean;
  /**
   * Indicates if the New Qn Joker has already been selected
   */
  private _newQnSelected: boolean;
  /**
   * Flag for showing customized Message Dialogs while user is waiting during the game
   */
  private _jokerUsed: boolean;
  /**
   * Timer which incremets the second variable during the game
   */
  timer;
  /**
   * Subscription which gets called as soon as both players joined the room
   */
  private playersJoined = new Subject<User[]>();
  /**
   * Subscription which indicates if questions have been updated
   */
  questionsUpdated = new Subject<Question[]>();
  /**
   * Subscription which gets called as soon as the high scores have been loaded from the DB
   */
  highScoreLoaded = new Subject<HighScore[]>();


  // Socket listeners
  /**
   * Listens for Game Invitations
   */
  gameRequest = this.socket.fromEvent<any>('ConfirmGame');
  /**
   * Is called as soon as other player accepts invitation to join the game
   */
  joinRequest = this.socket.fromEvent<any>('JoinGame');
  /**
   * Is called as soon as both players joined the game
   */
  gameReady = this.gameSocket.fromEvent<any>('GameReady');
  /**
   * Indicates if user disconnects from current game
   */
  userDisconnected = this.gameSocket.fromEvent<User>('removeUser');
  /**
   * Listens for new created questions via the "Custom Qn Joker"
   */
  jokerSelected = this.gameSocket.fromEvent<any>('joker-selected');
  /**
   * Inform the opponent about the Joker selection to prevent simultaneous usage
   */
  jokerInformer = this.gameSocket.fromEvent<any>('notifyOpponent');
  /**
   * Listens for new answers from the opponent
   */
  playerAnswered = this.gameSocket.fromEvent<any>('PlayerAnswered');
  /**
   * Array of current users in game
   */
  private users: User[] = [];
  /**
   * Array of highscores
   */
  private _scoreTable: HighScore[] = [];

  /**
   * Constructor with injected object instances needed during game execution
   * @param http Http Client for Rest API calls
   * @param router Responsible for routing to the result page after game is finished
   * @param authService Authentication Service which holds the user data of actual connection
   * @param socket Responsible for socket connection of "Chat" namespace
   * @param gameSocket Responsible for socket connection of "Game" namespace
   */
  constructor(private http: HttpClient, private  router: Router, private authService: AuthService,
              private socket: ChatSocket, private gameSocket: GameSocket) {
  }


  getQuestionUpdatedListener() {
    return this.questionsUpdated.asObservable();
  }

  getHighScoreLoadedListener() {
    return this.highScoreLoaded.asObservable();
  }

  getPlayersJoinedListener() {
    return this.playersJoined.asObservable();
  }

  /**
   * Rest API call for creating a new room and executing game initialization logic
   * @param The actual request object which holds the title of the newly created room
   */
  createNewRoom(req: any) {
    const room: Room = ({title: req.title});
    this.http.post<{ roomId: string, message: string }>('http://localhost:3000/api/game/createRoom', {
      room: room,
      email: this.authService.userMail
    }).subscribe(response => {
      this.joinGame(req);
    });
  }

  // Rest API call for getting specific room (not used at the moment)
  getGameRoom(title: string) {
    this.game = ({title: title});
    this.http.get<{ room: Room }>('http://localhost:3000/api/game/createRoom' + title)
      .subscribe(room => {
        // this.game.title = room.title;
        this.router.navigate(['/game']);
      });
  }

  /**
   * Joining the room via socket connection
   * @param The actual request object which holds
   * roomTitle
   * Mail of current user
   * Mail of opponent
   */
  joinGame(req: any) {
    this.roomTitle = req.title;
    this.gameSocket.emit('join', {
      title: req.title,
      userId: this.authService.userMail,
      round: this._qnProgress,
      duration: this.displayTimeElapsed(),
      score: this._score
    }, (response) => {
      if (response) { // Player which gets Confirm Dialog creates game and gets into this part (First Player)
        this.socket.emit('joinGameRequest', req);
        this.opponent = req.from;
      } else { // Player which sent the game request joins second and gets into this part (Second Player)
        this.opponent = req.to;
      }
    });
  }

  /**
   * Create room via socket connection (not used the moment)
   * @param The title of the room to create
   */
  createRoom(title: string) {
    this.gameSocket.emit('createRoom', title);
  }

  /**
   * Start game timer during quiz
   */
  startTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timer = setInterval(() => {
      this.seconds++;
    }, 1000);
  }

  /**
   * Stop game timer while user is waiting for opponent or if game is finished
   */
  stopTimer() {
    clearInterval(this.timer);
  }

  /**
   * Display the elapsed time in the game page
   */
  displayTimeElapsed() {
    return Math.floor(this._seconds / 3600) + ':' + Math.floor(this._seconds / 60) + ':' + Math.floor(this._seconds % 60);
  }

  /**
   * Send game request to the selected user via socket connection
   * @param title Room Title
   * @param user Current User mail
   * @param userMail Other users mail
   */
  sendGameRequest(title: string, user: User, userMail: String) {
    this.socket.emit('sendGameRequest', {
      to: user.email,
      from: userMail,
      message: 'Would you like to join a Quiz Game with ' + userMail,
      title: title
    });
  }

  // Rest API call for getting a specific room
  getRoom() {
    this.http.get<{ room: any }>('http://localhost:3000/api/getRoom')
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

  /**
   * Calculate actual score by comparing the answers of both players
   * Right answer = 10 Points - Right answer & same answer = 15 points
   */
  calculateScore() {
    const ownAnswer = this.getAnswer(this.authService.userMail);
    const oppAnswer = this.getAnswer(this._opponent);
    const rightAnswer = ownAnswer.guess === oppAnswer.own;
    const sameAnswer = ownAnswer.own === oppAnswer.own;
    const opRightAnswer = oppAnswer.guess === ownAnswer.own;
    if (rightAnswer && sameAnswer) {
      this.score += 15;
      this.correctAnswerCount++;
    } else if (rightAnswer) {
      this.score += 10;
      this.correctAnswerCount++;
    }

    if (opRightAnswer && sameAnswer) {
      this.opScore += 15;
    } else if (opRightAnswer) {
      this.opScore += 10;
    }
  }

  /**
   * Get the answer for a specific question and user from the local loaded question array
   * @param email Current users mail
   * @param qnProgress Questions progress for actual game
   */
  getAnswer(email, qnProgress = this._qnProgress) {
    return this.questions[qnProgress].answers.find(answer => answer.email === email);
  }

  /**
   * Rest API call for getting all questions of the current game room the user is in
   */
  getQuestions() {
    this.http.get<{ message: string, questions: Question[] }>('http://localhost:3000/api/game/getQuestions/' + this._roomTitle)
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
      this._questions = mappedQuestions;
      this.questionsUpdated.next([...this._questions]);
    });
  }

  /**
   * When user responded to one question - the corresponding Question is being updated with his selections
   */
  updateQuestionCatalog() {
    this.gameSocket.emit('new-game-response', {
      question: this._questions[this._qnProgress],
      roomID: this._roomTitle,
      email: this.authService.userMail,
      round: (this._qnProgress + 1),
      duration: this.displayTimeElapsed(),
      score: this._score
    });
  }

  /**
   * When user selected the new Qn Joker this questions is being saved in the question pool for future games
   */
  executeQuestionUpdate() {
    this.gameSocket.emit('update-question', {
      roomID: this._roomTitle,
      qnProgress: this._qnProgress,
      question: this._questions[this._qnProgress]
    });
  }

  /**
   * Helper method for calculating score
   * @param qnNo Number of actual question
   * @param optNo Actual selection
   */
  isCorrect(qnNo: number, optNo: number) {
    const oppAnswer = this.getAnswer(this._opponent, qnNo);
    return (parseInt(oppAnswer.own.toString(), 10) === optNo);
  }

  /**
   * Helper method for result page (show correct / wrong answers)
   * @param qnNo Number of actual question
   * @param optNo Actual selection
   */
  mySelection(qnNo: number, optNo: number) {
    const ownAnswer = this.getAnswer(this.authService.userMail, qnNo);
    return (parseInt(ownAnswer.guess.toString(), 10) === optNo);
  }

  /**
   * Inform opponent if game is declined
   */
  sendGameDecline() {
    this.gameSocket.emit('DeclineGame');
  }

  /**
   * Get current users in current room
   */
  getUsersInRoom() {
    this.http.get<{ user: User[] }>('http://localhost:3000/api/user/getUsersInRoom/' + this._roomTitle)
      .pipe(map(postData => {
        return postData.user.map(user => {
          return {
            _id: user._id,
            email: user.email,
            password: user.password,
            username: user.username,
            status: user.status
          };
        });
      }))
      .subscribe(mappedResult => {
        this.users = mappedResult;
        this.playersJoined.next([...this.users]);
      });
  }

  updateUserList() {
    this.gameSocket.emit('updateUserList', {
      email: this.authService.userMail,
      room: this._roomTitle
    });
  }

  /**
   * Rest API call for posting new high score into the related collection
   */
  insertHighScore() {
    this.http.post<{message: string, scores: HighScore []}>('http://localhost:3000/api/game/createHighScore', {
      roomID: this._roomTitle,
      user: this.authService.userMail,
      round: this._qnProgress,
      duration: this.displayTimeElapsed(),
      score: this._score
    })
      .subscribe(response => {
        this._scoreTable = response.scores;
        this.highScoreLoaded.next([...this._scoreTable]);
      });
  }

  /**
   * Rest API call for getting all the high scores
   */
  getHighScores() {
    return this.http.get<{scores: HighScore []}>('http://localhost:3000/api/game/getHighScores');
  }

  /**
   * Inform opponent over the active socket connection that joker has been selected
   */
  informOpponent() {
    this.gameSocket.emit('informOpponent', {
      roomID: this._roomTitle,
      selected: true
    });
  }

  /**
   * Leave the current game
   */
  leaveGame() {
    this.gameSocket.emit('leaveGame', this._roomTitle);
  }

  /**
   * Restore temp data from local storage if page has been reloaded to have a persistent connection
   */
  restoreGameDate() {
    this._seconds = parseInt(localStorage.getItem('seconds'), 10) || 0;
    this._qnProgress = parseInt(localStorage.getItem('qnProgress'), 10) || 0;
    this._score = parseInt(localStorage.getItem('score'), 10) || 0;
    this._opScore = parseInt(localStorage.getItem('opScore'), 10) || 0;
    this._correctAnswerCount = parseInt(localStorage.getItem('counter'), 10) || 0;
    this._waitingForPlayer = JSON.parse(localStorage.getItem('waiting')) || false;
    // this._jokerUsed = JSON.parse(localStorage.getItem('jokerUsed')) || false;
    this._newQnJokerIsPressed = JSON.parse(localStorage.getItem('newQnJokerPressed')) || false;
    this._fiftyJokerIsPressed = JSON.parse(localStorage.getItem('fiftyJokerPressed')) || false;
    this._opponentFinished = JSON.parse(localStorage.getItem('opponentFinished')) || false;
    this._ownSelection = JSON.parse(localStorage.getItem('selection')) === null ||
      JSON.parse(localStorage.getItem('selection'));
    this._questions = JSON.parse(localStorage.getItem('questions'));
    this._selectionString = localStorage.getItem('selectionString');
    this._roomTitle = localStorage.getItem('room');
    this._opponent = localStorage.getItem('opponent');
    this._fiftyFiftyJokerSelected = JSON.parse(localStorage.getItem('fiftyJoker')) || false;
    this._newQnSelected = JSON.parse(localStorage.getItem('newQnJoker')) || false;
  }

  /**
   * Clear temp data from local storage if player leaves game
   */
  clearLocalGameStorage() {
    this.stopTimer();
    localStorage.removeItem('room');
    localStorage.removeItem('opponent');
    localStorage.removeItem('questions');
    localStorage.removeItem('qnProgress');
    localStorage.removeItem('selection');
    localStorage.removeItem('selectionString');
    localStorage.removeItem('opponentFinished');
    localStorage.removeItem('waiting');
    localStorage.removeItem('score');
    localStorage.removeItem('opScore');
    localStorage.removeItem('counter');
    localStorage.removeItem('fiftyJoker');
    localStorage.removeItem('newQnJoker');
    localStorage.removeItem('newQnJokerPressed');
    localStorage.removeItem('fiftyJokerPressed');
    localStorage.removeItem('jokerUsed');
    localStorage.removeItem('seconds');
  }


  set opScore(value: number) {
    this._opScore = value;
    localStorage.setItem('opScore', this._opScore.toString());
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
    this._roomTitle = value;
    localStorage.setItem('room', this._roomTitle);
  }

  set selectionString(value: string) {
    this._selectionString = value;
    localStorage.setItem('selectionString', value);
  }

  set ownSelection(value: boolean) {
    this._ownSelection = value;
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

  set fiftyFiftyJokerSelected(value: boolean) {
    this._fiftyFiftyJokerSelected = value;
    localStorage.setItem('fiftyJoker', JSON.stringify(this.fiftyFiftyJokerSelected));
  }

  set newQnSelected(value: boolean) {
    this._newQnSelected = value;
    localStorage.setItem('newQnJoker', JSON.stringify(this.newQnSelected));
  }

  set fiftyJokerIsPressed(value: boolean) {
    this._fiftyJokerIsPressed = value;
    localStorage.setItem('fiftyJokerPressed', JSON.stringify(value));
  }

  set newQnJokerIsPressed(value: boolean) {
    this._newQnJokerIsPressed = value;
    localStorage.setItem('newQnJokerPressed', JSON.stringify(value));
  }

  set jokerUsed(value: boolean) {
    this._jokerUsed = value;
    localStorage.setItem('jokerUsed', JSON.stringify(value));
  }

  // Getters
  get fiftyJokerIsPressed(): boolean {
    return this._fiftyJokerIsPressed;
  }

  get newQnJokerIsPressed(): boolean {
    return this._newQnJokerIsPressed;
  }

  get opScore(): number {
    return this._opScore;
  }

  get fiftyFiftyJokerSelected(): boolean {
    return this._fiftyFiftyJokerSelected;
  }


  get newQnSelected(): boolean {
    return this._newQnSelected;
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

  get jokerUsed(): boolean {
    return this._jokerUsed;
  }

  get scoreTable(): HighScore[] {
    return this._scoreTable;
  }
}
