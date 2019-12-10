import { Component, OnInit } from '@angular/core';
import { AuthService} from '../../services/auth.service';
import { Router } from '@angular/router';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent {

  constructor(public authService: AuthService) { }

  login(form: NgForm) {
    console.log('login() called from login-form component');
    if (form.invalid) {
      return;
    }
    console.log('Before calling the Auth Service!');
    this.authService.login(form.value.email, form.value.password);
  }
}
