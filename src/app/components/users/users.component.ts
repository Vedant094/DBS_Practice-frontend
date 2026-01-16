import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  standalone:false
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  base = environment.apiBase;
  loading = false;
  error = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.error = '';
    this.http.get<any[]>(`${this.base}/users/all`).subscribe({
      next: res => { this.users = res || []; this.loading = false; },
      error: err => { this.error = 'Failed to load users'; this.loading = false; }
    });
  }
}
