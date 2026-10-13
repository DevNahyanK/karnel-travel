import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService, Booking, CatalogItem } from '../../services/api.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container my-5">
      <!-- Cyber Dashboard Header -->
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <span class="badge bg-danger-subtle text-danger text-uppercase px-3 py-1 mb-2 border border-danger border-opacity-50">
            🛡️ Systems Control &bull; Tier 1 Admin
          </span>
          <h2 class="fw-bold mb-1 text-white">
            System <span class="gradient-purple-title">Management Console</span>
          </h2>
          <p class="text-secondary small mb-0">Oversee customer reservations, dispatch booking workflows, and toggle active catalog listings</p>
        </div>
        <button class="btn btn-outline-light btn-sm" (click)="refreshAll()">
          🔄 Sync Realtime Data
        </button>
      </div>

      <!-- Notification Alert -->
      <div *ngIf="message" class="alert alert-info alert-dismissible fade show shadow-lg" role="alert">
        {{ message }}
        <button type="button" class="btn-close btn-close-white" (click)="message = ''"></button>
      </div>

      <!-- Navigation Tabs -->
      <ul class="nav nav-pills mb-4 gap-2">
        <li class="nav-item">
          <button
            class="nav-link cyber-tab-btn"
            [class.active]="activeTab === 'bookings'"
            (click)="activeTab = 'bookings'"
          >
            📋 Reservations Manager ({{ bookings.length }})
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link cyber-tab-btn"
            [class.active]="activeTab === 'catalog'"
            (click)="activeTab = 'catalog'"
          >
            🗂️ Catalog Items Manager
          </button>
        </li>
      </ul>

      <!-- Tab 1: Bookings Management -->
      <div *ngIf="activeTab === 'bookings'">
        <div class="glass-card overflow-hidden">
          <div class="p-3 border-bottom border-secondary border-opacity-25 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h5 class="fw-bold mb-0 text-white">All System Reservations</h5>
            <small class="text-secondary">Inventory decrements automatically upon confirmation</small>
          </div>

          <div class="table-responsive">
            <table class="table align-middle mb-0">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Customer</th>
                  <th>Item Details</th>
                  <th>Travel Dates</th>
                  <th>Qty</th>
                  <th>Total Price</th>
                  <th>Status</th>
                  <th>Remark</th>
                  <th class="text-end">Workflow Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let b of bookings">
                  <td>
                    <span class="fw-bold text-cyan-glow font-monospace">{{ b.referenceNo }}</span>
                    <small class="d-block text-secondary">{{ b.createdAt | date:'shortDate' }}</small>
                  </td>
                  <td>
                    <strong class="text-light">{{ b.userName || 'Customer #' + b.userId }}</strong>
                    <small class="d-block text-secondary">{{ b.userEmail || '-' }}</small>
                    <small class="d-block text-secondary">{{ b.userPhone || '' }}</small>
                  </td>
                  <td>
                    <span class="badge bg-primary-subtle text-capitalize">{{ b.itemType }}</span>
                    <small class="d-block text-secondary">ID: {{ b.itemId }}</small>
                  </td>
                  <td>
                    <small class="text-light">
                      {{ b.startDate | date:'mediumDate' }}<br />
                      &rarr; {{ b.endDate | date:'mediumDate' }}
                    </small>
                  </td>
                  <td class="text-light">{{ b.quantity }}</td>
                  <td>
                    <span class="fw-bold text-success">PKR {{ b.totalPrice | number }}</span>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="getStatusBadge(b.status)">
                      {{ b.status }}
                    </span>
                  </td>
                  <td>
                    <small class="text-secondary">{{ b.adminRemark || '-' }}</small>
                  </td>
                  <td class="text-end">
                    <div class="btn-group btn-group-sm" *ngIf="b.status === 'Pending'">
                      <button
                        class="btn btn-sm btn-outline-success"
                        (click)="updateStatus(b.bookingId, 'Confirmed')"
                        [disabled]="updatingBookingId === b.bookingId"
                      >
                        ✓ Confirm
                      </button>
                      <button
                        class="btn btn-sm btn-outline-danger"
                        (click)="updateStatus(b.bookingId, 'Rejected')"
                        [disabled]="updatingBookingId === b.bookingId"
                      >
                        ✗ Reject
                      </button>
                    </div>
                    <span *ngIf="b.status !== 'Pending'" class="text-secondary small">Completed</span>
                  </td>
                </tr>
                <tr *ngIf="bookings.length === 0">
                  <td colspan="9" class="text-center py-4 text-secondary">No reservations found in the system database.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Tab 2: Catalog Items Quick Manager -->
      <div *ngIf="activeTab === 'catalog'">
        <div class="glass-card overflow-hidden">
          <div class="p-3 border-bottom border-secondary border-opacity-25 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h5 class="fw-bold mb-0 text-white">Catalog Availability & State Control</h5>
              <small class="text-secondary">Deactivated items are hidden from public catalog and search</small>
            </div>
            <!-- Category Selector Buttons -->
            <div class="btn-group btn-group-sm">
              <button
                *ngFor="let cat of categories"
                class="btn text-capitalize"
                [class.btn-primary]="selectedCategory === cat"
                [class.btn-outline-primary]="selectedCategory !== cat"
                (click)="selectCategory(cat)"
              >
                {{ cat }}
              </button>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table align-middle mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Image</th>
                  <th>Name / Title</th>
                  <th>City / Route</th>
                  <th>Pricing & Rating</th>
                  <th>Availability</th>
                  <th>Live Status</th>
                  <th class="text-end">Toggle Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of catalogItems">
                  <td class="text-secondary">#{{ getItemId(item) }}</td>
                  <td>
                    <img
                      [src]="item.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'"
                      class="rounded-3 shadow-sm"
                      style="width: 52px; height: 42px; object-fit: cover;"
                      [alt]="item.name || item.operator"
                    />
                  </td>
                  <td>
                    <strong class="text-white">{{ item.name || item.operator }}</strong>
                    <small class="d-block text-secondary text-capitalize">{{ item.type || item.cuisine || item.mode }}</small>
                  </td>
                  <td>
                    <span *ngIf="item.city" class="text-light">📍 {{ item.city.name }}</span>
                    <span *ngIf="item.fromCity && item.toCity" class="text-light">
                      {{ item.fromCity.name }} &rarr; {{ item.toCity.name }}
                    </span>
                  </td>
                  <td>
                    <span class="text-success fw-bold" *ngIf="item.pricePerNight || item.avgPrice || item.price">
                      PKR {{ (item.pricePerNight || item.avgPrice || item.price) | number }}
                    </span>
                    <span class="badge-rating ms-2" *ngIf="item.starRating || item.rating">
                      ★ {{ item.starRating || item.rating }}
                    </span>
                  </td>
                  <td>
                    <span *ngIf="item.roomsAvailable !== undefined" class="text-light">{{ item.roomsAvailable }} Rooms</span>
                    <span *ngIf="item.seatsAvailable !== undefined" class="text-light">{{ item.seatsAvailable }} Seats</span>
                    <span *ngIf="item.roomsAvailable === undefined && item.seatsAvailable === undefined" class="text-secondary">-</span>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="item.isActive ? 'bg-success-subtle' : 'bg-secondary-subtle'">
                      {{ item.isActive ? 'Active' : 'Inactive (Hidden)' }}
                    </span>
                  </td>
                  <td class="text-end">
                    <button
                      class="btn btn-sm"
                      [ngClass]="item.isActive ? 'btn-outline-danger' : 'btn-outline-success'"
                      (click)="toggleActive(item)"
                    >
                      {{ item.isActive ? 'Deactivate' : 'Activate' }}
                    </button>
                  </td>
                </tr>
                <tr *ngIf="catalogItems.length === 0">
                  <td colspan="8" class="text-center py-4 text-secondary">No items found in this category.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cyber-tab-btn {
      background: rgba(255, 255, 255, 0.04);
      color: #94a3b8;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 999px;
      font-weight: 600;
      padding: 0.5rem 1.25rem;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .cyber-tab-btn:hover {
      color: #ffffff;
      border-color: rgba(0, 242, 254, 0.4);
    }
    .cyber-tab-btn.active {
      background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%) !important;
      color: #ffffff !important;
      border-color: transparent !important;
      box-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  activeTab: 'bookings' | 'catalog' = 'bookings';
  bookings: Booking[] = [];
  catalogItems: CatalogItem[] = [];

  categories = ['spots', 'hotels', 'resorts', 'restaurants', 'transports'];
  selectedCategory = 'hotels';

  message = '';
  updatingBookingId: number | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.refreshAll();
  }

  refreshAll(): void {
    this.loadBookings();
    this.loadCatalogItems();
  }

  loadBookings(): void {
    this.apiService.getAllBookingsAdmin().subscribe({
      next: (data) => (this.bookings = data),
      error: () => (this.message = 'Failed to load administrative bookings.')
    });
  }

  selectCategory(cat: string): void {
    this.selectedCategory = cat;
    this.loadCatalogItems();
  }

  loadCatalogItems(): void {
    this.apiService.getCatalog(this.selectedCategory).subscribe({
      next: (data) => (this.catalogItems = data),
      error: () => (this.catalogItems = [])
    });
  }

  updateStatus(id: number, status: 'Confirmed' | 'Rejected'): void {
    const remark = prompt(`Optional remark for ${status} status:`, `${status} by admin`) || undefined;
    this.updatingBookingId = id;

    this.apiService.updateBookingStatus(id, status, remark).subscribe({
      next: (res) => {
        this.updatingBookingId = null;
        this.message = res.message || `Booking #${id} updated to ${status}.`;
        this.loadBookings();
      },
      error: (err) => {
        this.updatingBookingId = null;
        this.message = err.error?.message || `Failed to update booking status.`;
      }
    });
  }

  toggleActive(item: CatalogItem): void {
    const id = this.getItemId(item);
    this.apiService.toggleCatalogActive(this.selectedCategory, id).subscribe({
      next: (res) => {
        this.message = res.message || `Status toggled successfully.`;
        item.isActive = !item.isActive;
      },
      error: (err) => {
        this.message = err.error?.message || `Failed to toggle active status.`;
      }
    });
  }

  getItemId(item: CatalogItem): number {
    return item.spotId || item.hotelId || item.resortId || item.restaurantId || item.transportId || 1;
  }

  getStatusBadge(status: string): string {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-success-subtle';
      case 'pending':
        return 'badge-rating';
      case 'rejected':
      case 'cancelled':
        return 'bg-danger-subtle';
      default:
        return 'bg-secondary-subtle';
    }
  }
}
