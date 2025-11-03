# Login API with Role-Based Routing Guide

## Overview

This guide explains how to consume the **Login API** and implement role-based routing in Angular. Users with "Admin" role are redirected to the admin dashboard, while regular users go to the products page.

---

## 🎯 What We Built

A complete authentication system that:

- **Authenticates users** via email/password
- **Decodes JWT tokens** to extract user roles
- **Routes based on roles**: Admin → `/admin`, User → `/products`
- **Persists auth state** in sessionStorage
- **Shows loading and error states**
- **Provides a beautiful login UI**

---

## 📡 API Endpoint

**POST** `http://localhost:5296/api/auth/login`

### Request

```json
{
  "email": "admin@example.com",
  "password": "P@ssw0rd"
}
```

### Response (200 OK)

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2025-11-03T12:30:00Z",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "admin@example.com"
}
```

### Error Response (401 Unauthorized)

```json
{
  "message": "Invalid credentials"
}
```

---

## 🧩 Architecture Overview

```
User enters credentials → LoginComponent
          ↓
AuthService.login(email, password)
          ↓
HTTP POST to /api/auth/login
          ↓
Backend returns JWT token
          ↓
Decode JWT to extract roles
          ↓
Update AuthStore with token, userId, email, roles
          ↓
Save to sessionStorage
          ↓
Check roles array
          ↓
roles.includes('Admin')? → Navigate to /admin : Navigate to /products
```

---

## 🔑 JWT Token Structure

JWT tokens consist of three parts: **header.payload.signature**

### Decoded Payload Example

```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "admin@example.com",
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": ["Admin", "User"],
  "exp": 1730640000,
  "iss": "your-issuer",
  "aud": "your-audience"
}
```

**Key Claims:**

- `sub` - User ID (subject)
- `email` - User email
- `http://schemas.microsoft.com/ws/2008/06/identity/claims/role` - User roles (array or string)
- `exp` - Token expiration timestamp

---

## 🏗️ Implementation Details

### Step 1: Update Auth Models

**File**: `src/app/shared/models/auth.model.ts`

Added `roles` field to store decoded roles:

```typescript
export interface LoginResponse {
  token: string;
  expiresAt: string;
  userId: string;
  email: string;
  roles?: string[]; // Roles decoded from JWT token
}
```

**Why optional (`?`)?**

- Roles are not in the API response; we decode them from the token
- This keeps the interface aligned with the actual API response

---

### Step 2: Update AuthState Interface

**File**: `src/app/store/auth.store.ts`

```typescript
export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  userId: string | null;
  email: string | null;
  roles: string[]; // Added roles array
}
```

**Updated `setAuth()` method:**

```typescript
setAuth(token: string, userId: string, email: string, roles: string[] = []): void {
  const authState: AuthState = {
    isAuthenticated: true,
    token,
    userId,
    email,
    roles  // Store roles in state
  };
  this.authSubject.next(authState);
  this.saveToStorage(authState);
}
```

**New helper methods:**

```typescript
getRoles(): string[] {
  return this.authSubject.value.roles;
}

hasRole(role: string): boolean {
  return this.authSubject.value.roles.includes(role);
}
```

**Storage persistence:**

```typescript
// Save roles as JSON string
sessionStorage.setItem("roles", JSON.stringify(authState.roles));

// Load roles from storage
const rolesJson = sessionStorage.getItem("roles");
const roles = rolesJson ? JSON.parse(rolesJson) : [];
```

---

### Step 3: Decode JWT Token in AuthService

**File**: `src/app/core/services/auth.service.ts`

#### JWT Decoding Logic

