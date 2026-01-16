import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment'; 

@Component({
  selector: 'app-register-manager',
  templateUrl: './register-manager.html',
  styleUrl:'./register-manager.css',
  standalone:false
})
export class RegisterManagerComponent {
  name = '';
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private http: HttpClient, private router: Router) {}

  submit() {
    this.error = '';
    if (!this.email || !this.password) {
      this.error = 'Email and Password required';
      return;
    }
    this.loading = true;

    const body = {
      name: this.name,
      email: this.email,
      password: this.password
    };

    this.http.post(`${environment.apiBase}/managers`, body).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/login']);
      },
      error: err => {
        this.loading = false;
        this.error = err?.error || 'Failed to register manager';
      }
    });
  }
}
