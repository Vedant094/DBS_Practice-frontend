import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: false
})
export class LoginComponent implements OnInit, AfterViewInit {

  email = '';
  password = '';
  error = '';
  loading = false;
  userNotFound = false;

  showPassword = false;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.initTiltEffect();
    this.initParticles();
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  initTiltEffect() {
    const card = document.getElementById("loginCard");
    if (!card) return;

    card.addEventListener("mousemove", e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      card.style.transform =
        `rotateY(${x / 25}deg) rotateX(${-y / 25}deg) scale(1.03)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "rotateY(0deg) rotateX(0deg) scale(1)";
    });
  }

  initParticles() {
    const canvas: any = document.getElementById("particleCanvas");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: any[] = [];
    for (let i = 0; i < 55; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 3 + 1,
        dx: (Math.random() - 0.5) * 1,
        dy: (Math.random() - 0.5) * 1
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.fill();

        p.x += p.dx;
        p.y += p.dy;

        if (p.x < 0 || p.x > canvas.width) p.dx = -p.dx;
        if (p.y < 0 || p.y > canvas.height) p.dy = -p.dy;
      }

      requestAnimationFrame(animate);
    }

    animate();
  }

  submit() {
    if (!this.email || !this.password) {
      this.error = 'Email and password are required';
      this.userNotFound = false;
      return;
    }

    this.loading = true;
    this.error = '';
    this.userNotFound = false;

    this.auth.checkEmail(this.email).subscribe({
      next: (res) => {
        if (!res.exists) {
          this.loading = false;
          this.error = 'User not found';
          this.userNotFound = true;
          return;
        }

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


