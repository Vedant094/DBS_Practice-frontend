import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { RoleService } from './role.service'; 

@Injectable({
  providedIn: 'root'
})
export class ManagerGuard implements CanActivate {

  constructor(private role: RoleService, private router: Router) {}

  canActivate(): boolean {
    if (this.role.isManager()) return true;

    this.router.navigate(['/login']);
    return false;
  }
}