```typescript
private decodeTokenRoles(token: string): string[] {
  try {
    // Split token: header.payload.signature
    const payload = token.split('.')[1];

    // Decode base64 payload
    const decodedPayload = JSON.parse(atob(payload));

    // JWT role claim key (ASP.NET Core default)
    const roleClaimKey = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

    let roles: string[] = [];

    // Check for role claim (handle both string and array)
    if (decodedPayload[roleClaimKey]) {
      if (Array.isArray(decodedPayload[roleClaimKey])) {
        roles = decodedPayload[roleClaimKey];
      } else {
        roles = [decodedPayload[roleClaimKey]];
      }
    } else if (decodedPayload['role']) {
      // Fallback to simple 'role' key
      roles = Array.isArray(decodedPayload['role'])
        ? decodedPayload['role']
        : [decodedPayload['role']];
    } else if (decodedPayload['roles']) {
      // Fallback to 'roles' key
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
```

**Why multiple fallbacks?**

- Different backends use different claim keys
- ASP.NET Core uses the long URL format
- Some APIs use simple keys like `role` or `roles`
- Handles both single role (string) and multiple roles (array)

**Updated login method:**

```typescript
login(email: string, password: string): Observable<LoginResponse> {
  const request: LoginRequest = { email, password };

  return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request).pipe(
    tap((response) => {
      // Decode JWT token to extract roles
      const roles = this.decodeTokenRoles(response.token);

      // Update auth store with roles
      this.authStore.setAuth(response.token, response.userId, response.email, roles);
    })
  );
}
```

**New public methods:**

```typescript
getRoles(): string[] {
  return this.authStore.getRoles();
}

hasRole(role: string): boolean {
  return this.authStore.hasRole(role);
}
```

---

### Step 4: Login Component

**File**: `src/app/features/auth/login/login.component.ts`

#### Component Properties

```typescript
email = "";
password = "";
isLoading = false;
errorMessage = "";
```

#### Form Submission with Role-Based Routing

```typescript
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

      // Get roles from AuthService
      const roles = this.authService.getRoles();

      // Role-based routing
      if (roles.includes('Admin')) {
        console.log('Admin user detected, redirecting to admin page');
        this.router.navigate(['/admin']);
      } else {
        console.log('Regular user detected, redirecting to products page');
        this.router.navigate(['/products']);
      }

      this.isLoading = false;
    },
    error: (error) => {
      console.error('Login error:', error);

      // User-friendly error messages
      if (error.status === 401) {
        this.errorMessage = 'Invalid email or password';
      } else if (error.status === 0) {
        this.errorMessage = 'Cannot connect to server. Please check if the API is running.';
      } else {
        this.errorMessage = 'Login failed. Please try again.';
      }

      this.isLoading = false;
    }
  });
}
```

**Key Features:**

- Input validation before API call
- Loading state during API request
- Specific error messages based on HTTP status
- Console logging for debugging
- Role-based navigation after successful login

---

### Step 5: Login Template

**File**: `src/app/features/auth/login/login.component.html`

#### Key HTML Features

**1. Form with Template-Driven Validation**

```html
<form (ngSubmit)="onSubmit()" #loginForm="ngForm"></form>
```

**2. Email Input with Validation**

```html
<input type="email" class="form-control" [(ngModel)]="email" (input)="clearError()" required email [disabled]="isLoading" />
```

**Two-way binding:** `[(ngModel)]="email"`
**Event handler:** `(input)="clearError()"` - Clears error when user types
**Validation:** `required` and `email` directives
**Disabled state:** Prevents input during API call

**3. Error Alert**

```html
<div *ngIf="errorMessage" class="alert alert-danger alert-dismissible">
  <i class="bi bi-exclamation-circle-fill me-2"></i>
  {{ errorMessage }}
  <button type="button" class="btn-close" (click)="errorMessage = ''"></button>
</div>
```

**4. Submit Button with Loading State**

```html
<button type="submit" class="btn btn-primary btn-lg" [disabled]="isLoading || !loginForm.form.valid">
  <span *ngIf="!isLoading">
    <i class="bi bi-box-arrow-in-right me-2"></i>
    Sign In
  </span>
  <span *ngIf="isLoading">
    <span class="spinner-border spinner-border-sm me-2"></span>
    Signing in...
  </span>
</button>
```

**Disabled when:**

