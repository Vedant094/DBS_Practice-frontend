import { Component } from '@angular/core';
import { RoleService } from '../../auth/role.service';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  standalone:false
})
export class NavbarComponent {

  constructor(
    public role: RoleService,
    private auth: AuthService,
    private router: Router
  ) {}

  logout() {
    this.auth.logout();  // clear token from storage
    this.router.navigate(['/login']);
  }
}
