import {AfterViewChecked, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AuthService} from './services/auth.service';
import {Subscription} from 'rxjs/internal/Subscription';
import {GameService} from './services/game.service';
import {Router} from '@angular/router';
declare const microlink: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy, AfterViewChecked {
  title = 'Social CLEARN App';
  private newGameSub: Subscription;
  private joinGameSub: Subscription;
  private gameReadySub: Subscription;

  constructor(private authService: AuthService, private gameService: GameService, private  router: Router) {}

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
        this.gameService.getUsersInRoom();
        this.router.navigate(['/game']);
      }
    });

  }

  ngOnDestroy(): void {
    this.newGameSub.unsubscribe();
    this.joinGameSub.unsubscribe();
    this.gameReadySub.unsubscribe();
  }

  ngAfterViewChecked(): void {
    microlink('.link-preview');
    // @ts-ignore
    // eslint-disable-next-line no-undef
    // microlink(this.card.nativeElement, this.options);
  }
}
