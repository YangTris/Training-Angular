import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '../../shared/models';
import { AuthStore } from '../../store';

/**
 * Authentication service
 * Handles login, register, and logout operations
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:5296/api/auth';

  constructor(private http: HttpClient, private authStore: AuthStore) {}

  /**
   * Login user with email and password
   */
  login(email: string, password: string): Observable<LoginResponse> {
    const request: LoginRequest = { email, password };

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request).pipe(
      tap((response) => {
        // Decode JWT token to extract roles
        const roles = this.decodeTokenRoles(response.token);

        // Update auth store on successful login with roles
        this.authStore.setAuth(
          response.token,
          response.userId,
          response.email,
          roles
        );
      })
    );
  }

  /**
   * Decode JWT token and extract roles
   * JWT token format: header.payload.signature
   */
  private decodeTokenRoles(token: string): string[] {
    try {
      // Split token and get payload (middle part)
      const payload = token.split('.')[1];

      // Decode base64 payload
      const decodedPayload = JSON.parse(atob(payload));

      // JWT role claim can be under different keys depending on backend implementation
      // Common keys: 'role', 'roles', 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
      const roleClaimKey =
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

      let roles: string[] = [];

      if (decodedPayload[roleClaimKey]) {
        // Handle both single role (string) and multiple roles (array)
        if (Array.isArray(decodedPayload[roleClaimKey])) {
          roles = decodedPayload[roleClaimKey];
        } else {
          roles = [decodedPayload[roleClaimKey]];
        }
      } else if (decodedPayload['role']) {
        roles = Array.isArray(decodedPayload['role'])
          ? decodedPayload['role']
          : [decodedPayload['role']];
      } else if (decodedPayload['roles']) {
        roles = Array.isArray(decodedPayload['roles'])
          ? decodedPayload['roles']
          : [decodedPayload['roles']];
      }

      console.log('Decoded roles from token:', roles);
      return roles;
    } catch (error) {
      console.error('Error decoding token:', error);
      return [];
    }
  }

  /**
   * Register new user
   */
  register(
    fullName: string,
    email: string,
    password: string
  ): Observable<RegisterResponse> {
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

  /**
   * Get user roles
   */
  getRoles(): string[] {
    return this.authStore.getRoles();
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: string): boolean {
    return this.authStore.hasRole(role);
  }
}
