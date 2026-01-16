import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  constructor(private auth: AuthService) {}

  isManager() {
    return this.auth.getRole() === 'ROLE_MANAGER';
  }

  isUser() {
    return this.auth.getRole() === 'ROLE_USER';
  }

  isLoggedIn() {
    return !!this.auth.getToken();
  }
}
