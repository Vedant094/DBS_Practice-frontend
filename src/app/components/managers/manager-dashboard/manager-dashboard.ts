// src/app/components/managers/manager-dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-manager-dashboard',
  templateUrl: './manager-dashboard.html',
  styleUrls: ['./manager-dashboard.css'],
  standalone: false
})
export class ManagerDashboardComponent implements OnInit, OnDestroy {

  manager: any = null;
  loading = true;
  error = '';
  base = environment.apiBase;

  showTokenModal = false;

  accessToken: string | null = null;
  refreshToken: string | null = null;

  accessRemaining = 0;
  refreshRemaining = 0;

  // For token border progress
  accessInitial = 0;              // initial lifetime (seconds) when token was fresh
  accessUsagePercent = 0;         // 0–100: how much of token lifetime has been used

  darkModeEnabled = false;        // currently unused but kept if you later add theme

  oldAccessToken: string | null = null;
  newAccessToken: string | null = null;
  tokenChanged = false;

  timerInterval: any;
  refreshing = false; // guard to prevent concurrent refreshes
  subs: Subscription[] = [];

  // Simple analytics object (you can wire to backend later)
  analytics = {
    totalUsers: 0,
    pendingRequests: 0,
    completedRequests: 0
  };

  constructor(
    private auth: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    const payload = this.auth.getUserFromToken();

    if (!payload || payload.role !== 'ROLE_MANAGER') {
      this.error = 'Access denied.';
      this.loading = false;
      return;
    }

    const email = payload.sub;

    this.http.get<any>(`${this.base}/managers/by-email/${email}`).subscribe({
      next: res => {
        this.manager = res;
        this.loading = false;

        // If backend ever adds these, they’ll be picked up, else stay 0
        this.analytics.totalUsers = res?.totalUsers ?? 0;
        this.analytics.pendingRequests = res?.pendingRequests ?? 0;
        this.analytics.completedRequests = res?.completedRequests ?? 0;
      },
      error: () => {
        this.error = 'Could not load manager details';
        this.loading = false;
      }
    });

    // pre-load token info
    this.updateTokenDisplay();
  }

  ngOnDestroy() {
    clearInterval(this.timerInterval);
    this.subs.forEach(s => s.unsubscribe());
  }

  // ===========================
  //      TOKEN MODAL & TIMER
  // ===========================
  openTokenModal() {
    this.showTokenModal = true;
    this.updateTokenDisplay();

    // run timer each second while modal open
    this.timerInterval = setInterval(() => {
      this.updateTokenDisplay();

      // If access token has expired (0 seconds) and not already refreshing -> auto refresh
      if (this.accessRemaining <= 0 && !this.refreshing && !this.auth.isRefreshing) {
        this.autoRefresh();
      }
    }, 1000);
  }

  closeTokenModal() {
    this.showTokenModal = false;
    clearInterval(this.timerInterval);
  }

  updateTokenDisplay() {
    this.accessToken = this.auth.getToken();
    this.refreshToken = this.auth.getRefreshTokenFromStorage();
    this.accessRemaining = this.auth.getAccessTokenRemainingSeconds();
    this.refreshRemaining = this.auth.getRefreshTokenRemainingSeconds();

    // Initialize or update baseline lifetime for this token
    if (this.accessRemaining > 0) {
      // if it's first time OR token got refreshed (remaining increased)
      if (this.accessInitial === 0 || this.accessRemaining > this.accessInitial + 1) {
        this.accessInitial = this.accessRemaining;
      }

      if (this.accessInitial > 0) {
        const used = this.accessInitial - this.accessRemaining;
        let percent = (used / this.accessInitial) * 100;
        if (percent < 0) percent = 0;
        if (percent > 100) percent = 100;
        this.accessUsagePercent = Math.round(percent);
      } else {
        this.accessUsagePercent = 0;
      }
    } else {
      this.accessUsagePercent = 100; // fully used / expired
    }
  }

  /** Return CSS class for access timer based on remaining seconds */
  getAccessTimerClass(): string {
    // Flash/pulse when 5s or less remain
    return this.accessRemaining <= 5 ? 'expired' : '';
  }

  // ===========================
  //      AUTO REFRESH
  // ===========================
  private autoRefresh() {
    if (this.refreshing) return;
    this.refreshing = true;
    this.auth.isRefreshing = true;

    this.oldAccessToken = this.auth.getToken();

    const sub = this.auth.refreshToken().subscribe({
      next: (resp: any) => {
        // resp expected: { token: '...' }
        const newTok = resp?.token ?? null;
        if (newTok) {
          this.newAccessToken = String(newTok);
          this.tokenChanged = this.oldAccessToken !== this.newAccessToken;

          // auth.saveNewAccessToken already called by service; ensure UI reflects it
          this.updateTokenDisplay();
        } else {
          console.warn('autoRefresh: refresh returned no token', resp);
        }
        this.refreshing = false;
        this.auth.isRefreshing = false;
      },
      error: (err) => {
        console.warn('autoRefresh failed', err);
        this.refreshing = false;
        this.auth.isRefreshing = false;
        alert('Session expired. Please login again.');
        this.auth.logout();
        this.router.navigate(['/login']);
      }
    });

    this.subs.push(sub);
  }

  // ===========================
  //      MANUAL REFRESH
  // ===========================
  forceRefresh() {
    if (this.refreshing) return;
    this.refreshing = true;
    this.auth.isRefreshing = true;

    this.oldAccessToken = this.auth.getToken();

    const sub = this.auth.refreshToken().subscribe({
      next: (resp: any) => {
        const newTok = resp?.token ?? null;
        if (newTok) {
          this.newAccessToken = String(newTok);
          this.tokenChanged = this.oldAccessToken !== this.newAccessToken;
          // UI reflect
          this.updateTokenDisplay();
        } else {
          console.warn('forceRefresh: refresh returned no token', resp);
          alert('Refresh succeeded but no token was returned by backend.');
        }
        this.refreshing = false;
        this.auth.isRefreshing = false;
      },
      error: (err) => {
        console.warn('forceRefresh failed', err);
        this.refreshing = false;
        this.auth.isRefreshing = false;
        alert('Refresh failed. Please login again.');
        this.auth.logout();
        this.router.navigate(['/login']);
      }
    });

    this.subs.push(sub);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/Home']);
  }
}

 