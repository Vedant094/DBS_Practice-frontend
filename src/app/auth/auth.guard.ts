import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    const token = this.auth.getToken();
    if (!token) return this.router.createUrlTree(['/login']);

    if (this.auth.isTokenExpired(token)) {
      this.auth.logout();
      return this.router.createUrlTree(['/login']);
    }

    return true;
  }
}
