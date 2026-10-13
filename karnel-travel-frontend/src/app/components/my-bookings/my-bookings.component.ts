import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService, Booking } from '../../services/api.service';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container my-5">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <span class="badge bg-primary-subtle mb-1">Personal Itinerary</span>
          <h2 class="fw-bold mb-1 text-white">
            My <span class="gradient-title">Bookings & Reservations</span>
          </h2>
          <p class="text-secondary small mb-0">Track confirmation status and manage your travel itineraries</p>
        </div>
        <a routerLink="/" class="btn btn-outline-primary btn-sm px-3">
          Explore More Listings &rarr;
        </a>
      </div>

      <!-- Action Message Notification -->
      <div *ngIf="actionMessage" class="alert alert-info alert-dismissible fade show" role="alert">
        {{ actionMessage }}
        <button type="button" class="btn-close btn-close-white" (click)="actionMessage = ''"></button>
      </div>

      <!-- Bookings Table Glass Card -->
      <div *ngIf="bookings.length > 0; else noBookingsBlock" class="glass-card overflow-hidden">
        <div class="table-responsive">
          <table class="table align-middle mb-0">
            <thead>
              <tr>
                <th scope="col">Reference</th>
                <th scope="col">Category</th>
                <th scope="col">Travel Dates</th>
                <th scope="col">Qty</th>
                <th scope="col">Total Price</th>
                <th scope="col">Status</th>
                <th scope="col">Admin Remark</th>
                <th scope="col" class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let b of bookings">
                <td>
                  <span class="fw-bold text-cyan-glow font-monospace">{{ b.referenceNo }}</span>
                  <small class="d-block text-secondary">{{ b.createdAt | date:'shortDate' }}</small>
                </td>
                <td>
                  <span class="badge bg-primary-subtle text-capitalize">{{ b.itemType }}</span>
                </td>
                <td>
                  <small class="text-light">
                    {{ b.startDate | date:'mediumDate' }} &rarr; {{ b.endDate | date:'mediumDate' }}
                  </small>
                </td>
                <td class="text-light">{{ b.quantity }}</td>
                <td>
                  <span class="fw-bold text-success">PKR {{ b.totalPrice | number }}</span>
                </td>
                <td>
                  <span class="badge" [ngClass]="getStatusBadgeClass(b.status)">
                    {{ b.status }}
                  </span>
                </td>
                <td>
                  <small class="text-secondary">{{ b.adminRemark || '-' }}</small>
                </td>
                <td class="text-end">
                  <button
                    *ngIf="b.status === 'Pending'"
                    (click)="cancel(b.bookingId)"
                    class="btn btn-sm btn-outline-danger"
                  >
                    Cancel
                  </button>
                  <span *ngIf="b.status !== 'Pending'" class="text-secondary small">Locked</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Gorgeous Empty State -->
      <ng-template #noBookingsBlock>
        <div class="glass-panel text-center py-5 p-4 empty-booking-box">
          <div class="empty-icon-wrapper mb-3">
            <div class="empty-pulse-ring"></div>
            <span class="empty-icon">🧳</span>
          </div>
          <h4 class="fw-bold text-white mb-2">No Active Reservations</h4>
          <p class="text-secondary small mx-auto mb-4" style="max-width: 480px;">
            You haven't confirmed any hotel, resort, or transport bookings yet. Browse the catalog and secure your verified spots today.
          </p>
          <div>
            <a routerLink="/catalog/hotels" class="btn btn-primary px-4 fw-bold shadow-lg">Browse Hotels in 3D</a>
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .empty-booking-box {
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
export class MyBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  actionMessage = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.apiService.getMyBookings().subscribe({
      next: (data) => (this.bookings = data),
      error: () => console.error('Failed to load user bookings')
    });
  }

  cancel(id: number): void {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    this.apiService.cancelBooking(id).subscribe({
      next: (res) => {
        this.actionMessage = res.message || 'Booking was cancelled successfully.';
        this.loadBookings();
      },
      error: (err) => {
        this.actionMessage = err.error?.message || 'Failed to cancel booking.';
      }
    });
  }

  getStatusBadgeClass(status: string): string {
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
