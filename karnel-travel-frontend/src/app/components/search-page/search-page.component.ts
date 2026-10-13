import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService, City, CatalogItem } from '../../services/api.service';

interface SearchResultItem extends CatalogItem {
  categoryType: string;
}

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container my-5">
      <!-- Page Header -->
      <div class="mb-4">
        <span class="badge bg-primary-subtle mb-1">Unified Search Protocol</span>
        <h2 class="fw-bold mb-1 text-white d-flex align-items-center">
          <span class="fs-3 me-2">🔍</span> <span class="gradient-title">3D Spatial Travel Catalog Search</span>
        </h2>
        <p class="text-secondary small">Filter verified tourist spots, luxury resorts, gourmet dining, and cross-city routes</p>
      </div>

      <!-- Cyber Filter Controls Panel -->
      <div class="glass-panel p-4 mb-5">
        <form (ngSubmit)="onSearch()">
          <div class="row g-3">
            <!-- Keyword Input -->
            <div class="col-md-4">
              <label class="form-label small fw-semibold text-light">Keyword</label>
              <input
                type="text"
                class="form-control"
                placeholder="e.g. Serena, Beach, Luxury..."
                [(ngModel)]="searchParams.keyword"
                name="keyword"
              />
            </div>

            <!-- Destination City Dropdown -->
            <div class="col-md-4">
              <label class="form-label small fw-semibold text-light">Destination City</label>
              <select class="form-select" [(ngModel)]="searchParams.cityId" name="cityId">
                <option [ngValue]="null">All Cities</option>
                <option *ngFor="let c of cities" [ngValue]="c.cityId">
                  {{ c.name }} ({{ c.region }})
                </option>
              </select>
            </div>

            <!-- Category Select -->
            <div class="col-md-4">
              <label class="form-label small fw-semibold text-light">Category</label>
              <select class="form-select" [(ngModel)]="searchParams.type" name="type">
                <option value="">All Categories</option>
                <option value="spots">Tourist Attractions</option>
                <option value="hotels">Hotels</option>
                <option value="resorts">Resorts</option>
                <option value="restaurants">Restaurants</option>
                <option value="transports">Transports</option>
              </select>
            </div>

            <!-- Max Price Slider / Input -->
            <div class="col-md-4">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <label class="form-label small fw-semibold text-light mb-0">Max Budget</label>
                <span class="small text-cyan-glow fw-bold">
                  {{ searchParams.maxPrice ? 'PKR ' + (searchParams.maxPrice | number) : 'No Limit' }}
                </span>
              </div>
              <input
                type="range"
                class="form-range"
                min="1000"
                max="50000"
                step="1000"
                [(ngModel)]="searchParams.maxPrice"
                name="maxPrice"
              />
            </div>

            <!-- Min Rating Slider / Input -->
            <div class="col-md-4">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <label class="form-label small fw-semibold text-light mb-0">Minimum Rating</label>
                <span class="small text-warning fw-bold">
                  {{ searchParams.minRating ? '★ ' + searchParams.minRating + '+' : 'Any' }}
                </span>
              </div>
              <input
                type="range"
                class="form-range"
                min="1"
                max="5"
                step="0.5"
                [(ngModel)]="searchParams.minRating"
                name="minRating"
              />
            </div>

            <!-- Action Buttons -->
            <div class="col-md-4 d-flex align-items-end gap-2">
              <button type="submit" class="btn btn-primary w-100 fw-bold shadow-sm" [disabled]="loading">
                {{ loading ? 'Filtering...' : 'Apply Filters' }}
              </button>
              <button type="button" class="btn btn-outline-light" (click)="onReset()">
                Reset
              </button>
            </div>
          </div>
        </form>
      </div>

      <!-- Results Count Bar -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h5 class="fw-bold mb-0 text-white">
          Active Matches <span class="badge bg-primary-subtle rounded-pill ms-2">{{ flatResults.length }}</span>
        </h5>
        <span class="text-secondary small" *ngIf="!loading">Connected to live SQLite catalog</span>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="glass-panel text-center py-5">
        <div class="spinner-border text-info me-2" role="status"></div>
        <span class="text-light">Scanning catalog database...</span>
      </div>

      <!-- Results Grid with Cyber Glass Cards -->
      <div class="row g-4" *ngIf="!loading && flatResults.length > 0">
        <div class="col-md-6 col-lg-4" *ngFor="let item of flatResults">
          <div class="glass-card h-100 d-flex flex-column">
            <div class="position-relative overflow-hidden">
              <img
                [src]="item.image || defaultImage"
                class="card-img-top"
                [alt]="item.name || item.operator"
                style="height: 230px; object-fit: cover;"
              />
              <span class="position-absolute top-0 start-0 m-2 badge bg-dark bg-opacity-75 text-cyan-glow text-capitalize border border-secondary">
                {{ item.categoryType }}
              </span>
              <span class="position-absolute top-0 end-0 m-2 badge-rating" *ngIf="item.starRating || item.rating">
                ★ {{ item.starRating || item.rating }}
              </span>
              <!-- Holographic 3D Tag -->
              <div class="holo-3d-tag">
                <span>🌐 3D Spatial Tour</span>
              </div>
            </div>

            <div class="card-body p-4 d-flex flex-column flex-grow-1">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="badge bg-dark bg-opacity-75 text-light border border-secondary" *ngIf="item.city">
                  📍 {{ item.city.name }}
                </span>
                <span class="badge bg-dark bg-opacity-75 text-light border border-secondary" *ngIf="item.fromCity && item.toCity">
                  {{ item.fromCity.name }} &rarr; {{ item.toCity.name }}
                </span>
                <span class="text-success fw-bold" *ngIf="item.pricePerNight || item.avgPrice || item.price">
                  PKR {{ (item.pricePerNight || item.avgPrice || item.price) | number }}
                </span>
              </div>

              <h5 class="card-title fw-bold text-white mb-2">{{ item.name || item.operator }}</h5>
              <p class="card-text text-secondary small flex-grow-1 mb-3" *ngIf="item.description || item.address || item.schedule">
                {{ item.description || item.address || item.schedule }}
              </p>

              <div class="mt-auto pt-3 border-top border-secondary border-opacity-25 d-flex justify-content-between align-items-center">
                <small class="text-secondary text-capitalize">{{ item.type || item.cuisine || item.mode || 'Standard' }}</small>
                <a [routerLink]="['/catalog', item.categoryType, getItemId(item)]" class="btn btn-sm btn-primary">
                  View 3D Tour &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Overhauled Gorgeous Cyber Empty State (Task 5) -->
      <div *ngIf="!loading && flatResults.length === 0" class="glass-panel text-center py-5 p-4 my-4 search-empty-box">
        <div class="search-empty-icon-wrapper mb-3">
          <div class="empty-pulse-ring"></div>
          <span class="search-empty-icon">🛰️</span>
        </div>
        <h4 class="fw-bold text-white mb-2">Zero Matching Signals Detected</h4>
        <p class="text-secondary small mx-auto mb-4" style="max-width: 480px;">
          No destinations or services align with your active parameters. Try expanding your budget range, resetting minimum rating, or selecting all cities.
        </p>
        <div class="d-flex justify-content-center gap-2">
          <button class="btn btn-primary btn-sm px-4 fw-bold" (click)="onReset()">
            🔄 Reset All Filters
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-empty-box {
      border: 1px solid rgba(0, 242, 254, 0.25) !important;
      box-shadow: 0 15px 45px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 242, 254, 0.15) !important;
    }

    .search-empty-icon-wrapper {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 90px;
      height: 90px;
      margin: 0 auto;
    }

    .search-empty-icon {
      font-size: 3rem;
      z-index: 2;
      animation: floatSlow 3s ease-in-out infinite;
    }

    .empty-pulse-ring {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0, 242, 254, 0.25) 0%, transparent 70%);
      animation: pulseRadar 2s infinite ease-out;
      border: 1px solid rgba(0, 242, 254, 0.5);
    }

    @keyframes pulseRadar {
      0% { transform: scale(0.8); opacity: 0.8; }
      100% { transform: scale(1.6); opacity: 0; }
    }

    @keyframes floatSlow {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
  `]
})
export class SearchPageComponent implements OnInit {
  cities: City[] = [];
  loading = false;

  searchParams: {
    keyword: string | null;
    cityId: number | null;
    type: string;
    maxPrice: number | null;
    minRating: number | null;
  } = {
    keyword: null,
    cityId: null,
    type: '',
    maxPrice: null,
    minRating: null
  };

  flatResults: SearchResultItem[] = [];
  defaultImage = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80';

  constructor(private apiService: ApiService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.apiService.getCities().subscribe({
      next: (c) => (this.cities = c),
      error: () => {}
    });

    this.route.queryParams.subscribe((q) => {
      if (q['keyword']) this.searchParams.keyword = q['keyword'];
      if (q['cityId']) this.searchParams.cityId = +q['cityId'];
      if (q['type']) this.searchParams.type = q['type'];
      this.onSearch();
    });
  }

  onSearch(): void {
    this.loading = true;
    this.apiService
      .searchCatalog({
        keyword: this.searchParams.keyword || null,
        cityId: this.searchParams.cityId || null,
        type: this.searchParams.type || null,
        maxPrice: this.searchParams.maxPrice || null,
        minRating: this.searchParams.minRating || null
      })
      .subscribe({
        next: (data) => {
          this.loading = false;
          const aggregated: SearchResultItem[] = [];

          if (data['spots']) {
            data['spots'].forEach((s) => aggregated.push({ ...s, categoryType: 'spots' }));
          }
          if (data['hotels']) {
            data['hotels'].forEach((h) => aggregated.push({ ...h, categoryType: 'hotels' }));
          }
          if (data['resorts']) {
            data['resorts'].forEach((r) => aggregated.push({ ...r, categoryType: 'resorts' }));
          }
          if (data['restaurants']) {
            data['restaurants'].forEach((res) => aggregated.push({ ...res, categoryType: 'restaurants' }));
          }
          if (data['transports']) {
            data['transports'].forEach((t) => aggregated.push({ ...t, categoryType: 'transports' }));
          }

          this.flatResults = aggregated;
        },
        error: () => {
          this.loading = false;
          this.flatResults = [];
        }
      });
  }

  onReset(): void {
    this.searchParams = {
      keyword: null,
      cityId: null,
      type: '',
      maxPrice: null,
      minRating: null
    };
    this.onSearch();
  }

  getItemId(item: CatalogItem): number {
    return item.spotId || item.hotelId || item.resortId || item.restaurantId || item.transportId || 1;
  }
}
