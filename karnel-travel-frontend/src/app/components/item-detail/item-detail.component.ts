import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService, CatalogItem } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-item-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="container my-5 animate-fade-in">
      <!-- Breadcrumb Navigation -->
      <nav aria-label="breadcrumb" class="mb-4">
        <ol class="breadcrumb cyber-breadcrumb">
          <li class="breadcrumb-item"><a routerLink="/" class="text-decoration-none">Home</a></li>
          <li class="breadcrumb-item"><a [routerLink]="['/catalog', itemType]" class="text-decoration-none text-capitalize">{{ itemType }}</a></li>
          <li class="breadcrumb-item active text-cyan-glow" aria-current="page">{{ item?.name || 'Item Detail' }}</li>
        </ol>
      </nav>

      <div *ngIf="item; else loadingBlock" class="row g-5">
        <!-- Left Column: Media & 3D Interactive Model Viewer / Holographic Tilt Experience -->
        <div class="col-lg-7 animate-slide-left">
          <div class="glass-card p-4 mb-4">
            <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <div>
                <span class="badge bg-primary-subtle mb-1">Spatial Engine v2.5</span>
                <h5 class="fw-bold mb-0 text-white d-flex align-items-center">
                  <span class="fs-4 me-2">🌐</span> Interactive 3D Spatial Experience
                </h5>
                <small class="text-secondary">
                  {{ (hasDedicated3DModel || hasCategory3DModel) ? 'Photographic depth parallax & category-aligned WebGL spatial viewing' : 'Authentic photographic 3D perspective depth simulation' }}
                </small>
              </div>

              <!-- Dynamic View Mode Switcher -->
              <div *ngIf="hasDedicated3DModel || hasCategory3DModel" class="btn-group btn-group-sm cyber-mode-switcher">
                <button
                  class="btn"
                  [class.btn-primary]="viewMode === '3d-tilt'"
                  [class.btn-outline-primary]="viewMode !== '3d-tilt'"
                  (click)="setViewMode('3d-tilt')"
                >
                  📷 3D Photo Depth
                </button>
                <button
                  class="btn"
                  [class.btn-primary]="viewMode === '3d-model' && !modelFailed"
                  [class.btn-outline-primary]="viewMode !== '3d-model' || modelFailed"
                  (click)="setViewMode('3d-model')"
                  [disabled]="modelFailed"
                >
                  {{ hasDedicated3DModel ? 'Custom 3D Asset' : 'Category Spatial Mesh' }}
                </button>
              </div>

              <!-- When skipping 3D mesh (e.g. Restaurants or unmodeled entries) -->
              <div *ngIf="!hasDedicated3DModel && !hasCategory3DModel" class="badge bg-primary-subtle text-cyan-glow px-3 py-2 d-flex align-items-center gap-1">
                <span>✨ Photographic Realism Active</span>
              </div>
            </div>

            <!-- Mode A: Category-Specific or Dedicated @google/model-viewer (NO Astronauts) -->
            <div
              *ngIf="viewMode === '3d-model' && !modelFailed && modelSrc"
              class="position-relative rounded-4 overflow-hidden border border-secondary border-opacity-25 shadow-lg"
            >
              <model-viewer
                [src]="modelSrc"
                alt="Category Spatial Model"
                auto-rotate
                camera-controls
                ar
                shadow-intensity="1.5"
                [poster]="item.image || defaultImage"
                (error)="onModelError()"
                style="width: 100%; height: 460px; background: radial-gradient(circle at center, #1e293b 0%, #080a14 100%);"
              >
                <div class="position-absolute bottom-0 start-0 m-3 badge cyber-control-tip p-2 shadow-sm">
                  👆 Drag to rotate 360° &bull; Pinch to zoom &bull; AR Spatial enabled
                </div>
              </model-viewer>
            </div>

            <!-- Mode B: Holographic 3D Tilt Experience with Realistic Parallax (Default for all real venues) -->
            <div
              *ngIf="viewMode === '3d-tilt' || modelFailed || !modelSrc"
              class="perspective-container position-relative py-2"
            >
              <div
                class="tilt-card border-0 overflow-hidden text-white"
                (mousemove)="onTiltMouseMove($event)"
                (mouseleave)="onTiltMouseLeave()"
                [style.transform]="tiltTransform"
              >
                <img
                  [src]="item.image || defaultImage"
                  class="card-img"
                  [alt]="item.name"
                  style="height: 460px; object-fit: cover; filter: brightness(0.85);"
                />

                <!-- Holographic Glare Shimmer Overlay -->
                <div class="holo-glare-layer" [style.transform]="glareTransform"></div>

                <div class="card-img-overlay d-flex flex-column justify-content-between p-4 bg-gradient-dark">
                  <div class="d-flex justify-content-between align-items-start">
                    <span class="badge-rating shadow-sm">
                      {{ tiltBadgeLabel }}
                    </span>
                    <span class="badge bg-dark bg-opacity-75 text-light border border-secondary" *ngIf="item.city">
                      📍 {{ item.city.name }}
                    </span>
                  </div>

                  <div class="glass-caption p-3 rounded-4">
                    <h4 class="fw-bold mb-1 text-white">{{ item.name || item.operator }}</h4>
                    <p class="small text-light mb-0" style="opacity: 0.9;">
                      {{ tiltDescription }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Notice for Restaurants or Fallback Switch -->
              <div *ngIf="itemType === 'restaurants'" class="alert alert-info py-2 small mt-3 mb-0">
                🍽️ Standard 3D generic meshes bypassed to preserve authentic gourmet photo ambiance and venue realism.
              </div>

              <div *ngIf="modelFailed" class="alert alert-warning py-2 small mt-3 mb-0">
                ℹ️ Category 3D spatial asset was unavailable; automatically engaged high-fidelity Holographic 3D Photo Depth.
              </div>
            </div>

            <!-- Status Indicator Footer -->
            <div class="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-secondary border-opacity-25">
              <small class="text-secondary d-flex align-items-center gap-1">
                <span class="dot-green"></span> Hardware Accelerated: WebGL / CSS 3D Perspective Shader Engine
              </small>
              <span class="badge bg-success-subtle">
                3D Ready
              </span>
            </div>
          </div>
        </div>

        <!-- Right Column: Details & Booking Action Card -->
        <div class="col-lg-5 animate-slide-right">
          <div class="glass-card p-4 sticky-top" style="top: 90px;">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <span class="badge bg-primary-subtle text-capitalize fw-semibold px-3 py-2">
                {{ itemType }} Sector
              </span>
              <span class="badge-rating" *ngIf="item.starRating || item.rating">
                ★ {{ item.starRating || item.rating }} Stars
              </span>
            </div>

            <h2 class="fw-bold mb-2 text-white">{{ item.name || item.operator }}</h2>
            <p class="text-secondary mb-3" *ngIf="item.city">
              📍 <strong class="text-light">{{ item.city.name }}</strong>, {{ item.city.region }}
            </p>
            <p class="text-secondary mb-3" *ngIf="item.fromCity && item.toCity">
              🛫 Route: <strong class="text-cyan-glow">{{ item.fromCity.name }}</strong> &rarr; <strong class="text-cyan-glow">{{ item.toCity.name }}</strong>
            </p>

            <!-- Price Highlight Card -->
            <div class="glass-panel p-3 mb-4" *ngIf="item.pricePerNight || item.avgPrice || item.price">
              <span class="text-secondary small d-block mb-1">Standard Rate</span>
              <h3 class="text-success fw-bold mb-0">
                PKR {{ (item.pricePerNight || item.avgPrice || item.price) | number }}
                <small class="text-secondary fs-6 fw-normal" *ngIf="item.pricePerNight">/ night</small>
                <small class="text-secondary fs-6 fw-normal" *ngIf="item.avgPrice">/ avg dining</small>
                <small class="text-secondary fs-6 fw-normal" *ngIf="item.price">/ seat</small>
              </h3>
            </div>

            <!-- Description & Amenities List -->
            <p class="text-secondary mb-3" *ngIf="item.description">{{ item.description }}</p>
            <p class="text-secondary mb-2" *ngIf="item.address"><strong class="text-light">Address:</strong> {{ item.address }}</p>
            <p class="text-secondary mb-2" *ngIf="item.amenities"><strong class="text-light">Amenities:</strong> {{ item.amenities }}</p>
            <p class="text-secondary mb-2" *ngIf="item.activities"><strong class="text-light">Activities:</strong> {{ item.activities }}</p>
            <p class="text-secondary mb-2" *ngIf="item.cuisine"><strong class="text-light">Cuisine:</strong> {{ item.cuisine }}</p>
            <p class="text-secondary mb-2" *ngIf="item.timings"><strong class="text-light">Timings:</strong> {{ item.timings }}</p>
            <p class="text-secondary mb-2" *ngIf="item.schedule"><strong class="text-light">Schedule:</strong> {{ item.schedule }}</p>

            <div class="mb-4 mt-3" *ngIf="item.roomsAvailable !== undefined || item.seatsAvailable !== undefined">
              <span class="badge" [ngClass]="((item.roomsAvailable || item.seatsAvailable || 0) > 0) ? 'bg-success-subtle' : 'bg-danger-subtle'">
                {{ (item.roomsAvailable !== undefined ? item.roomsAvailable + ' Rooms Remaining' : item.seatsAvailable + ' Seats Remaining') }}
              </span>
            </div>

            <!-- Booking Button -->
            <button
              *ngIf="isBookableType()"
              class="btn btn-primary btn-lg w-100 fw-bold shadow-lg cyber-book-btn"
              (click)="openBookingModal()"
            >
              📅 Reserve Now with 3D Guarantee
            </button>
            <div *ngIf="!isBookableType()" class="alert alert-info py-2 small mb-0">
              ℹ️ Attractions and gourmet restaurants welcome walk-in visitors anytime during open hours.
            </div>
          </div>
        </div>
      </div>

      <ng-template #loadingBlock>
        <div class="glass-panel text-center py-5">
          <div class="spinner-border text-info me-2" role="status"></div>
          <span class="text-light">Retrieving spatial item metadata...</span>
        </div>
      </ng-template>

      <!-- Ultra-Premium Glassmorphic Neon Modal with Blur-In Filter -->
      <div class="cyber-modal-overlay" *ngIf="showBookingModal" (click)="closeBookingModal()">
        <div class="modal-dialog modal-dialog-centered" (click)="$event.stopPropagation()">
          <div class="modal-content cyber-modal-card p-4">
            <div class="modal-header border-0 pb-0 d-flex justify-content-between align-items-center">
              <div>
                <span class="badge bg-primary-subtle mb-1">Instant Reservation</span>
                <h4 class="modal-title fw-bold text-white">Book {{ item?.name || item?.operator }}</h4>
              </div>
              <button type="button" class="btn-close btn-close-white" (click)="closeBookingModal()"></button>
            </div>

            <div class="modal-body p-3 mt-2">
              <div *ngIf="bookingSuccess" class="alert alert-success">
                🎉 <strong>Reservation Successful!</strong><br />
                Reference Number: <code class="text-white">{{ bookingSuccess.referenceNo }}</code><br />
                Total Price: <strong>PKR {{ bookingSuccess.totalPrice | number }}</strong>
              </div>

              <div *ngIf="bookingError" class="alert alert-danger">
                {{ bookingError }}
              </div>

              <form *ngIf="!bookingSuccess" (ngSubmit)="submitBooking()">
                <div class="mb-3">
                  <label class="form-label small fw-semibold text-light">Check-in / Start Date</label>
                  <input type="date" class="form-control" [(ngModel)]="bookingData.startDate" name="startDate" required />
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-semibold text-light">Check-out / End Date</label>
                  <input type="date" class="form-control" [(ngModel)]="bookingData.endDate" name="endDate" required />
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-semibold text-light">
                    Quantity ({{ itemType === 'transports' ? 'Seats' : 'Rooms' }})
                  </label>
                  <input type="number" class="form-control" min="1" max="10" [(ngModel)]="bookingData.quantity" name="quantity" required />
                </div>

                <div class="d-flex justify-content-end gap-2 mt-4">
                  <button type="button" class="btn btn-outline-light" (click)="closeBookingModal()">Cancel</button>
                  <button type="submit" class="btn btn-primary fw-bold" [disabled]="isSubmitting">
                    {{ isSubmitting ? 'Confirming...' : 'Lock Reservation' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Animations */
    .animate-fade-in {
      animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .animate-slide-left {
      animation: slideLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .animate-slide-right {
      animation: slideRight 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideLeft {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideRight {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }

    /* Cyber Breadcrumb */
    .cyber-breadcrumb a {
      color: #94a3b8;
      transition: color 0.2s ease;
    }
    .cyber-breadcrumb a:hover {
      color: #00f2fe;
    }
    .cyber-breadcrumb .breadcrumb-item + .breadcrumb-item::before {
      color: #475569;
    }

    /* 3D Perspective Tilt Card Container */
    .perspective-container {
      perspective: 1200px;
    }
    .tilt-card {
      border-radius: 1.25rem;
      transform-style: preserve-3d;
      transition: transform 0.15s ease-out, box-shadow 0.3s ease;
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5);
      cursor: crosshair;
      position: relative;
    }
    .tilt-card:hover {
      box-shadow: 0 25px 60px rgba(0, 242, 254, 0.25), 0 0 30px rgba(168, 85, 247, 0.2);
    }

    /* Holographic Glare Layer */
    .holo-glare-layer {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.15) 0%, transparent 60%);
      pointer-events: none;
      transition: transform 0.15s ease-out;
      z-index: 2;
    }

    .glass-caption {
      background: rgba(11, 15, 25, 0.85);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 1px solid rgba(0, 242, 254, 0.25);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.6);
    }

    .cyber-control-tip {
      background: rgba(11, 15, 25, 0.88);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(0, 242, 254, 0.3);
      color: #e2e8f0;
      border-radius: 8px;
    }

    .dot-green {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10b981;
      display: inline-block;
      box-shadow: 0 0 8px #10b981;
    }

    .cyber-book-btn {
      padding: 0.85rem 1.5rem;
      letter-spacing: 0.02em;
    }

    /* Cyber Modal Overlay with Blur-In & Neon Pulse */
    .cyber-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(5, 7, 15, 0.85);
      backdrop-filter: blur(18px) saturate(200%);
      -webkit-backdrop-filter: blur(18px) saturate(200%);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      animation: modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .cyber-modal-card {
      border: 1px solid rgba(0, 242, 254, 0.4) !important;
      box-shadow: 0 0 50px rgba(0, 242, 254, 0.2), 0 25px 60px rgba(0, 0, 0, 0.8) !important;
      animation: modalScaleUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes modalFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes modalScaleUp {
      from { transform: scale(0.92) translateY(20px); opacity: 0; }
      to { transform: scale(1) translateY(0); opacity: 1; }
    }
  `]
})
export class ItemDetailComponent implements OnInit {
  itemType: string = 'hotels';
  itemId: number = 0;
  item: CatalogItem | null = null;

  defaultImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';

  // Category-aligned standard models (Strictly NO generic astronauts or flight helmets)
  readonly CATEGORY_SPATIAL_MODELS: Record<string, string> = {
    spots: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Lantern/glTF-Binary/Lantern.glb',
    touristspots: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Lantern/glTF-Binary/Lantern.glb',
    hotels: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BoxInterleaved/glTF-Binary/BoxInterleaved.glb',
    resorts: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BoxInterleaved/glTF-Binary/BoxInterleaved.glb',
    transports: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/CesiumMilkTruck/glTF-Binary/CesiumMilkTruck.glb'
  };

  modelSrc = '';
  hasDedicated3DModel = false;
  hasCategory3DModel = false;
  viewMode: '3d-model' | '3d-tilt' = '3d-tilt';
  modelFailed = false;

  tiltBadgeLabel = 'Holographic 3D Tilt';
  tiltDescription = 'Interactive perspective depth simulator.';

  tiltTransform = 'rotateX(0deg) rotateY(0deg) scale(1)';
  glareTransform = 'translate(0, 0)';

  showBookingModal = false;
  isSubmitting = false;
  bookingSuccess: any = null;
  bookingError: string | null = null;

  bookingData = {
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    quantity: 1
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.itemType = (params['type'] || 'hotels').toLowerCase().trim();
      this.itemId = +params['id'];
      this.loadItem();
    });
  }

  loadItem(): void {
    this.apiService.getCatalogItem(this.itemType, this.itemId).subscribe({
      next: (data) => {
        this.item = data;
        this.setup3DExperience();
      },
      error: () => console.error('Failed to load item')
    });
  }

  setup3DExperience(): void {
    const rawType = (this.itemType || 'hotels').toLowerCase().trim();
    const customModel = this.item?.model3d?.trim();

    // 1. Verify if item has a custom .glb/.gltf (Never generic astronaut or flight helmet)
    if (
      customModel &&
      (customModel.endsWith('.glb') || customModel.endsWith('.gltf')) &&
      !customModel.toLowerCase().includes('astronaut') &&
      !customModel.toLowerCase().includes('flight-helmet')
    ) {
      this.hasDedicated3DModel = true;
      this.hasCategory3DModel = false;
      this.modelSrc = customModel;
      this.viewMode = '3d-model';
      this.tiltBadgeLabel = 'Custom 3D Spatial Tour';
      this.tiltDescription = 'Interactive spatial tour with hardware-accelerated 3D model.';
      return;
    }

    // 2. If NO custom .glb path: Bypass astronaut entirely and route by category
    this.hasDedicated3DModel = false;

    if (rawType === 'restaurants' || rawType === 'restaurant') {
      // Restaurants: Instantly collapse to beautiful 3D tilt preview mode of their real dining environment
      this.hasCategory3DModel = false;
      this.modelSrc = '';
      this.viewMode = '3d-tilt';
      this.tiltBadgeLabel = '🍽️ 3D Dining Ambience Parallax';
      this.tiltDescription = 'Authentic 3D perspective parallax of this dining venue. Move your cursor to experience atmospheric room depth.';
    } else if (rawType === 'hotels' || rawType === 'hotel' || rawType === 'resorts' || rawType === 'resort') {
      // Hotels & Resorts: Default instantly to 360-degree virtual perspective interior cards
      this.modelSrc = this.CATEGORY_SPATIAL_MODELS[rawType] || '';
      this.hasCategory3DModel = !!this.modelSrc;
      this.viewMode = '3d-tilt'; // Default instantly to 360 virtual perspective
      this.tiltBadgeLabel = '🏨 360° Interior Perspective Card';
      this.tiltDescription = 'Interactive depth preview of verified accommodations and suites. Experience realistic perspective parallax.';
    } else if (rawType === 'spots' || rawType === 'touristspots' || rawType === 'spot') {
      // Spots: Fall back to natural scenery / location markers / earth visual overlays or interactive Holographic Tilt
      this.modelSrc = this.CATEGORY_SPATIAL_MODELS['spots'] || '';
      this.hasCategory3DModel = !!this.modelSrc;
      this.viewMode = '3d-tilt'; // Default to real photo interactive holographic tilt
      this.tiltBadgeLabel = '🏔️ Scenic Landmark 3D Depth Card';
      this.tiltDescription = 'Holographic perspective preview of this iconic Pakistani landmark. Move your cursor to inspect geographical depth.';
    } else if (rawType === 'transports' || rawType === 'transport') {
      // Transports: Utilize vehicle/route object or transit perspective card
      this.modelSrc = this.CATEGORY_SPATIAL_MODELS['transports'] || '';
      this.hasCategory3DModel = !!this.modelSrc;
      this.viewMode = '3d-tilt';
      this.tiltBadgeLabel = '✈️ Route & Transit 3D Perspective';
      this.tiltDescription = 'Interactive perspective preview of scheduled departure route and travel service.';
    } else {
      this.hasCategory3DModel = false;
      this.modelSrc = '';
      this.viewMode = '3d-tilt';
      this.tiltBadgeLabel = '3D Perspective Photo Card';
      this.tiltDescription = 'Interactive holographic perspective preview.';
    }
  }

  setViewMode(mode: '3d-model' | '3d-tilt'): void {
    this.viewMode = mode;
  }

  onModelError(): void {
    this.modelFailed = true;
    this.viewMode = '3d-tilt';
  }

  onTiltMouseMove(event: MouseEvent): void {
    const card = event.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -14;
    const rotateY = ((x - centerX) / centerX) * 14;

    this.tiltTransform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(1.025)`;
    this.glareTransform = `translate(${(x - centerX) * 0.4}px, ${(y - centerY) * 0.4}px)`;
  }

  onTiltMouseLeave(): void {
    this.tiltTransform = 'rotateX(0deg) rotateY(0deg) scale(1)';
    this.glareTransform = 'translate(0, 0)';
  }

  isBookableType(): boolean {
    const t = this.itemType.toLowerCase();
    return t === 'hotels' || t === 'resorts' || t === 'transports';
  }

  openBookingModal(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.bookingSuccess = null;
    this.bookingError = null;
    this.showBookingModal = true;
  }

  closeBookingModal(): void {
    this.showBookingModal = false;
  }

  submitBooking(): void {
    this.isSubmitting = true;
    this.bookingError = null;

    const normalizedItemType =
      this.itemType === 'hotels' ? 'Hotel' : this.itemType === 'resorts' ? 'Resort' : 'Transport';
    const targetId = this.item?.hotelId || this.item?.resortId || this.item?.transportId || this.itemId;

    this.apiService
      .createBooking({
        itemType: normalizedItemType,
        itemId: targetId,
        startDate: this.bookingData.startDate,
        endDate: this.bookingData.endDate,
        quantity: this.bookingData.quantity
      })
      .subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.bookingSuccess = res;
        },
        error: (err) => {
          this.isSubmitting = false;
          this.bookingError = err.error?.message || 'Failed to submit booking. Check availability or dates.';
        }
      });
  }
}
