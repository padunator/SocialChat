import {Component, OnDestroy, OnInit} from '@angular/core';
import { AuthService } from '../services/auth.service';
import {Subscription} from 'rxjs/internal/Subscription';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  userAuthenticated = false;
  private authListenerSubscription: Subscription;
  private userMail: string;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.userAuthenticated = this.authService.isAuthenticated;
    this.userMail = this.authService.userMail;

    this.authListenerSubscription = this.authService.getAuthStatusListener().subscribe( isLoggedIn => {
      this.userAuthenticated = isLoggedIn;
      this.userMail = this.authService.userMail;
    });
  }

  logout() {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    this.authListenerSubscription.unsubscribe();
  }
}
