import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { RoleService } from '../../auth/role.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl:'./dashboard.component.css',
  standalone:false
})
export class DashboardComponent implements OnInit {

  userEmail = '';

  constructor(
    public role: RoleService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const payload = this.auth.getUserFromToken();
    this.userEmail = payload?.sub || '';
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
