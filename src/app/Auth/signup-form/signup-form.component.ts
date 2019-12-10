import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'app-signup-form',
  templateUrl: './signup-form.component.html',
  styleUrls: ['./signup-form.component.css']
})
export class SignupFormComponent {

  constructor(public authService: AuthService) { }

  signUp(form: NgForm) {
    if (form.invalid) {
      return;
    }
    console.log('USERNAME ' + form.value.username);
    this.authService.signUp(form.value.email, form.value.password, form.value.username);
  }
}
