import {
  Component,
  AfterViewInit
} from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../../auth/theme.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  standalone: false
})
export class Home implements AfterViewInit {

  constructor(
    private router: Router,
    public themeService: ThemeService
  ) {}

  // THEME
  toggleTheme() {
    this.themeService.toggleTheme();
  }

  // SCROLL TO ROLE SECTION
  scrollToRoles() {
    const el = document.getElementById('roles');
    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  // SCROLL REVEAL
  ngAfterViewInit() {
    this.setupScrollReveal();
  }

  private setupScrollReveal() {
    const elements = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
          }
        });
      },
      { threshold: 0.18 }
    );

    elements.forEach(el => observer.observe(el));
  }

  // ROUTING
  loginUser() {
    this.router.navigate(['/login']);
  }

  signupUser() {
    this.router.navigate(['/register-user']);
  }

  loginManager() {
    this.router.navigate(['/login']);
  }

  signupManager() {
    this.router.navigate(['/register-manager']);
  }
}
