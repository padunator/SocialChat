import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {Subject} from 'rxjs/internal/Subject';
import {HttpClient, HttpParams} from '@angular/common/http';
import {AuthData} from '../interfaces/auth.model';
import {User} from '../interfaces/user.model';
import {ChatSocket} from '../Sockets/ChatSocket';

/**
 * This Service serves as an endpoint interface for Backend Communication, for all Chatroom related operations
 * Any authentification related operation is being performed here
 */

@Injectable({providedIn: 'root'})
export class AuthService {
  private _isAuthenticated = false;
  private _userMail: string;
  private _currUser: User;
  private _token: string;
  private userLoggedListener = new Subject<User>();
  private authStatusListener = new Subject<boolean>();
  private credentialListener = new Subject<boolean>();
  private tokenTimer: NodeJS.Timer;

  constructor(private http: HttpClient,
              private router: Router,
              private socket: ChatSocket) {}

  // Getters
  get currUser(): User {
    return this._currUser;
  }

  get isAuthenticated(): boolean {
    return this._isAuthenticated;
  }

  get userMail(): string {
    return this._userMail;
  }

  get token(): string {
    return this._token;
  }

  // Get listeners for certain events
  getUserLoggedListener() {
    return this.userLoggedListener.asObservable();
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getCredentialListener() {
    return this.credentialListener.asObservable();
  }

  // Rest API for login
  login(email: string, password: string) {

      const authData: AuthData = ({
        email, password
      });
      this.http.post<{token: string, expiresIn: number}>('http://192.168.0.164:3000/api/user/login', authData)
      .subscribe(response => {
          this._token = response.token;
          if (this._token) {
            this.restoreAuthData(email);
            // After 1h logout automatically by using the Timeout function
            this.setAuthTimer(response.expiresIn * 1000);

            // Set expiration Date and save to local storage
            const now = new Date();
            const expirationDate = new Date(now.getTime() + response.expiresIn * 1000);
            this.saveAuthData(this._token, expirationDate, email);
            this.credentialListener.next(true); // Show wrong user / pw
            // Route to chat page
            this.router.navigate(['/chat']);
          }
        }, error => {
            this.credentialListener.next(false);
        });
    }

  // Rest API for logout
  logout() {
      this.clearLocalStorage();
      this.setUserStatus(false).then(() => {
        this._isAuthenticated = false;
        this._token = null;
        // this.userLoggedListener.next(null); // For chatform  - not really used init was currUser
        this.authStatusListener.next(false); // For Nav-Bar
        this._userMail = '';
        clearTimeout(this.tokenTimer);
        this.socket.emit('logout', this._currUser);
        this._currUser = null;
        this.router.navigate(['/login']);
      });
    }

  // Rest API for registration
  signUp(email: string, password: string, username: string) {
    const userData: User = ({
      email, password, username, status: false
    });
    this.http.post('http://192.168.0.164:3000/api/user/signup', userData)
      .subscribe(result => {
        console.log(result);
        this.router.navigate(['/login']);
      });
    }

  // Rest API for getting the current user
  getUser() {
      this.http.get<{ message: string, user: User }>('http://192.168.0.164:3000/api/user/getUser/' + this._userMail)
        .subscribe(mappedResult => {
          this._currUser = mappedResult.user;
        });
    }

  // Rest API for getting or setting the actual user status
   async setUserStatus(status: boolean): Promise<void> {
      const data = {
        status: status
      };
      this.http.put<{email: any}>('http://192.168.0.164:3000/api/user/changeStatus/' + this._userMail, data)
      .subscribe(response => {
        this.socket.emit('changeStatus', {
          email: response.email,
          status: status
        });
        return Promise.resolve();
       });
    }

  // If page is reloaded - auto authenticate the user if token is still valid
  autoAuthUser() {
      const authInfo =  this.getAuthData();
      if (!authInfo) {
        return;
      }
      const now = new Date();
      const expiresIn = authInfo.expirationDate.getTime() - now.getTime();
      if (expiresIn > 0 ) {
        this._token = authInfo.token;
        this.restoreAuthData(authInfo.email);
        this.setAuthTimer(expiresIn);
      }
    }

  // Persist authentication data in local storage
  private saveAuthData(token: string, expirationDate: Date, email: string) {
      localStorage.setItem('token', token);
      localStorage.setItem('expiration', expirationDate.toISOString());
      localStorage.setItem('email', email);
    }

  // Clear whole local storage at logout
  private clearLocalStorage() {
      localStorage.clear();
    }

  // Load authentication data from local storage
  private getAuthData() {
      const token = localStorage.getItem('token');
      const expiration = localStorage.getItem('expiration');
      const email = localStorage.getItem('email');
      if (!token || !expiration) {
        return;
      } else {
        return {
          token: token,
          expirationDate: new Date(expiration),
          email: email
        };
      }
    }

  // Set a timer for auto-logout after one hour
  private setAuthTimer(duration: number) {
      this.tokenTimer = setTimeout(() => {
        this.logout();
      }, duration);
    }

  // Auto restore authentication related information after page refresh
  private restoreAuthData(email: string) {
      // Add user related Information for User-List
      this._userMail = email;
      this.getUser();
      this._isAuthenticated = true;
      this.authStatusListener.next(true);
      this.setUserStatus(this._isAuthenticated);
      // Update the Socket Entry for persistent communication after page refresh
      this.socket.emit('login', email);
  }
}
