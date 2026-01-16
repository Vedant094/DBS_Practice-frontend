import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrl:'./requests.css',
  standalone:false
})
export class RequestsComponent implements OnInit {
  requests: any[] = [];
  base = environment.apiBase;
  loading = false;
  error = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.http.get<any[]>(`${this.base}/requests/all`).subscribe({
      next: res => { this.requests = res || []; this.loading = false; },
      error: err => { this.error = 'Failed to load requests'; this.loading = false; }
    });
  }

  approve(id: number) {
    const managerId = prompt('Enter managerId to approve (use a real id in production)') || '1';
    this.http.post(`${this.base}/managers/approve-request/${id}/${managerId}`, {}).subscribe({
      next: () => this.load(),
      error: () => alert('Failed to approve')
    });
  }

  reject(id: number) {
    if (!confirm('Reject this request?')) return;
    this.http.post(`${this.base}/managers/reject-request/${id}`, {}).subscribe({
      next: () => this.load(),
      error: () => alert('Failed to reject')
    });
  }
}
