import {AfterViewChecked, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AuthService} from './services/auth.service';
import {Subscription} from 'rxjs/internal/Subscription';
import {GameService} from './services/game.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Social CLEARN App';
  /**
   * New Game Subscription which gets called as soon one user invites the other
   */
  private newGameSub: Subscription;
  /**
   * Subscription which gets called as soon as the other user accepts the invitation
   */
  private joinGameSub: Subscription;
  /**
   * Subscription which gets called as soon as both users have joined the game room
   */
  private gameReadySub: Subscription;

  /**
   * Constructor with injected object instances needed during game execution
   * @param authService The authentication service which holds user & connection related information
   * @param gameService The game service which holds game related data
   * @param router The router which is used to switch between pages
   */
  constructor(private authService: AuthService, private gameService: GameService, private  router: Router) {}

  /**
   * Defines subscriptions which should listen on certain changes which then execute certain logic if event takes place
   */
  ngOnInit(): void {
    this.authService.autoAuthUser();

    this.newGameSub = this.gameService.gameRequest.subscribe((req) => {
      if (confirm(String(req.message))) {
        this.gameService.createNewRoom(req);
      } else {
        this.gameService.sendGameDecline();
        this.router.navigate(['/chat']);
      }
    });

    this.joinGameSub = this.gameService.joinRequest.subscribe((req) => {
      this.gameService.joinGame(req);
    });

    this.gameReadySub = this.gameService.gameReady.subscribe(ready => {
      if (ready) {
        console.log('ROUTING TO GAME READY!');
        this.gameService.getUsersInRoom();
        this.router.navigate(['/game']);
      }
    });

  }

  /**
   * Unsubscribes the actual subscriptions
   */
  ngOnDestroy(): void {
    this.newGameSub.unsubscribe();
    this.joinGameSub.unsubscribe();
    this.gameReadySub.unsubscribe();
  }
}
