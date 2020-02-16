import {Component, OnDestroy, OnInit} from '@angular/core';
import { AuthService} from '../../services/auth.service';
import {NgForm} from '@angular/forms';
import {Subscription} from 'rxjs/internal/Subscription';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})

/**
 * This code serves as logic, view & style related component for the initial login
 */
export class LoginFormComponent implements OnInit, OnDestroy {
  /**
   * Indicate if wrong credentials have been introduced
   */
  wrongCredentials: boolean;
  /**
   * Subscription which gets called as soon as server indicates wrong credentials and set the "wrongCredentials" Flag
   */
  private credSubject: Subscription;
  /**
   * Constructor with injected object instances needed during game execution
   * @param authService Auth Service which holds user & connection related data needed
   * @param router Router for switching to the next (Chat) page
   */
  constructor(public authService: AuthService, private router: Router) { }

  /**
   * OnInit method which gets called always when this page/component is loaded
   * Holds all subscriptions and the related logic to be executed as soon the events take place
   */
  ngOnInit() {
    this.credSubject = this.authService.getCredentialListener().subscribe(authorized => {
      this.wrongCredentials = !authorized;
    });

    if (this.authService.token) {
      this.router.navigate(['/chat']);
    }
  }

  /**
   * Verify if login information format is valid and calls the login API through the Service
   * @param form
   */
  login(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.authService.login(form.value.email, form.value.password);
  }

  /**
   * Unsubscribe from active subscriptions as soon as page gets closed
   */
  ngOnDestroy(): void {
    this.credSubject.unsubscribe();
  }
}
