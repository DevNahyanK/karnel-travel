import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface City {
  cityId: number;
  name: string;
  region: string;
}

export interface CatalogItem {
  spotId?: number;
  hotelId?: number;
  resortId?: number;
  restaurantId?: number;
  transportId?: number;
  cityId?: number;
  fromCityId?: number;
  toCityId?: number;
  name?: string;
  mode?: string;
  operator?: string;
  address?: string;
  description?: string;
  type?: string;
  cuisine?: string;
  bestSeason?: string;
  pricePerNight?: number;
  avgPrice?: number;
  price?: number;
  rating?: number;
  starRating?: number;
  roomsAvailable?: number;
  seatsAvailable?: number;
  amenities?: string;
  activities?: string;
  timings?: string;
  schedule?: string;
  image?: string;
  model3d?: string;
  isActive?: boolean;
  city?: City;
  fromCity?: City;
  toCity?: City;
}

export interface Booking {
  bookingId: number;
  referenceNo: string;
  userId: number;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  itemType: string;
  itemId: number;
  startDate: string;
  endDate: string;
  quantity: number;
  totalPrice: number;
  status: string;
  adminRemark?: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCities(): Observable<City[]> {
    return this.http.get<City[]>(`${this.baseUrl}/catalog/cities`);
  }

  getCatalog(type: string): Observable<CatalogItem[]> {
    const cleanType = (type || 'hotels').toLowerCase().trim();
    return this.http.get<CatalogItem[]>(`${this.baseUrl}/catalog/${cleanType}`);
  }

  getCatalogItem(type: string, id: number): Observable<CatalogItem> {
    const cleanType = (type || 'hotels').toLowerCase().trim();
    return this.http.get<CatalogItem>(`${this.baseUrl}/catalog/${cleanType}/${id}`);
  }

  searchCatalog(params: {
    cityId?: number | null;
    type?: string | null;
    minPrice?: number | null;
    maxPrice?: number | null;
    minRating?: number | null;
    keyword?: string | null;
  }): Observable<{ [key: string]: CatalogItem[] }> {
    let httpParams = new HttpParams();
    if (params.cityId) httpParams = httpParams.set('cityId', params.cityId.toString());
    if (params.type) httpParams = httpParams.set('type', params.type);
    if (params.minPrice) httpParams = httpParams.set('minPrice', params.minPrice.toString());
    if (params.maxPrice) httpParams = httpParams.set('maxPrice', params.maxPrice.toString());
    if (params.minRating) httpParams = httpParams.set('minRating', params.minRating.toString());
    if (params.keyword) httpParams = httpParams.set('keyword', params.keyword);

    return this.http.get<{ [key: string]: CatalogItem[] }>(`${this.baseUrl}/catalog/search`, { params: httpParams });
  }

  createBooking(data: {
    itemType: string;
    itemId: number;
    startDate: string;
    endDate: string;
    quantity: number;
  }): Observable<Booking> {
    return this.http.post<Booking>(`${this.baseUrl}/bookings`, data);
  }

  getMyBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/bookings/my-bookings`);
  }

  cancelBooking(id: number): Observable<{ message: string; booking: Booking }> {
    return this.http.put<{ message: string; booking: Booking }>(`${this.baseUrl}/bookings/${id}/cancel`, {});
  }

  // Admin Management Endpoints
  getAllBookingsAdmin(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/admin/bookings`);
  }

  updateBookingStatus(id: number, status: string, adminRemark?: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/bookings/${id}/status`, { status, adminRemark });
  }

  toggleCatalogActive(type: string, id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/catalog/${type}/${id}/toggle-active`, {});
  }
}
