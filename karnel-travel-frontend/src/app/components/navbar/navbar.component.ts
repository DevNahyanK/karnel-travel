import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="cyber-navbar sticky-top">
      <div class="container d-flex align-items-center justify-content-between py-2">
        <!-- Glowing Brand Logo -->
        <a class="brand-link d-flex align-items-center text-decoration-none" routerLink="/">
          <div class="brand-orb me-2">🌍</div>
          <div class="brand-text">
            <span class="brand-main">Karnel</span>
            <span class="brand-sub">Travel</span>
            <span class="brand-tag">3D</span>
          </div>
        </a>

        <!-- Responsive Toggler -->
        <button
          class="cyber-toggler d-lg-none"
          type="button"
          (click)="mobileMenuOpen = !mobileMenuOpen"
          aria-label="Toggle navigation"
        >
          <span class="cyber-toggler-bar"></span>
          <span class="cyber-toggler-bar"></span>
          <span class="cyber-toggler-bar"></span>
        </button>

        <!-- Nav Links & Actions -->
        <div class="cyber-menu d-none d-lg-flex align-items-center flex-grow-1 justify-content-between ms-4">
          <!-- Main Catalog Links with Glowing Underlines -->
          <ul class="nav-links-list d-flex align-items-center list-unstyled mb-0 gap-1">
            <li>
              <a class="cyber-nav-link" routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
                Home
              </a>
            </li>
            <li>
              <a class="cyber-nav-link" routerLink="/catalog/spots" routerLinkActive="active">
                Spots
              </a>
            </li>
            <li>
              <a class="cyber-nav-link" routerLink="/catalog/hotels" routerLinkActive="active">
                Hotels
              </a>
            </li>
            <li>
              <a class="cyber-nav-link" routerLink="/catalog/resorts" routerLinkActive="active">
                Resorts
              </a>
            </li>
            <li>
              <a class="cyber-nav-link" routerLink="/catalog/restaurants" routerLinkActive="active">
                Dining
              </a>
            </li>
            <li>
              <a class="cyber-nav-link" routerLink="/catalog/transports" routerLinkActive="active">
                Transports
              </a>
            </li>
            <li>
              <a class="cyber-nav-link search-nav-link" routerLink="/search" routerLinkActive="active">
                <span class="search-icon">🔍</span> Search & 3D
              </a>
            </li>
          </ul>

          <!-- User Authentication & Admin Controls -->
          <div class="d-flex align-items-center gap-2">
            <ng-container *ngIf="authService.currentUser$ | async as user; else guestNav">
              <div class="user-chip d-flex align-items-center gap-2 px-3 py-1">
                <span class="user-name small text-light">{{ user.fullName }}</span>
                <span class="role-pill" [class.admin-pill]="user.role === 'Admin'">
                  {{ user.role }}
                </span>
              </div>

              <!-- Admin Glowing Pulsing Tab -->
              <a *ngIf="user.role === 'Admin'" routerLink="/admin" class="admin-pulsing-tab text-decoration-none">
                <span class="pulse-indicator"></span>
                <span>⚙️ Admin Panel</span>
              </a>

              <a routerLink="/my-bookings" class="cyber-pill-btn text-decoration-none">
                My Bookings
              </a>
              <button (click)="onLogout()" class="cyber-btn-logout">
                Logout
              </button>
            </ng-container>

            <ng-template #guestNav>
              <a routerLink="/login" class="cyber-pill-btn text-decoration-none">
                Sign In
              </a>
              <a routerLink="/register" class="cyber-pill-btn-primary text-decoration-none">
                Register
              </a>
            </ng-template>
          </div>
        </div>
      </div>

      <!-- Mobile Dropdown Pane -->
      <div class="mobile-pane d-lg-none" *ngIf="mobileMenuOpen">
        <ul class="list-unstyled p-3 mb-0 d-flex flex-column gap-2">
          <li><a class="cyber-nav-link d-block" routerLink="/" (click)="mobileMenuOpen = false">Home</a></li>
          <li><a class="cyber-nav-link d-block" routerLink="/catalog/spots" (click)="mobileMenuOpen = false">Tourist Spots</a></li>
          <li><a class="cyber-nav-link d-block" routerLink="/catalog/hotels" (click)="mobileMenuOpen = false">Hotels</a></li>
          <li><a class="cyber-nav-link d-block" routerLink="/catalog/resorts" (click)="mobileMenuOpen = false">Resorts</a></li>
          <li><a class="cyber-nav-link d-block" routerLink="/catalog/restaurants" (click)="mobileMenuOpen = false">Restaurants</a></li>
          <li><a class="cyber-nav-link d-block" routerLink="/catalog/transports" (click)="mobileMenuOpen = false">Transports</a></li>
          <li><a class="cyber-nav-link search-nav-link d-block" routerLink="/search" (click)="mobileMenuOpen = false">🔍 Search & 3D</a></li>
          <hr class="border-secondary my-2" />
          <div *ngIf="authService.currentUser$ | async as user; else mobileGuest">
            <div class="small text-light mb-2">Signed in as <strong>{{ user.fullName }}</strong> ({{ user.role }})</div>
            <a *ngIf="user.role === 'Admin'" routerLink="/admin" class="admin-pulsing-tab d-inline-block mb-2" (click)="mobileMenuOpen = false">
              ⚙️ Admin Panel
            </a>
            <div class="d-flex gap-2">
              <a routerLink="/my-bookings" class="cyber-pill-btn" (click)="mobileMenuOpen = false">My Bookings</a>
              <button (click)="onLogout(); mobileMenuOpen = false" class="cyber-btn-logout">Logout</button>
            </div>
          </div>
          <ng-template #mobileGuest>
            <div class="d-flex gap-2">
              <a routerLink="/login" class="cyber-pill-btn" (click)="mobileMenuOpen = false">Sign In</a>
              <a routerLink="/register" class="cyber-pill-btn-primary" (click)="mobileMenuOpen = false">Register</a>
            </div>
          </ng-template>
        </ul>
      </div>
    </nav>
  `,
  styles: [`
    .cyber-navbar {
      background: rgba(11, 12, 22, 0.78);
      backdrop-filter: blur(16px) saturate(200%);
      -webkit-backdrop-filter: blur(16px) saturate(200%);
      border-bottom: 1px solid rgba(0, 242, 254, 0.15);
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.45);
      z-index: 1000;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* Brand Logo & Glowing Hover Effect */
    .brand-link {
      cursor: pointer;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .brand-link:hover {
      transform: translateY(-2px);
    }
    .brand-orb {
      font-size: 1.5rem;
      filter: drop-shadow(0 0 10px rgba(0, 242, 254, 0.8));
      transition: transform 0.5s ease;
    }
    .brand-link:hover .brand-orb {
      transform: rotate(25deg) scale(1.15);
    }
    .brand-main {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.25rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: #ffffff;
      transition: all 0.3s ease;
    }
    .brand-sub {
      font-family: 'Outfit', sans-serif;
      font-size: 1.25rem;
      font-weight: 700;
      margin-left: 3px;
      background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 0 16px rgba(0, 242, 254, 0.4);
    }
    .brand-link:hover .brand-main {
      text-shadow: 0 0 14px rgba(255, 255, 255, 0.6);
    }
    .brand-link:hover .brand-sub {
      text-shadow: 0 0 25px rgba(0, 242, 254, 0.9);
    }
    .brand-tag {
      font-size: 0.65rem;
      font-weight: 800;
      background: linear-gradient(135deg, #a855f7, #ec4899);
      color: #fff;
      padding: 1px 5px;
      border-radius: 4px;
      margin-left: 6px;
      letter-spacing: 0.05em;
      vertical-align: middle;
      box-shadow: 0 0 8px rgba(168, 85, 247, 0.6);
    }

    /* Cyber Navigation Links with Animated Glowing Underlines */
    .cyber-nav-link {
      position: relative;
      color: #cbd5e1;
      font-size: 0.9rem;
      font-weight: 600;
      padding: 0.5rem 0.85rem;
      text-decoration: none;
      transition: color 0.3s ease, transform 0.2s ease;
      display: inline-block;
    }
    .cyber-nav-link::after {
      content: "";
      position: absolute;
      bottom: 2px;
      left: 50%;
      width: 0;
      height: 2px;
      background: linear-gradient(90deg, #00f2fe 0%, #a855f7 100%);
      box-shadow: 0 0 10px #00f2fe;
      transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1), left 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      border-radius: 999px;
    }
    .cyber-nav-link:hover {
      color: #ffffff;
      transform: translateY(-1px);
    }
    .cyber-nav-link:hover::after, .cyber-nav-link.active::after {
      width: 80%;
      left: 10%;
    }
    .cyber-nav-link.active {
      color: #00f2fe !important;
      text-shadow: 0 0 12px rgba(0, 242, 254, 0.6);
    }

    /* Search Link Special Glow */
    .search-nav-link {
      background: rgba(0, 242, 254, 0.06);
      border: 1px solid rgba(0, 242, 254, 0.2);
      border-radius: 999px;
      padding: 0.35rem 0.9rem;
    }
    .search-nav-link:hover {
      background: rgba(0, 242, 254, 0.15);
      border-color: #00f2fe;
      box-shadow: 0 0 15px rgba(0, 242, 254, 0.4);
    }

    /* Admin Energetic Glowing UI Tab */
    .admin-pulsing-tab {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(236, 72, 153, 0.25) 100%);
      border: 1px solid rgba(168, 85, 247, 0.6);
      color: #f3e8ff;
      font-size: 0.8rem;
      font-weight: 700;
      padding: 0.4rem 0.85rem;
      border-radius: 999px;
      animation: adminPulse 2s infinite ease-in-out;
      transition: all 0.3s ease;
    }
    .admin-pulsing-tab:hover {
      color: #ffffff;
      border-color: #ec4899;
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 0 25px rgba(236, 72, 153, 0.7);
    }
    .pulse-indicator {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #00f2fe;
      box-shadow: 0 0 10px #00f2fe;
      animation: blink 1.2s infinite;
    }
    @keyframes adminPulse {
      0%, 100% {
        box-shadow: 0 0 10px rgba(168, 85, 247, 0.35), inset 0 0 8px rgba(168, 85, 247, 0.2);
      }
      50% {
        box-shadow: 0 0 22px rgba(168, 85, 247, 0.7), inset 0 0 14px rgba(168, 85, 247, 0.4);
      }
    }
    @keyframes blink {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.8); }
    }

    /* User Chips & Buttons */
    .user-chip {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 999px;
    }
    .role-pill {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 999px;
      background: rgba(148, 163, 184, 0.2);
      color: #cbd5e1;
    }
    .role-pill.admin-pill {
      background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
      color: #ffffff;
      box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
    }

    .cyber-pill-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #e2e8f0;
      font-size: 0.82rem;
      font-weight: 600;
      padding: 0.4rem 0.9rem;
      border-radius: 999px;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .cyber-pill-btn:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.4);
      color: #ffffff;
      transform: translateY(-2px);
    }

    .cyber-pill-btn-primary {
      background: linear-gradient(135deg, #00f2fe 0%, #0d6efd 100%);
      border: 1px solid rgba(0, 242, 254, 0.4);
      color: #ffffff;
      font-size: 0.82rem;
      font-weight: 700;
      padding: 0.4rem 1rem;
      border-radius: 999px;
      box-shadow: 0 4px 15px rgba(0, 242, 254, 0.35);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .cyber-pill-btn-primary:hover {
      box-shadow: 0 6px 25px rgba(0, 242, 254, 0.6);
      transform: translateY(-2px) scale(1.03);
    }

    .cyber-btn-logout {
      background: transparent;
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #f87171;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.35rem 0.8rem;
      border-radius: 999px;
      transition: all 0.3s ease;
    }
    .cyber-btn-logout:hover {
      background: rgba(239, 68, 68, 0.2);
      border-color: #ef4444;
      color: #ffffff;
      box-shadow: 0 0 12px rgba(239, 68, 68, 0.4);
    }

    /* Mobile Toggler */
    .cyber-toggler {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(0, 242, 254, 0.3);
      border-radius: 8px;
      padding: 6px 10px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .cyber-toggler-bar {
      width: 20px;
      height: 2px;
      background: #00f2fe;
      border-radius: 2px;
      box-shadow: 0 0 6px #00f2fe;
    }
    .mobile-pane {
      background: rgba(11, 12, 22, 0.95);
      backdrop-filter: blur(20px);
      border-top: 1px solid rgba(0, 242, 254, 0.15);
      border-bottom: 1px solid rgba(0, 242, 254, 0.15);
    }
  `]
})
export class NavbarComponent {
  mobileMenuOpen = false;

  constructor(public authService: AuthService, private router: Router) {}

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