- Form is invalid (`!loginForm.form.valid`)
- OR currently loading (`isLoading`)

**5. Test Accounts Display**

```html
<div class="test-accounts mt-4 p-3 bg-light rounded">
  <p class="small text-muted mb-2 fw-bold"><i class="bi bi-info-circle me-2"></i>Test Accounts:</p>
  <p class="small mb-1"><strong>Admin:</strong> admin@example.com / P@ssw0rd</p>
  <p class="small mb-0"><strong>User:</strong> user@example.com / P@ssw0rd</p>
</div>
```

---

### Step 6: Login Styling

**File**: `src/app/features/auth/login/login.component.css`

#### Key Styles

**1. Full-Height Gradient Background**

```css
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
}
```

**2. Enhanced Input Focus**

```css
.input-group:focus-within .input-group-text {
  border-color: #80bdff;
}

.input-group:focus-within .form-control {
  border-color: #80bdff;
}
```

**3. Animated Button Hover**

```css
.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}
```

**4. Slide-Down Animation for Errors**

```css
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

### Step 7: Admin Dashboard Component

**File**: `src/app/features/admin/admin.component.ts`

#### Admin Page Features

```typescript
ngOnInit(): void {
  // Get user information
  const authState = this.authStore.getAuthValue();
  this.userEmail = authState.email || '';
  this.roles = authState.roles;

  // Verify admin access
  if (!this.roles.includes('Admin')) {
    console.warn('Non-admin user attempted to access admin page');
    this.router.navigate(['/products']);
  }
}
```

**Security Check:**

- Verifies user has "Admin" role on page load
- Redirects non-admin users to products page
- Displays user email and roles in the UI

**Dashboard Features:**

- Welcome banner with user info
- Stats cards for Products, Orders, Users, Analytics
- Role/permission display
- Logout functionality

---

### Step 8: Routing Configuration

**File**: `src/app/app-routing.module.ts`

```typescript
const routes: Routes = [
  { path: "", redirectTo: "/login", pathMatch: "full" },
  { path: "login", component: LoginComponent },
  { path: "admin", component: AdminComponent },
  { path: "products", component: ProductListComponent },
  { path: "products/:id", component: ProductDetailComponent },
  { path: "**", redirectTo: "/login" },
];
```

**Route Order Matters:**

1. Empty path redirects to login
2. Login page (public)
3. Admin dashboard (should be protected with guard)
4. Products list (public)
5. Product detail (public)
6. Wildcard catches all other routes → redirects to login

---

## 🧪 Testing Your Implementation

### Test Scenario 1: Admin User Login

1. **Start dev server:**

   ```powershell
   npm start
   ```

2. **Navigate to:** `http://localhost:4200`

   - Should automatically redirect to `/login`

3. **Login with admin account:**

   - Email: `admin@example.com`
   - Password: `P@ssw0rd`
   - Click "Sign In"

4. **Expected Behavior:**

   - ✅ Loading spinner appears
   - ✅ Console logs: "Login successful"
   - ✅ Console logs: "Admin user detected, redirecting to admin page"
   - ✅ Redirects to `/admin`
   - ✅ Admin dashboard displays with:
     - User email in navbar
     - Welcome message
     - Stats cards
     - Roles display showing "Admin" and "User" badges

5. **Verify sessionStorage:**
   - Open browser DevTools → Application → Session Storage
   - Should see:
     - `token`: JWT token string
     - `userId`: User GUID
     - `email`: admin@example.com
     - `roles`: `["Admin","User"]`

### Test Scenario 2: Regular User Login

1. **Logout** (click logout button on admin page)

2. **Login with regular user account:**

   - Email: `user@example.com`
   - Password: `P@ssw0rd`

3. **Expected Behavior:**

   - ✅ Console logs: "Regular user detected, redirecting to products page"
   - ✅ Redirects to `/products`
   - ✅ Product list page displays

4. **Try accessing admin page manually:**
   - Navigate to `http://localhost:4200/admin`
   - Should redirect back to `/products` (if protection logic is in component)

