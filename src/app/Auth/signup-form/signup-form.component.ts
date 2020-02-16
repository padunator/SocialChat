import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'app-signup-form',
  templateUrl: './signup-form.component.html',
  styleUrls: ['./signup-form.component.css']
})

/**
 * This code serves as logic, view & style related component for registration related operations (Signup Form)
 */
export class SignupFormComponent {

  /**
   * Constructor with injected object instances needed during game execution
   * @param authService Auth Service which holds user & connection related data needed
   */
  constructor(public authService: AuthService) { }

  /**
   * Verify if input dialog information is valid and call SignUp Method of the Authentication Service
   * @param form
   */
  signUp(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.authService.signUp(form.value.email, form.value.password, form.value.username);
  }
}
