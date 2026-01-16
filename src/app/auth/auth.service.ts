// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private base = environment.apiBase;
  private tokenKey = 'jwt_token';
  private refreshKey = 'refresh_token'; // optional local copy for debug

  private loggedIn = new BehaviorSubject<boolean>(
    this.getToken() ? !this.isTokenExpired(this.getToken()!) : false
  );
  isLoggedIn$ = this.loggedIn.asObservable();

  // small flag to help avoid concurrent refresh attempts from different parts
  public isRefreshing = false;

  constructor(private http: HttpClient) {}

  /* LOGIN */
  login(email: string, password: string) {
    return this.http.post<any>(
      `${this.base}/auth/login`,
      { email, password },
      { withCredentials: true }
    ).pipe(
      map(res => {
        const token = res?.token;
        const refreshToken = res?.refreshToken;

        if (!token) throw new Error("No access token returned");

        localStorage.setItem(this.tokenKey, token);
        if (refreshToken) localStorage.setItem(this.refreshKey, refreshToken);

        this.loggedIn.next(true);
        return res;
      })
    );
  }

  /**
   * REFRESH ACCESS TOKEN
   * - Always returns Observable<{ token: string }>
   * - Saves new access token in localStorage when available
   */
  refreshToken() {
    return this.http.post<any>(
      `${this.base}/auth/refresh`,
      {},
      { withCredentials: true }
    ).pipe(
      map(res => {
        // Normalize: backend should return { token: '...' }.
        // If backend returns something else, we try to extract token and still return { token }
        const tokenFromRes: string | null = (res && res.token) ? res.token : (typeof res === 'string' ? res : null);

        if (!tokenFromRes) {
          // No token — propagate structure so callers can react
          console.warn('AuthService.refreshToken: no token found in response', res);
          return { token: null as any, raw: res };
        }

        // Persist token
        this.saveNewAccessToken(tokenFromRes);

        return { token: tokenFromRes };
      })
    );
  }

  /* LOGOUT */
  logout() {
    this.http.post(`${this.base}/auth/logout`, {}, { withCredentials: true }).subscribe({
      next: () => {},
      error: () => {}
    });
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshKey);
    sessionStorage.clear();
    this.loggedIn.next(false);
  }

  /* HELPERS */

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshTokenFromStorage(): string | null {
    return localStorage.getItem(this.refreshKey);
  }

  saveNewAccessToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
    this.loggedIn.next(true);
    console.log('AuthService: saved new access token');
  }

  getUserFromToken(): any | null {
    const token = this.getToken();
    if (!token) return null;
    try { return JSON.parse(atob(token.split('.')[1])); }
    catch { return null; }
  }

  isTokenExpired(token: string): boolean {
    try {
      const exp = JSON.parse(atob(token.split('.')[1])).exp * 1000;
      return Date.now() > exp;
    } catch {
      return true;
    }
  }

  getAccessTokenRemainingSeconds(): number {
    const token = this.getToken();
    if (!token) return 0;
    try {
      const exp = JSON.parse(atob(token.split('.')[1])).exp * 1000;
      const now = Date.now();
      return Math.max(0, Math.floor((exp - now) / 1000));
    } catch {
      return 0;
    }
  }

  getRefreshTokenRemainingSeconds(): number {
    const token = this.getRefreshTokenFromStorage();
    if (!token) return 0;
    try {
      const exp = JSON.parse(atob(token.split('.')[1])).exp * 1000;
      const now = Date.now();
      return Math.max(0, Math.floor((exp - now) / 1000));
    } catch {
      return 0;
    }
  }

  getRole() {
    return this.getUserFromToken()?.role || null;
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return token ? !this.isTokenExpired(token) : false;
  }

  refreshLoginState() {
    this.loggedIn.next(this.isLoggedIn());
  }

  checkEmail(email: string) {
    return this.http.get<{ exists: boolean }>(`${this.base}/auth/check-email?email=${email}`);
  }
}
