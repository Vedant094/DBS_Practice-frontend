// src/app/auth/token.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';

import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  private refreshing = false;
  private refreshSubject = new BehaviorSubject<string | null>(null);

  constructor(private auth: AuthService, private router: Router) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const accessToken = this.auth.getToken();
    let modifiedReq = req;

    // Attach access token (even if close to expiry) so backend can validate
    if (accessToken) {
      modifiedReq = this.addToken(modifiedReq, accessToken);
    }

    return next.handle(modifiedReq).pipe(
      catchError((err: HttpErrorResponse) => {
        // only handle 401
        if (err.status === 401) {

          // If refresh already in progress, wait for it and then retry
          if (this.refreshing) {
            return this.refreshSubject.pipe(
              filter(token => token !== null),
              take(1),
              switchMap(token => {
                return next.handle(this.addToken(req, token!));
              })
            );
          }

          // Start refresh
          this.refreshing = true;
          this.refreshSubject.next(null);

          return this.auth.refreshToken().pipe(
            switchMap((resp: any) => {
              this.refreshing = false;

              // normalized response expected: { token: '...' } or { token: null, raw: ...}
              const newToken = resp && resp.token ? String(resp.token) : null;

              if (!newToken) {
                // cannot recover
                console.warn('TokenInterceptor: refresh did not return new token', resp);
                this.auth.logout();
                this.router.navigate(['/login']);
                return throwError(() => err);
              }

              // Save token (AuthService will also save but keep explicit)
              this.auth.saveNewAccessToken(newToken);

              // notify waiting requests
              this.refreshSubject.next(newToken);

              // retry original request
              return next.handle(this.addToken(req, newToken));
            }),
            catchError(refreshErr => {
              this.refreshing = false;
              console.warn('TokenInterceptor: refresh failed', refreshErr);
              this.auth.logout();
              this.router.navigate(['/login']);
              return throwError(() => refreshErr);
            })
          );
        }

        return throwError(() => err);
      })
    );
  }

  private addToken(req: HttpRequest<any>, token: string) {
    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
}

