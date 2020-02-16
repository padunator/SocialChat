import {Component, OnDestroy, OnInit} from '@angular/core';
import { AuthService} from '../../services/auth.service';
import {NgForm} from '@angular/forms';
import {Subscription} from 'rxjs/internal/Subscription';
import {Router} from '@angular/router';

/**
 * This code serves as logic, view & style related component for the initial login
 */

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit, OnDestroy {
  wrongCredentials: boolean;
  private credSubject: Subscription;

  constructor(public authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.credSubject = this.authService.getCredentialListener().subscribe(authorized => {
      this.wrongCredentials = !authorized;
    });

    if (this.authService.token) {
      this.router.navigate(['/chat']);
    }
  }

  login(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.authService.login(form.value.email, form.value.password);
  }

  ngOnDestroy(): void {
    this.credSubject.unsubscribe();
  }
}
