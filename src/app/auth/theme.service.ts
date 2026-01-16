import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private isDark = false;

  constructor() {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
      this.enableDark();
    } else {
      this.enableLight();
    }
  }

  toggleTheme() {
    this.isDark = !this.isDark;
    this.isDark ? this.enableDark() : this.enableLight();
  }

  private enableDark() {
    document.documentElement.classList.add('dark-theme');
    localStorage.setItem('theme', 'dark');
  }

  private enableLight() {
    document.documentElement.classList.remove('dark-theme');
    localStorage.setItem('theme', 'light');
  }

  isDarkMode() {
    return this.isDark;
  }
}
