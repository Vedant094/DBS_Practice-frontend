import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-register-user',
  templateUrl: './register-user.html',
  styleUrls: ['./register-user.css'],
  standalone:false
})
export class RegisterUserComponent {
  
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  managerId = '';
  error = '';
  loading = false;
  message = '';

  showPassword = false;

  constructor(private http: HttpClient, private router: Router) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  submit() {
    this.error = '';

    if (!this.email || !this.password || !this.managerId || !this.firstName || !this.lastName) {
      this.error = 'All fields are required!';
      return;
    }

    this.loading = true;

    const body = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password
    };

    this.http.post(`${environment.apiBase}/users/${this.managerId}`, body).subscribe({
      next: () => {
        this.loading = false;
        this.message = 'User registered successfully';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: err => {
        this.loading = false;
        this.error = err?.error || 'Failed to register user';
      }
    });
  }
}

