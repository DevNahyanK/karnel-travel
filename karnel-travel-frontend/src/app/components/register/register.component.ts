import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container my-5">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="glass-card p-4 p-md-5 auth-card">
            <div class="text-center mb-4">
              <div class="auth-icon-orb mb-3">📝</div>
              <h3 class="fw-bold text-white mb-1">
                Create <span class="gradient-title">Account</span>
              </h3>
              <p class="text-secondary small">Join Karnel Travel Guide to unlock booking features and 3D access</p>
            </div>

            <div *ngIf="errorMessage" class="alert alert-danger small">
              {{ errorMessage }}
            </div>

            <form (ngSubmit)="onSubmit()">
              <div class="mb-3">
                <label class="form-label small fw-semibold text-light">Full Name</label>
                <input
                  type="text"
                  class="form-control"
                  placeholder="e.g. Ali Ahmed"
                  [(ngModel)]="formData.fullName"
                  name="fullName"
                  required
                />
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold text-light">Email Address</label>
                <input
                  type="email"
                  class="form-control"
                  placeholder="name@example.com"
                  [(ngModel)]="formData.email"
                  name="email"
                  required
                />
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold text-light">Phone Number</label>
                <input
                  type="tel"
                  class="form-control"
                  placeholder="+92 300 1234567"
                  [(ngModel)]="formData.phone"
                  name="phone"
                  required
                />
              </div>

              <div class="mb-4">
                <label class="form-label small fw-semibold text-light">Password</label>
                <input
                  type="password"
                  class="form-control"
                  placeholder="At least 8 characters"
                  [(ngModel)]="formData.password"
                  name="password"
                  minlength="8"
                  required
                />
              </div>

              <button type="submit" class="btn btn-primary w-100 py-2 fw-bold shadow-lg" [disabled]="loading">
                {{ loading ? 'Provisioning Account...' : 'Register Now' }}
              </button>
            </form>

            <div class="text-center mt-4 small">
              <span class="text-secondary">Already registered? </span>
              <a routerLink="/login" class="fw-bold text-cyan-glow text-decoration-none">Sign In</a>
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
export class RegisterComponent {
  formData = {
    fullName: '',
    email: '',
    phone: '',
    password: ''
  };

  loading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.formData.fullName || !this.formData.email || !this.formData.phone || !this.formData.password) {
      this.errorMessage = 'Please complete all required fields.';
      return;
    }

    if (this.formData.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters long.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.register(this.formData).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Registration failed. Email might already be taken.';
      }
    });
  }
}
