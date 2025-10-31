import { Injectable } from '@angular/core';
import { 
  HttpInterceptor, 
  HttpRequest, 
  HttpHandler, 
  HttpEvent,
  HttpErrorResponse 
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthStore } from '../../store';

/**
 * HTTP Interceptor for authentication
 * - Automatically adds JWT token to outgoing requests
 * - Handles 401 Unauthorized errors by redirecting to login
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authStore: AuthStore,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Clone request and add token if available
    const token = this.authStore.getToken();
    
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Handle response errors
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token expired or invalid - redirect to login
          this.authStore.clearAuth();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
