import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="cyber-footer text-secondary py-5 mt-auto">
      <div class="container">
        <div class="row g-4">
          <div class="col-lg-4 col-md-6">
            <h5 class="text-white fw-bold mb-3 d-flex align-items-center">
              <span class="fs-4 me-2">🌍</span> <span class="gradient-title">Karnel Travel Guide</span>
            </h5>
            <p class="small text-secondary">
              Discover Pakistan's breathtaking alpine landscapes, historic architecture, luxury stays, gourmet dining, and convenient transport options in an interactive 3D spatial experience.
            </p>
            <p class="small text-secondary mb-0">
              📞 +92 (21) 111-KARNEL | ✉️ support&#64;karnel.com
            </p>
          </div>

          <div class="col-lg-2 col-md-6">
            <h6 class="text-white fw-bold mb-3">Explore Sector</h6>
            <ul class="list-unstyled small">
              <li class="mb-2"><a routerLink="/catalog/spots" class="cyber-footer-link">Tourist Spots</a></li>
              <li class="mb-2"><a routerLink="/catalog/hotels" class="cyber-footer-link">Hotels</a></li>
              <li class="mb-2"><a routerLink="/catalog/resorts" class="cyber-footer-link">Resorts</a></li>
              <li class="mb-2"><a routerLink="/catalog/restaurants" class="cyber-footer-link">Restaurants</a></li>
              <li class="mb-2"><a routerLink="/catalog/transports" class="cyber-footer-link">Transports</a></li>
            </ul>
          </div>

          <div class="col-lg-3 col-md-6">
            <h6 class="text-white fw-bold mb-3">Key Destinations</h6>
            <ul class="list-unstyled small text-secondary">
              <li class="mb-2">🏔️ Hunza Valley & Passu Cones</li>
              <li class="mb-2">🌲 Murree & Patriata Hills</li>
              <li class="mb-2">🕌 Badshahi Mosque & Lahore Fort</li>
              <li class="mb-2">🌊 Clifton Beach, Karachi</li>
              <li class="mb-2">⛰️ Margalla Hills & Faisal Mosque</li>
            </ul>
          </div>

          <div class="col-lg-3 col-md-6">
            <h6 class="text-white fw-bold mb-3">3D Spatial Tours</h6>
            <p class="small text-secondary">
              Experience hotels and landmarks with our browser-based interactive 3D WebGL / WebXR spatial model viewer.
            </p>
            <div class="glass-panel p-3">
              <span class="badge bg-primary-subtle text-cyan-glow mb-1">WebGL 3.0 Ready</span>
              <p class="small text-light mb-0" style="opacity: 0.85;">
                Hardware-accelerated 360° AR & 3D holographic tilt simulation.
              </p>
            </div>
          </div>
        </div>

        <hr class="border-secondary border-opacity-25 my-4" />
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 small text-secondary">
          <span>&copy; {{ currentYear }} Karnel Travel Guide System. Ultra-Premium Dark 3D Edition.</span>
          <span>Powered by .NET 8 Web API & Angular</span>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .cyber-footer {
      background: rgba(7, 8, 16, 0.95);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-top: 1px solid rgba(0, 242, 254, 0.15);
      position: relative;
      z-index: 10;
    }

    .cyber-footer-link {
      color: #94a3b8;
      text-decoration: none;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      display: inline-block;
    }
    .cyber-footer-link:hover {
      color: #00f2fe;
      transform: translateX(4px);
      text-shadow: 0 0 10px rgba(0, 242, 254, 0.5);
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
