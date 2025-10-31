import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse 
} from '../../shared/models';
import { AuthStore } from '../../store';

/**
 * Authentication service
 * Handles login, register, and logout operations
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5296/api/auth';

  constructor(
    private http: HttpClient,
    private authStore: AuthStore
  ) {}

  /**
   * Login user with email and password
   */
  login(email: string, password: string): Observable<LoginResponse> {
    const request: LoginRequest = { email, password };
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request)
      .pipe(
        tap(response => {
          // Update auth store on successful login
          this.authStore.setAuth(response.token, response.userId, response.email);
        })
      );
  }

  /**
   * Register new user
   */
  register(fullName: string, email: string, password: string): Observable<RegisterResponse> {
    const request: RegisterRequest = { fullName, email, password };
    
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, request);
  }

  /**
   * Logout current user
   */
  logout(): void {
    this.authStore.clearAuth();
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return this.authStore.getToken();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.authStore.isAuthenticated();
  }
}
