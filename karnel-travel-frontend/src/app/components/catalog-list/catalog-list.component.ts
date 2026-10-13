import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService, CatalogItem, City } from '../../services/api.service';

@Component({
  selector: 'app-catalog-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container my-5">
      <!-- Cyber Title & Filter Header Panel -->
      <div class="glass-panel p-4 mb-4">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="badge bg-primary-subtle text-capitalize">{{ currentType }} Catalog</span>
              <span class="small text-secondary" *ngIf="!loading">({{ filteredItems.length }} Available)</span>
            </div>
            <h2 class="fw-bold mb-0 text-white text-capitalize">
              Explore <span class="gradient-title">{{ title }}</span>
            </h2>
            <p class="text-secondary small mb-0 mt-1">Browse, inspect in 3D WebGL spatial view, and reserve securely</p>
          </div>

          <div class="d-flex gap-2 flex-wrap">
            <select class="form-select form-select-sm" style="min-width: 160px;" [(ngModel)]="filterCityId" (change)="applyFilters()">
              <option [ngValue]="null">All Cities</option>
              <option *ngFor="let city of cities" [ngValue]="city.cityId">{{ city.name }}</option>
            </select>
            <div class="position-relative">
              <input
                type="text"
                class="form-control form-control-sm"
                placeholder="Filter keyword..."
                [(ngModel)]="filterKeyword"
                (input)="applyFilters()"
                style="min-width: 180px;"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="glass-panel text-center py-5">
        <div class="spinner-border text-cyan-glow me-2" role="status"></div>
        <span class="text-light fs-5">Loading {{ title }} catalog...</span>
      </div>

      <!-- Item Grid with Glassmorphic Glowing Cards -->
      <div class="row g-4" *ngIf="!loading && filteredItems.length > 0">
        <div class="col-md-6 col-lg-4" *ngFor="let item of filteredItems">
          <div class="glass-card h-100 d-flex flex-column">
            <div class="position-relative overflow-hidden">
              <img
                [src]="item.image || defaultImage"
                class="card-img-top"
                [alt]="item.name || item.operator"
                style="height: 230px; object-fit: cover;"
              />
              <!-- Dynamic Overlay Rating Tag with Active Pulse -->
              <span class="position-absolute top-0 end-0 m-2 badge-rating" *ngIf="item.starRating || item.rating">
                ★ {{ item.starRating || item.rating }}
              </span>
              <!-- Holographic 3D Interactive Tag -->
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
                <span class="badge bg-primary-subtle text-capitalize">
                  {{ item.type || item.cuisine || item.mode || currentType }}
                </span>
                <a [routerLink]="['/catalog', currentType, getItemId(item)]" class="btn btn-sm btn-primary">
                  View 3D Tour &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Overhauled Gorgeous Cyber Glass Empty State (Task 5) -->
      <div *ngIf="!loading && filteredItems.length === 0" class="glass-panel text-center py-5 p-4 my-4 empty-state-box">
        <div class="empty-icon-wrapper mb-3">
          <div class="empty-pulse-ring"></div>
          <span class="empty-icon">🛸</span>
        </div>
        <h4 class="fw-bold text-white mb-2">No Listings Found in This Sector</h4>
        <p class="text-secondary small mx-auto mb-4" style="max-width: 480px;">
          We couldn't detect any active options matching your selected query or city filters.
        </p>
        <div class="d-flex justify-content-center gap-2">
          <button class="btn btn-outline-primary btn-sm px-4 fw-bold" (click)="resetFilters()">
            🔄 Reset Filters
          </button>
          <a routerLink="/" class="btn btn-primary btn-sm px-4 fw-bold">
            Return to Home
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .empty-state-box {
      border: 1px solid rgba(0, 242, 254, 0.25) !important;
      box-shadow: 0 15px 45px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 242, 254, 0.15) !important;
    }

    .empty-icon-wrapper {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 90px;
      height: 90px;
      margin: 0 auto;
    }

    .empty-icon {
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
export class CatalogListComponent implements OnInit {
  currentType = 'hotels';
  title = 'Hotels';
  items: CatalogItem[] = [];
  filteredItems: CatalogItem[] = [];
  cities: City[] = [];

  loading = false;
  filterCityId: number | null = null;
  filterKeyword: string = '';
  defaultImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.apiService.getCities().subscribe({
      next: (c) => (this.cities = c),
      error: () => {}
    });

    this.route.params.subscribe((params) => {
      this.currentType = (params['type'] || 'hotels').toLowerCase().trim();
      this.title = this.currentType === 'spots' ? 'Tourist Spots' : this.currentType;
      this.loadItems();
    });

    this.route.queryParams.subscribe((q) => {
      this.filterKeyword = q['keyword'] ? q['keyword'].trim() : '';
      this.filterCityId = q['cityId'] ? +q['cityId'] : null;
      if (this.items.length > 0) {
        this.applyFilters();
      }
    });
  }

  loadItems(): void {
    this.loading = true;
    this.apiService.getCatalog(this.currentType).subscribe({
      next: (data) => {
        this.loading = false;
        this.items = Array.isArray(data) ? data : [];
        this.applyFilters();
      },
      error: (err) => {
        this.loading = false;
        console.error('Failed to load catalog items:', err);
        this.items = [];
        this.filteredItems = [];
      }
    });
  }

  getItemId(item: CatalogItem): number {
    return item.spotId || item.hotelId || item.resortId || item.restaurantId || item.transportId || 1;
  }

  applyFilters(): void {
    let result = [...this.items];
    if (this.filterCityId) {
      result = result.filter(
        (i) => i.cityId === this.filterCityId || i.fromCityId === this.filterCityId || i.toCityId === this.filterCityId
      );
    }
    if (this.filterKeyword) {
      const kw = this.filterKeyword.toLowerCase();
      result = result.filter(
        (i) =>
          (i.name && i.name.toLowerCase().includes(kw)) ||
          (i.description && i.description.toLowerCase().includes(kw)) ||
          (i.operator && i.operator.toLowerCase().includes(kw)) ||
          (i.address && i.address.toLowerCase().includes(kw))
      );
    }
    this.filteredItems = result;
  }

  resetFilters(): void {
    this.filterCityId = null;
    this.filterKeyword = '';
    this.router.navigate([], { relativeTo: this.route, queryParams: {} });
    this.filteredItems = [...this.items];
  }
}
