// src/app/components/user-dashboard/user-dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.html',
  styleUrls: ['./user-dashboard.css'],
  standalone: false
})
export class UserDashboardComponent implements OnInit, OnDestroy {

  user: any = null;
  loading = true;
  error = '';
  base = environment.apiBase;

  // ========================
  // TOKEN MONITOR VARIABLES
  // ========================
  showTokenModal = false;

  accessToken: string | null = null;
  refreshToken: string | null = null;

  accessRemaining = 0;
  refreshRemaining = 0;

  accessInitial = 0;
  accessUsagePercent = 0;

  timerInterval: any;
  refreshing = false;
  subs: Subscription[] = [];

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const payload = this.auth.getUserFromToken();
    const email = payload?.sub;

    if (!email) {
      this.error = 'Session expired. Please login again.';
      this.loading = false;
      return;
    }

    // Load user details
    this.http.get<any>(`${this.base}/users/by-email/${email}`).subscribe({
      next: (u) => {
        this.user = u;
        this.loading = false;
      },
      error: () => {
        this.error = 'User could not be loaded. Please login again.';
        this.user = null;
        this.loading = false;
      }
    });

    // Preload token info
    this.updateTokenDisplay();
  }

  ngOnDestroy() {
    clearInterval(this.timerInterval);
    this.subs.forEach(s => s.unsubscribe());
  }

  // ============================
  //      TOKEN MODAL + TIMER
  // ============================
  openTokenModal() {
    this.showTokenModal = true;
    this.updateTokenDisplay();

    this.timerInterval = setInterval(() => {
      this.updateTokenDisplay();

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

    if (this.accessRemaining > 0) {
      if (this.accessInitial === 0 || this.accessRemaining > this.accessInitial + 1) {
        this.accessInitial = this.accessRemaining;
      }

      const used = this.accessInitial - this.accessRemaining;
      let percent = (used / this.accessInitial) * 100;

      this.accessUsagePercent = Math.min(100, Math.max(0, Math.round(percent)));
    } else {
      this.accessUsagePercent = 100;
    }
  }

  // ============================
  //      AUTO REFRESH
  // ============================
  private autoRefresh() {
    if (this.refreshing) return;
    this.refreshing = true;
    this.auth.isRefreshing = true;

    const sub = this.auth.refreshToken().subscribe({
      next: (resp: any) => {
        const newTok = resp?.token ?? null;
        if (newTok) {
          this.updateTokenDisplay();
        }
        this.refreshing = false;
        this.auth.isRefreshing = false;
      },
      error: () => {
        alert('Session expired. Please login again.');
        this.auth.logout();
        this.router.navigate(['/login']);
      }
    });

    this.subs.push(sub);
  }

  // ============================
  //      MANUAL REFRESH
  // ============================
  forceRefresh() {
    if (this.refreshing) return;
    this.refreshing = true;
    this.auth.isRefreshing = true;

    const sub = this.auth.refreshToken().subscribe({
      next: (resp: any) => {
        const newTok = resp?.token ?? null;
        if (newTok) {
          this.updateTokenDisplay();
        } else {
          alert('Refresh succeeded but no new token returned.');
        }
        this.refreshing = false;
        this.auth.isRefreshing = false;
      },
      error: () => {
        alert('Refresh failed. Login again.');
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



