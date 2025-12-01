import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../../auth/theme.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  standalone: false
})
export class Home {

  userOpen = false;
  managerOpen = false;

  constructor(private router: Router,public themeService:ThemeService) {}

  toggleUser() {
    this.userOpen = !this.userOpen;
    this.managerOpen = false;
  }

  toggleManager() {
    this.managerOpen = !this.managerOpen;
    this.userOpen = false;
  }

  navigate(route: string) {
    this.userOpen = false;
    this.managerOpen = false;
    this.router.navigate([route]);
  }

  // CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
  @HostListener('document:click', ['$event'])
  handleClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.userOpen = false;
      this.managerOpen = false;
    }
  }

  login(){
    this.router.navigate(['/login']);
  }

  toggleTheme(){
    this.themeService.toggleTheme();
  }
}