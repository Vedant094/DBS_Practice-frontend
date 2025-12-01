// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.apiBase;
  private tokenKey = 'jwt_token';
  private loggedIn = new BehaviorSubject<boolean>(
    this.getToken() ? !this.isTokenExpired(this.getToken()!) : false
  );
  isLoggedIn$ = this.loggedIn.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<any>(`${this.base}/auth/login`, { email, password })
      .pipe(map(res => {
        if (res && res.token) {
          localStorage.setItem(this.tokenKey, res.token);
          this.loggedIn.next(true);
          return res;
        } else {
          throw new Error('No token returned');
        }
      }));
  }

  logout() {
    // remove only the auth token, do not clear all localStorage
    localStorage.removeItem(this.tokenKey);
    sessionStorage.clear();
    this.loggedIn.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUserFromToken(): any | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  getRole() {
    return this.getUserFromToken()?.role || null;
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      return Date.now() > expiry;
    } catch {
      return true;
    }
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  refreshLoginState() {
    const token = this.getToken();
    this.loggedIn.next(token ? !this.isTokenExpired(token) : false);
  }

  checkEmail(email:string){
    return this.http.get<{exists:boolean}>(`${this.base}/auth/check-email?email=${email}`);
  }
}