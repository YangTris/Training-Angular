import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Authentication state interface
 */
export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  userId: string | null;
  email: string | null;
  roles: string[];
}

/**
 * Auth state store using BehaviorSubject pattern
 * Provides centralized authentication state management
 */
@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  private initialState: AuthState = {
    isAuthenticated: false,
    token: null,
    userId: null,
    email: null,
    roles: [],
  };

  private authSubject = new BehaviorSubject<AuthState>(this.initialState);
  public auth$: Observable<AuthState> = this.authSubject.asObservable();

  constructor() {
    // Initialize from sessionStorage on app start
    this.loadFromStorage();
  }

  /**
   * Set authentication state after login
   */
  setAuth(
    token: string,
    userId: string,
    email: string,
    roles: string[] = []
  ): void {
    const authState: AuthState = {
      isAuthenticated: true,
      token,
      userId,
      email,
      roles,
    };
    this.authSubject.next(authState);
    this.saveToStorage(authState);
  }

  /**
   * Clear authentication state on logout
   */
  clearAuth(): void {
    this.authSubject.next(this.initialState);
    this.clearStorage();
  }

  /**
   * Get current auth state synchronously
   */
  getAuthValue(): AuthState {
    return this.authSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.authSubject.value.isAuthenticated;
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return this.authSubject.value.token;
  }

  /**
   * Get user roles
   */
  getRoles(): string[] {
    return this.authSubject.value.roles;
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: string): boolean {
    return this.authSubject.value.roles.includes(role);
  }

  /**
   * Load auth state from sessionStorage
   */
  private loadFromStorage(): void {
    const token = sessionStorage.getItem('token');
    const userId = sessionStorage.getItem('userId');
    const email = sessionStorage.getItem('email');
    const rolesJson = sessionStorage.getItem('roles');
    const roles = rolesJson ? JSON.parse(rolesJson) : [];

    if (token && userId && email) {
      this.authSubject.next({
        isAuthenticated: true,
        token,
        userId,
        email,
        roles,
      });
    }
  }

  /**
   * Save auth state to sessionStorage
   */
  private saveToStorage(authState: AuthState): void {
    if (authState.token && authState.userId && authState.email) {
      sessionStorage.setItem('token', authState.token);
      sessionStorage.setItem('userId', authState.userId);
      sessionStorage.setItem('email', authState.email);
      sessionStorage.setItem('roles', JSON.stringify(authState.roles));
    }
  }

  /**
   * Clear auth data from sessionStorage
   */
  private clearStorage(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('roles');
  }
}
