import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container my-5">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="glass-card p-4 p-md-5 auth-card">
            <div class="text-center mb-4">
              <div class="auth-icon-orb mb-3">🔑</div>
              <h3 class="fw-bold text-white mb-1">
                Access <span class="gradient-title">System</span>
              </h3>
              <p class="text-secondary small">Authenticate to explore 3D tours and manage bookings</p>
            </div>

            <!-- Quick Credentials Helper in Dark Glass -->
            <div class="glass-panel p-3 small mb-4 border border-secondary border-opacity-25">
              <strong class="text-cyan-glow">Quick Access Credentials:</strong><br />
              <div class="mt-1 d-flex flex-column gap-1">
                <div>👤 <span class="text-light">Customer:</span> <code class="text-info">customer&#64;karnel.com</code> / <code>Customer123!</code></div>
                <div>👑 <span class="text-light">Admin:</span> <code class="text-info">admin&#64;karnel.com</code> / <code>Admin123!</code></div>
              </div>
            </div>

            <div *ngIf="errorMessage" class="alert alert-danger small">
              {{ errorMessage }}
            </div>

            <form (ngSubmit)="onSubmit()">
              <div class="mb-3">
                <label class="form-label small fw-semibold text-light">Email Address</label>
                <input
                  type="email"
                  class="form-control"
                  placeholder="name@example.com"
                  [(ngModel)]="email"
                  name="email"
                  required
                />
              </div>

              <div class="mb-4">
                <label class="form-label small fw-semibold text-light">Password</label>
                <input
                  type="password"
                  class="form-control"
                  placeholder="••••••••"
                  [(ngModel)]="password"
                  name="password"
                  required
                />
              </div>

              <button type="submit" class="btn btn-primary w-100 py-2 fw-bold shadow-lg" [disabled]="loading">
                {{ loading ? 'Authenticating...' : 'Sign In' }}
              </button>
            </form>

            <div class="text-center mt-4 small">
              <span class="text-secondary">Don't have an account? </span>
              <a routerLink="/register" class="fw-bold text-cyan-glow text-decoration-none">Create account</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-card {
      border: 1px solid rgba(0, 242, 254, 0.25) !important;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 242, 254, 0.15) !important;
    }
    .auth-icon-orb {
      font-size: 2.5rem;
      filter: drop-shadow(0 0 12px rgba(0, 242, 254, 0.6));
      animation: floatSubtle 3s ease-in-out infinite;
    }
    @keyframes floatSubtle {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please provide both email and password.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Invalid credentials or connection issue.';
      }
    });
  }
}
