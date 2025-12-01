import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-manager-requests',
  templateUrl: './manager-requests.html',
  styleUrls: ['./manager-requests.css'],
  standalone: false
})
export class ManagerRequestsComponent implements OnInit {

  requests: any[] = [];
  filteredRequests: any[] = [];
  paginatedRequests: any[] = [];

  managerId: number | null = null;
  base = environment.apiBase;

  // FILTERING
  filterStatus = "ALL";

  // PAGINATION
  page = 1;
  pageSize = 5;
  totalPages = 1;

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    const payload = this.auth.getUserFromToken();
    const email = payload?.sub;
    if (!email) return;

    this.http.get<any>(`${this.base}/managers/by-email/${email}`).subscribe({
      next: (manager) => {
        this.managerId = manager.id;
        this.loadRequests();
      },
      error: () => console.error('Get manager by email failed')
    });
  }

  setFilter(status: string) {
    this.filterStatus = status;
    this.applyFilter(false);
  }

  loadRequests() {
    if (!this.managerId) return;
    this.http.get<any[]>(`${this.base}/managers/${this.managerId}/requests`).subscribe({
      next: (res) => {
        this.requests = (res || []).map(r => ({ ...r, canAct: r.status === 'PENDING' }));
        this.applyFilter(true);
      },
      error: (err) => console.error('Load requests failed', err)
    });
  }

  applyFilter(keepPage: boolean = false) {
    this.filteredRequests = this.filterStatus === 'ALL'
      ? [...this.requests]
      : this.requests.filter(r => r.status === this.filterStatus);

    this.totalPages = Math.max(1, Math.ceil(this.filteredRequests.length / this.pageSize));
    if (!keepPage || this.page > this.totalPages) this.page = 1;
    this.paginate();
  }

  paginate() {
    const start = (this.page - 1) * this.pageSize;
    this.paginatedRequests = this.filteredRequests.slice(start, start + this.pageSize);
  }

  nextPage() { if (this.page < this.totalPages) { this.page++; this.paginate(); } }
  prevPage() { if (this.page > 1) { this.page--; this.paginate(); } }
  goToPage(p: number) { this.page = p; this.paginate(); }

  approve(id: number) {
    this.http.post(`${this.base}/managers/approve-request/${id}/${this.managerId}`, {})
      .subscribe({ next: () => this.loadRequests(), error: (err) => console.error('Approve failed', err) });
  }

  reject(id: number) {
    this.http.post(`${this.base}/managers/reject-request/${id}/${this.managerId}`, {})
      .subscribe({ next: () => this.loadRequests(), error: (err) => console.error('Reject failed', err) });
  }
}
