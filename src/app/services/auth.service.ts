import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {Subject} from 'rxjs/internal/Subject';
import {HttpClient, HttpParams} from '@angular/common/http';
import {AuthData} from '../interfaces/auth.model';
import {User} from '../interfaces/user.model';
import {ChatSocket} from '../Sockets/ChatSocket';

@Injectable({providedIn: 'root'})
export class AuthService {
  private _isAuthenticated = false;
  private _userMail: string;
  private _currUser: User;
  private _token: string;
  private userLoggedListener = new Subject<User>();
  private authStatusListener = new Subject<boolean>();
  private tokenTimer: NodeJS.Timer;

  constructor(private http: HttpClient, private router: Router, private socket: ChatSocket) {}


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

  getUserLoggedListener() {
      return this.userLoggedListener.asObservable();
    }

    getAuthStatusListener() {
      return this.authStatusListener.asObservable();
    }

    login(email: string, password: string) {

      const authData: AuthData = ({
        email, password
      });
      this.http.post<{token: string, expiresIn: number}>('http://localhost:3000/api/user/login', authData)
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
            // this.socket.emit('login', email);

            // Route to chat page
            this.router.navigate(['/chat']);
          }
        });
    }

    logout() {
      this.socket.emit('logout', this._currUser);
      this._token = null;
      this.userLoggedListener.next(null);
      this._currUser = null;
      this._isAuthenticated = false;
      this.setUserStatus(this._isAuthenticated);
      this.userLoggedListener.next(this._currUser);
      this.authStatusListener.next(false);
      this._userMail = '';
      this.clearLocalStorage();
      clearTimeout(this.tokenTimer);
      this.router.navigate(['/login']);
    }


    signUp(email: string, password: string, username: string) {
    const userData: User = ({
      email, password, username, status: false
    });
    this.http.post('http://localhost:3000/api/user/signup', userData)
      .subscribe(result => {
        console.log(result);
        this.router.navigate(['/login']);
      });
    }


  // getUserLoggedListener() {
  //   return this.userLoggedListener.asObservable();
  // }

    getUser() {
      // let params = new HttpParams();
      // params = params.append('fuck', this._userMail);
      this.http.get<{ message: string, user: User }>('http://localhost:3000/api/user/getUser/' + this._userMail)
        .subscribe(mappedResult => {
          this._currUser = mappedResult.user;
          console.log('CURR USER NAME  ' + this._currUser.username);
        });
    }

    setUserStatus(status: boolean): void {

      const data = {
        status: status
      };
      this.http.put('http://localhost:3000/api/user/changeStatus/' + this._userMail, data)
      .subscribe(response => {
        console.log(response);
       });
    }


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

    private saveAuthData(token: string, expirationDate: Date, email: string) {
      localStorage.setItem('token', token);
      localStorage.setItem('expiration', expirationDate.toISOString());
      localStorage.setItem('email', email);
    }

    private clearLocalStorage() {
      localStorage.removeItem('token');
      localStorage.removeItem('expiration');
      localStorage.removeItem('email');
      localStorage.removeItem('room');
      localStorage.removeItem('opponent');
      localStorage.removeItem('seconds');
      localStorage.removeItem('questions');
      localStorage.removeItem('qnProgress');
      localStorage.removeItem('selection');
      localStorage.removeItem('opponentFinished');
      localStorage.removeItem('waiting');
      localStorage.removeItem('seconds');
      localStorage.removeItem('score');
      localStorage.removeItem('counter');
    }

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

    private setAuthTimer(duration: number) {
      this.tokenTimer = setTimeout(() => {
        this.logout();
      }, duration);
    }

  private restoreAuthData(email: string) {
      // Add user related Information for User-List
      this._userMail = email;
      this.getUser();
      this.userLoggedListener.next(this._currUser);
      this._isAuthenticated = true;
      this.authStatusListener.next(true);
      this.setUserStatus(this._isAuthenticated);
      this.socket.emit('login', email);
  }
}
