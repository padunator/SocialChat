import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs/internal/Observable';
import {Injectable} from '@angular/core';
import {AuthService} from './auth.service';

// Like a middleware on Server side - just for outgoing requests
// Allows us to intercept the request - modify it - and go on with next(handle)
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.token;
    // Manipulate the HTTP Request by adding the Authorization Header with the actual token to the request
    const newRequest = req.clone({
      headers: req.headers.set('Authorization', 'Bearer ' +  token)
    });
    // Acts like a middleware and keeps on by using the next statement
    // Allow the request to continue its journey with the newly, manipulated HEADER
    return next.handle(newRequest);
  }
}
