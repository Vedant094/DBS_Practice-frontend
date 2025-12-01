import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: false
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;
  userNotFound = false;

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    if (!this.email || !this.password) {
      this.error = 'Email and password are required';
      this.userNotFound = false;
      return;
    }

    this.loading = true;
    this.error = '';
    this.userNotFound = false;

    // STEP 1 → Check Email
    this.auth.checkEmail(this.email).subscribe({
      next: (res) => {
        if (!res.exists) {
          this.loading = false;
          this.error = 'User not found';
          this.userNotFound = true;
          return;
        }

        // STEP 2 → Email exists, try logging in
        this.auth.login(this.email, this.password).subscribe({
          next: () => {
            this.loading = false;
            const role = this.auth.getRole();
            if (role === 'ROLE_MANAGER') this.router.navigate(['/manager-dashboard']);
            else if (role === 'ROLE_USER') this.router.navigate(['/user-dashboard']);
            else this.router.navigate(['/']);
          },
          error: () => {
            this.loading = false;
            this.error = 'Incorrect email or password';
            this.userNotFound = false;
          }
        });
      },

      error: () => {
        this.loading = false;
        this.error = 'Something went wrong. Try again.';
      }
    });
  }
}
