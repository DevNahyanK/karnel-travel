import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService, City, CatalogItem } from '../../services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <!-- Cosmic Hero Section -->
    <section class="karnel-hero text-center position-relative">
      <div class="container py-4 position-relative" style="z-index: 2;">
        <span class="badge hero-pill-badge mb-3">
          ✨ The Ultimate Pakistan 3D Travel Guide
        </span>
        <h1 class="display-4 fw-extrabold mb-3 text-white">
          Explore, Stay & Journey Across <span class="gradient-title">Pakistan</span>
        </h1>
        <p class="lead mb-4 mx-auto text-light opacity-90" style="max-width: 720px;">
          From the turquoise glacial lakes of Hunza to ancient Mughal forts and Arabian Sea coasts, experience next-generation 3D spatial travel previews.
        </p>

        <!-- Quick Destination Search Glass Box -->
        <div class="glass-panel p-3 p-md-4 mx-auto" style="max-width: 880px;">
          <div class="row g-2 align-items-center">
            <div class="col-md-5">
              <div class="input-group">
                <span class="input-group-text bg-transparent border-0 text-cyan-glow fs-5">🔍</span>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Search hotels, spots, resorts..."
                  [(ngModel)]="searchKeyword"
                  (keyup.enter)="onSearch()"
                />
              </div>
            </div>
            <div class="col-md-4">
              <select class="form-select" [(ngModel)]="selectedCityId">
                <option [ngValue]="null">All Cities</option>
                <option *ngFor="let city of cities" [ngValue]="city.cityId">
                  {{ city.name }} ({{ city.region }})
                </option>
              </select>
            </div>
            <div class="col-md-3">
              <button class="btn btn-primary w-100 fw-bold py-2 cyber-search-btn" (click)="onSearch()">
                Launch Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Interactive Category Launchpad -->
    <section class="container my-5">
      <div class="row g-3 text-center">
        <div class="col-6 col-md">
          <a routerLink="/catalog/spots" class="glass-card p-3 text-decoration-none category-tile h-100 d-flex flex-column align-items-center justify-content-center">
            <div class="category-icon mb-2">🏖️</div>
            <h6 class="fw-bold mb-1 text-white">Tourist Spots</h6>
            <small class="text-secondary">Scenic Landmarks</small>
          </a>
        </div>
        <div class="col-6 col-md">
          <a routerLink="/catalog/hotels" class="glass-card p-3 text-decoration-none category-tile h-100 d-flex flex-column align-items-center justify-content-center">
            <div class="category-icon mb-2">🏨</div>
            <h6 class="fw-bold mb-1 text-white">Hotels</h6>
            <small class="text-secondary">Luxury & Budget</small>
          </a>
        </div>
        <div class="col-6 col-md">
          <a routerLink="/catalog/resorts" class="glass-card p-3 text-decoration-none category-tile h-100 d-flex flex-column align-items-center justify-content-center">
            <div class="category-icon mb-2">🌴</div>
            <h6 class="fw-bold mb-1 text-white">Resorts</h6>
            <small class="text-secondary">Scenic Retreats</small>
          </a>
        </div>
        <div class="col-6 col-md">
          <a routerLink="/catalog/restaurants" class="glass-card p-3 text-decoration-none category-tile h-100 d-flex flex-column align-items-center justify-content-center">
            <div class="category-icon mb-2">🍽️</div>
            <h6 class="fw-bold mb-1 text-white">Restaurants</h6>
            <small class="text-secondary">Gourmet Cuisines</small>
          </a>
        </div>
        <div class="col-6 col-md">
          <a routerLink="/catalog/transports" class="glass-card p-3 text-decoration-none category-tile h-100 d-flex flex-column align-items-center justify-content-center">
            <div class="category-icon mb-2">✈️</div>
            <h6 class="fw-bold mb-1 text-white">Transports</h6>
            <small class="text-secondary">Air, Bus & Train</small>
          </a>
        </div>
      </div>
    </section>

    <!-- Featured Tourist Spots Section -->
    <section class="container my-5">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <span class="badge bg-primary-subtle mb-1">Featured Highlights</span>
          <h3 class="fw-bold mb-1 gradient-title">Must-Visit Tourist Attractions</h3>
          <p class="text-secondary mb-0">Iconic historical marvels and breathtaking natural wonderlands</p>
        </div>
        <a routerLink="/catalog/spots" class="btn btn-outline-primary btn-sm px-3">
          Explore All Spots &rarr;
        </a>
      </div>

      <div class="row g-4" *ngIf="featuredSpots.length > 0; else loadingSpots">
        <div class="col-md-4" *ngFor="let spot of featuredSpots">
          <div class="glass-card h-100 d-flex flex-column">
            <!-- Image with Holographic Overlay -->
            <div class="card-img-wrapper position-relative overflow-hidden">
              <img
                [src]="spot.image || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b'"
                class="card-img-top"
                [alt]="spot.name"
                style="height: 230px; object-fit: cover;"
              />
              <span class="position-absolute top-0 end-0 m-2 badge bg-dark bg-opacity-75 text-light border border-secondary" *ngIf="spot.city">
                📍 {{ spot.city.name }}
              </span>
              <!-- Holographic 3D Tag on Hover -->
              <div class="holo-3d-tag">
                <span>🌐 3D Spatial View</span>
              </div>
            </div>

            <div class="card-body p-4 d-flex flex-column flex-grow-1">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="badge bg-primary-subtle">{{ spot.type }}</span>
                <small class="text-secondary">Season: <strong class="text-light">{{ spot.bestSeason || 'All Year' }}</strong></small>
              </div>
              <h5 class="card-title fw-bold text-white mb-2">{{ spot.name }}</h5>
              <p class="card-text text-secondary small flex-grow-1">{{ spot.description }}</p>

              <div class="mt-3 pt-3 border-top border-secondary border-opacity-25 d-flex justify-content-between align-items-center">
                <span class="small text-cyan-glow">Verified Location</span>
                <a [routerLink]="['/catalog', 'spots', spot.spotId]" class="btn btn-sm btn-outline-primary">
                  Inspect 3D &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ng-template #loadingSpots>
        <div class="glass-panel text-center py-5">
          <div class="spinner-border text-info me-2" role="status"></div>
          <span class="text-light">Loading premium attractions...</span>
        </div>
      </ng-template>
    </section>

    <!-- Featured Hotels Section -->
    <section class="container my-5 pb-5">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <span class="badge bg-primary-subtle mb-1">Elite Stays</span>
          <h3 class="fw-bold mb-1 gradient-purple-title">Top-Rated Hotels & Stays</h3>
          <p class="text-secondary mb-0">Experience world-class hospitality with interactive 3D spatial previews</p>
        </div>
        <a routerLink="/catalog/hotels" class="btn btn-outline-primary btn-sm px-3">
          Explore All Hotels &rarr;
        </a>
      </div>

      <div class="row g-4" *ngIf="featuredHotels.length > 0; else loadingHotels">
        <div class="col-md-4" *ngFor="let hotel of featuredHotels">
          <div class="glass-card h-100 d-flex flex-column">
            <!-- Image with Breathing Glow Rating Tag -->
            <div class="card-img-wrapper position-relative overflow-hidden">
              <img
                [src]="hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'"
                class="card-img-top"
                [alt]="hotel.name"
                style="height: 230px; object-fit: cover;"
              />
              <!-- Dynamic Overlay Tag with Active Breathing Pulse -->
              <span class="position-absolute top-0 end-0 m-2 badge-rating">
                ★ {{ hotel.starRating || 5 }} Stars
              </span>
              <span class="position-absolute top-0 start-0 m-2 badge bg-dark bg-opacity-75 text-light border border-secondary" *ngIf="hotel.city">
                📍 {{ hotel.city.name }}
              </span>
              <!-- Holographic 3D Tag -->
              <div class="holo-3d-tag">
                <span>🌐 3D Spatial Tour</span>
              </div>
            </div>

            <div class="card-body p-4 d-flex flex-column flex-grow-1">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="text-success fw-bold fs-6">
                  PKR {{ hotel.pricePerNight | number }} <small class="text-secondary fw-normal">/ night</small>
                </span>
                <span class="badge" [ngClass]="(hotel.roomsAvailable || 0) > 0 ? 'bg-success-subtle' : 'bg-danger-subtle'">
                  {{ (hotel.roomsAvailable || 0) > 0 ? hotel.roomsAvailable + ' Available' : 'Booked' }}
                </span>
              </div>
              <h5 class="card-title fw-bold text-white mb-1">{{ hotel.name }}</h5>
              <p class="card-text text-secondary small mb-2">{{ hotel.address }}</p>
              <div class="small text-light text-opacity-75 mb-3" *ngIf="hotel.amenities">
                ✨ {{ hotel.amenities }}
              </div>

              <div class="mt-auto pt-3 border-top border-secondary border-opacity-25 d-flex justify-content-between align-items-center">
                <small class="text-secondary">3D VR Ready</small>
                <a [routerLink]="['/catalog', 'hotels', hotel.hotelId]" class="btn btn-sm btn-primary">
                  View & Book
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ng-template #loadingHotels>
        <div class="glass-panel text-center py-5">
          <div class="spinner-border text-info me-2" role="status"></div>
          <span class="text-light">Loading verified hotels...</span>
        </div>
      </ng-template>
    </section>
  `,
  styles: [`
    .hero-pill-badge {
      background: rgba(0, 242, 254, 0.12);
      color: #00f2fe;
      border: 1px solid rgba(0, 242, 254, 0.35);
      border-radius: 999px;
      padding: 0.45rem 1.25rem;
      font-size: 0.85rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      box-shadow: 0 0 15px rgba(0, 242, 254, 0.25);
    }

    .cyber-search-btn {
      letter-spacing: 0.02em;
    }

    .category-tile {
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
    }
    .category-tile:hover {
      border-color: rgba(0, 242, 254, 0.5) !important;
      transform: translateY(-8px) scale(1.04);
      box-shadow: 0 15px 35px rgba(0, 242, 254, 0.25);
    }
    .category-icon {
      font-size: 2.2rem;
      transition: transform 0.3s ease;
    }
    .category-tile:hover .category-icon {
      transform: scale(1.2) rotate(6deg);
    }

    .card-img-wrapper {
      border-radius: 1.25rem 1.25rem 0 0;
    }
  `]
})
export class HomeComponent implements OnInit {
  cities: City[] = [];
  featuredSpots: CatalogItem[] = [];
  featuredHotels: CatalogItem[] = [];

  searchKeyword: string = '';
  selectedCityId: number | null = null;

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.apiService.getCities().subscribe({
      next: (data) => (this.cities = data),
      error: () => console.log('Backend not reached yet or seeding pending')
    });

    this.apiService.getCatalog('spots').subscribe({
      next: (data) => (this.featuredSpots = data.slice(0, 3)),
      error: () => {}
    });

    this.apiService.getCatalog('hotels').subscribe({
      next: (data) => (this.featuredHotels = data.slice(0, 3)),
      error: () => {}
    });
  }

  onSearch(): void {
    this.router.navigate(['/catalog/hotels'], {
      queryParams: {
        keyword: this.searchKeyword || null,
        cityId: this.selectedCityId || null
      }
    });
  }
}
