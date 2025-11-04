import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  /**
   * Handle registration form submission
   */
  onSubmit(): void {
    // Validate inputs
    if (
      !this.fullName ||
      !this.email ||
      !this.password ||
      !this.confirmPassword
    ) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    // Validate password match
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    // Validate password strength (minimum 6 characters with at least one uppercase, one lowercase, and one number)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(this.password)) {
      this.errorMessage =
        'Password must be at least 6 characters with uppercase, lowercase, and number';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService
      .register(this.fullName, this.email, this.password)
      .subscribe({
        next: (response) => {
          console.log('Registration successful:', response);
          this.successMessage =
            'Registration successful! Redirecting to login...';
          this.isLoading = false;

          // Redirect to login after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          console.error('Registration error:', error);

          // Handle different error scenarios
          if (error.status === 409) {
            this.errorMessage =
              'Email already exists. Please use a different email.';
          } else if (error.status === 400) {
            this.errorMessage =
              error.error?.message ||
              'Invalid registration data. Please check your inputs.';
          } else if (error.status === 0) {
            this.errorMessage =
              'Cannot connect to server. Please check if the API is running.';
          } else {
            this.errorMessage =
              error.error?.message || 'Registration failed. Please try again.';
          }

          this.isLoading = false;
        },
      });
  }

  /**
   * Clear error message when user starts typing
   */
  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
