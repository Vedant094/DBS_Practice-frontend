import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-managers',
  templateUrl: './managers.component.html',
  styleUrl:'./managers.component.css',
  standalone:false
})
export class ManagersComponent implements OnInit {
  managers: any[] = [];
  base = environment.apiBase;
  loading = false;
  error = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.http.get<any[]>(`${this.base}/managers/all`).subscribe({
      next: res => { this.managers = res || []; this.loading = false; },
      error: err => { this.error = 'Failed to load managers'; this.loading = false; }
    });
  }
}