### Test Scenario 3: Invalid Credentials

1. **Login with wrong password:**

   - Email: `admin@example.com`
   - Password: `wrongpassword`

2. **Expected Behavior:**
   - ✅ Error alert appears: "Invalid email or password"
   - ✅ Button returns to "Sign In" state
   - ✅ No navigation occurs

### Test Scenario 4: API Not Running

1. **Stop the backend API**

2. **Try to login:**

   - Email: `admin@example.com`
   - Password: `P@ssw0rd`

3. **Expected Behavior:**
   - ✅ Error alert appears: "Cannot connect to server. Please check if the API is running."
   - ✅ Console shows network error (status 0)

---

## 🔍 How Data Flows

### Login Flow Diagram

```
User submits form
    ↓
LoginComponent.onSubmit()
    ↓
AuthService.login(email, password)
    ↓
HTTP POST /api/auth/login
    ↓
Backend validates credentials
    ↓
Backend returns { token, userId, email, expiresAt }
    ↓
AuthService decodes JWT token
    ↓
Extract roles from payload
    ↓
AuthStore.setAuth(token, userId, email, roles)
    ↓
Save to sessionStorage
    ↓
Emit new AuthState via BehaviorSubject
    ↓
LoginComponent gets roles via AuthService
    ↓
Check: roles.includes('Admin')?
    ↓                     ↓
  YES                   NO
    ↓                     ↓
Navigate to /admin    Navigate to /products
```

### JWT Decoding Process

