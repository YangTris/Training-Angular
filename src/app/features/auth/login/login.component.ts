import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  /**
   * Handle login form submission
   */
  onSubmit(): void {
    // Validate inputs
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Login successful:', response);

        // Check if user has Admin role
        const roles = this.authService.getRoles();

        if (roles.includes('Admin')) {
          // Admin user - redirect to admin page
          console.log('Admin user detected, redirecting to admin page');
          this.router.navigate(['/admin']);
        } else {
          // Regular user - redirect to products page
          console.log('Regular user detected, redirecting to products page');
          this.router.navigate(['/products']);
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Login error:', error);

        // Handle different error scenarios
        if (error.status === 401) {
          this.errorMessage = 'Invalid email or password';
        } else if (error.status === 0) {
          this.errorMessage =
            'Cannot connect to server. Please check if the API is running.';
        } else {
          this.errorMessage = 'Login failed. Please try again.';
        }

        this.isLoading = false;
      },
    });
  }

  /**
   * Clear error message when user starts typing
   */
  clearError(): void {
    this.errorMessage = '';
  }
}
