import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { RoleService } from './role.service';

@Injectable({
  providedIn: 'root'
})
export class UserGuard implements CanActivate {

  constructor(private role: RoleService, private router: Router) {}

  canActivate(): boolean {
    if (this.role.isUser()) return true;

    this.router.navigate(['/login']);
    return false;
  }
}