```
Token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwicm9sZXMiOlsiQWRtaW4iXX0.signature"
          ↓
Split by '.'
          ↓
Get middle part (payload)
          ↓
Decode base64: atob(payload)
          ↓
Parse JSON: JSON.parse(decoded)
          ↓
Extract role claim
          ↓
Handle array or string
          ↓
Return: ["Admin", "User"]
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot read property 'includes' of undefined"

**Cause:** Roles array is undefined or null

**Solution:**

```typescript
// Add default empty array
const roles = this.authService.getRoles() || [];
if (roles.includes("Admin")) {
  // ...
}
```

### Issue 2: Roles not persisting after page refresh

**Cause:** Not loading from sessionStorage on app init

**Solution:** AuthStore already handles this in constructor:

```typescript
constructor() {
  this.loadFromStorage();  // Loads roles from sessionStorage
}
```

### Issue 3: JWT decoding fails

**Symptoms:**

- Console error: "Error decoding token"
- Roles array is empty

**Debugging Steps:**

1. Check token format (should have 3 parts separated by `.`)
2. Log the decoded payload:
   ```typescript
   console.log("Decoded payload:", decodedPayload);
   ```
3. Verify role claim key matches your backend

### Issue 4: Always redirects to products (even for admin)

**Cause:** Role check is case-sensitive

**Solution:** Ensure role string matches exactly:

```typescript
// Backend returns "Admin" (capital A)
if (roles.includes('Admin')) { // Not 'admin' or 'ADMIN'
```

### Issue 5: CORS errors when calling login API

**Symptoms:**

- Console error: "Access to XMLHttpRequest has been blocked by CORS policy"
- Error status: 0

**Solution:**

- Ensure backend CORS is configured to allow `http://localhost:4200`
- Check backend is running on `http://localhost:5296`

---

## 🔐 Security Best Practices

### 1. **Use HTTPS in Production**

```typescript
// Use environment variables
private apiUrl = environment.apiUrl; // https://api.production.com
```

### 2. **Implement Route Guards**

Create an `AuthGuard` to protect admin routes:

```typescript
// src/app/core/guards/admin.guard.ts
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasRole('Admin')) {
    return true;
  }

  console.warn('Access denied: Admin role required');
  return router.parseUrl('/products');
};

// In app-routing.module.ts:
{
  path: 'admin',
  component: AdminComponent,
  canActivate: [adminGuard]  // Protected route
}
```

### 3. **Handle Token Expiration**

```typescript
// Check expiration before API calls
private isTokenExpired(): boolean {
  const authState = this.authStore.getAuthValue();
  if (!authState.token) return true;

  // Decode and check exp claim
  const payload = JSON.parse(atob(authState.token.split('.')[1]));
  const exp = payload.exp * 1000; // Convert to milliseconds

  return Date.now() >= exp;
}
```

### 4. **Clear Sensitive Data on Logout**

```typescript
logout(): void {
  this.authService.logout(); // Clears sessionStorage
  this.router.navigate(['/login']);

  // Clear any cached data
  // Clear form values
  this.email = '';
  this.password = '';
}
```

### 5. **Validate Inputs**

```typescript
// Add regex validation for email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(this.email)) {
  this.errorMessage = "Please enter a valid email address";
  return;
}

// Add password strength validation
if (this.password.length < 8) {
  this.errorMessage = "Password must be at least 8 characters";
  return;
}
```

---

## 🚀 Next Steps

### 1. **Implement Route Guards**

Protect routes based on authentication and roles:

- AuthGuard: Requires authentication
- AdminGuard: Requires Admin role
- GuestGuard: Only for non-authenticated users (login page)

### 2. **Add Remember Me**

```typescript
// In login component
rememberMe = false;

// In auth store
saveToStorage(authState: AuthState): void {
  const storage = this.rememberMe ? localStorage : sessionStorage;
  // Save to appropriate storage
}
```

### 3. **Implement Refresh Tokens**

- Store refresh token separately
- Auto-refresh access token before expiration
- Provide better UX (no forced logout)

### 4. **Add Registration Flow**

- Create registration component
- Validate email uniqueness
- Send verification email
- Auto-login after registration

### 5. **Enhance Error Handling**

```typescript
// Create error interceptor
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token expired - redirect to login
          this.authService.logout();
          this.router.navigate(["/login"]);
        }
        return throwError(() => error);
      })
    );
  }
}
```

---

## 📚 Key Angular Concepts Used

### 1. **RxJS Operators**

```typescript
.pipe(
  tap((response) => { /* Side effect */ }),
  catchError((error) => { /* Error handling */ })
)
```

### 2. **Dependency Injection**

```typescript
constructor(
  private authService: AuthService,
  private router: Router
) {}
```

### 3. **Template-Driven Forms**

```html
<form #loginForm="ngForm">
  <input [(ngModel)]="email" name="email" required email />
</form>
```

### 4. **Reactive Navigation**

```typescript
this.router.navigate(["/admin"]);
```

### 5. **BehaviorSubject State Management**

```typescript
private authSubject = new BehaviorSubject<AuthState>(initialState);
public auth$ = this.authSubject.asObservable();
```

### 6. **SessionStorage Persistence**

```typescript
sessionStorage.setItem("token", token);
sessionStorage.getItem("token");
sessionStorage.removeItem("token");
```

---

## 📝 Summary

You've successfully implemented a complete authentication system with:

✅ **Login API integration** with email/password authentication  
✅ **JWT token decoding** to extract user roles  
✅ **Role-based routing**: Admin → `/admin`, User → `/products`  
✅ **State management** with BehaviorSubject pattern  
✅ **SessionStorage persistence** for auth state  
✅ **Error handling** with user-friendly messages  
✅ **Loading states** and disabled UI during API calls  
✅ **Beautiful login UI** with gradient background  
✅ **Admin dashboard** with role verification  
✅ **Routing configuration** with redirects

---

## 🎓 For Beginners

**What you learned:**

- How to make authenticated HTTP POST requests
- How to decode JWT tokens in the browser
- How to implement role-based access control
- How to persist authentication state
- How to handle navigation based on conditions
- How to create forms with validation
- How to manage loading and error states
- How to use RxJS operators (tap, catchError)

**Key Takeaway:** Authentication is the foundation of secure web apps. Understanding JWT tokens, state management, and role-based routing will enable you to build secure, user-friendly applications!

---

Happy coding! 🎉
