import { Component } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-submit-request',
  templateUrl: './submit-request.html',
  styleUrls: ['./submit-request.css'],
  standalone:false
})
export class SubmitRequestComponent {
  requestType = '';
  // description is not in model; put it inside requestType or send as separate field only if backend accepts it
  // we'll send requestType and status
  error = '';
  success = '';
  base = environment.apiBase;

  constructor(
    private auth: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  submit() {
    this.error = '';
    if (!this.requestType) {
      this.error = 'Request Type is required';
      return;
    }

    const payload = this.auth.getUserFromToken();
    const email = payload?.sub;
    if (!email) {
      this.error = 'User not found';
      return;
    }

    // get userId first
    this.http.get<any>(`${this.base}/users/by-email/${email}`).subscribe({
      next: user => {
        // construct body matching backend model
        const body: any = {
          requestType: this.requestType,
          status: 'PENDING'
          // do NOT send createdAt/updatedAt/user fields - backend should set them
        };

        this.http.post(`${this.base}/requests/${user.id}`, body).subscribe({
          next: () => {
            this.success = "Request submitted!";
            setTimeout(() => this.router.navigate(['/my-requests']), 800);
          },
          error: () => this.error = "Failed to submit request"
        });
      },
      error: () => this.error = 'Failed to resolve user'
    });
  }
} 

