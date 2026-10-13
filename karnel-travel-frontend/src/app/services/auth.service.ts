import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserAuthData {
  token: string;
  fullName: string;
  email: string;
  role: string;
  userId: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  private currentUserSubject = new BehaviorSubject<UserAuthData | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  public get currentUserValue(): UserAuthData | null {
    return this.currentUserSubject.value;
  }

  register(data: { fullName: string; email: string; password: string; phone: string }): Observable<UserAuthData> {
    return this.http.post<UserAuthData>(`${this.baseUrl}/register`, data).pipe(
      tap((res) => this.setSession(res))
    );
  }

  login(credentials: { email: string; password: string }): Observable<UserAuthData> {
    return this.http.post<UserAuthData>(`${this.baseUrl}/login`, credentials).pipe(
      tap((res) => this.setSession(res))
    );
  }

  logout(): void {
    localStorage.removeItem('karnel_token');
    localStorage.removeItem('karnel_user');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('karnel_token');
  }

  getUserRole(): string | null {
    const user = this.currentUserValue;
    return user ? user.role : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private setSession(authResult: UserAuthData): void {
    if (authResult && authResult.token) {
      localStorage.setItem('karnel_token', authResult.token);
      localStorage.setItem('karnel_user', JSON.stringify(authResult));
      this.currentUserSubject.next(authResult);
    }
  }

  private getStoredUser(): UserAuthData | null {
    try {
      const data = localStorage.getItem('karnel_user');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }
}
