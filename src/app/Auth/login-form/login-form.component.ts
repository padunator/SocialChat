import {Component, OnDestroy, OnInit} from '@angular/core';
import { AuthService} from '../../services/auth.service';
import {NgForm} from '@angular/forms';
import {Subscription} from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit, OnDestroy {
  wrongCredentials: boolean;
  private credSubject: Subscription;

  constructor(public authService: AuthService) { }

  ngOnInit() {
    this.credSubject = this.authService.getCredentialListener().subscribe(authorized => {
      this.wrongCredentials = !authorized;
    });
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
