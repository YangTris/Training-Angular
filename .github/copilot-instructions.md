# Training-Angular - AI Agent Instructions

## Project Overview

This is an **Angular 16.2** e-commerce frontend training project that integrates with a .NET Core MockTest API backend. The project is freshly scaffolded with minimal custom code—expect to build core features from scratch.

**Key Tech Stack:**

- **Angular CLI 16.2.16** for scaffolding and build tooling
- **TypeScript 5.1.3** with strict mode enabled
- **RxJS 7.8** for reactive programming and state management
- **Bootstrap 5** for UI components and styling
- **BehaviorSubject pattern** for lightweight state management (no NgRx)
- **JWT Authentication** with HTTP interceptor for token management
- Component selector prefix: `app-`

**Development Focus:**

- Focus on feature development first
- Testing deferred until needed
- No deployment configuration required yet

## Architecture & Integration Points

### Backend API Integration

The backend API runs at `http://localhost:5296/api` and provides full e-commerce functionality:

**Core API Services Required:**

- **Auth**: JWT-based authentication (`POST /api/auth/login`, `/api/auth/register`)
  - Tokens expire in 30 minutes
  - Store in `sessionStorage` or `localStorage`
  - Use `Authorization: Bearer <token>` header for authenticated requests
- **Products**: Public paginated endpoints (`GET /api/product`)

  - Supports `pageNumber`, `pageSize`, `searchTerm`, `sortBy`, `isDescending` query params
  - Product details include image gallery (`GET /api/product/{id}`)

- **Categories**: Public category browsing (`GET /api/category`)

- **Cart**: Authenticated endpoints requiring JWT

  - `GET /api/cart` - Auto-creates cart if none exists
  - `POST /api/cart/items` - Add items
  - Cart is cleared after order creation

- **Orders**: Full order management
  - `POST /api/order` - Create from cart (requires `shippingAddress` and `paymentMethod`)
  - Payment methods: `0=CashOnDelivery, 1=PayPal, 2=BankTransfer, 3=CreditCard`
  - Order statuses: `0=Pending, 1=Processing, 2=Shipped, 3=Completed, 4=Cancelled`

**Test Accounts:**

- Admin: `admin@example.com` / `P@ssw0rd`
- User: `user@example.com` / `P@ssw0rd`

### Angular Project Structure

```
src/app/
  ├── app.module.ts          # Root module (minimal setup)
  ├── app-routing.module.ts  # Empty routes - define as needed
  └── app.component.ts       # Root component
```

**Project Organization Pattern:**

```
src/app/
  ├── core/                     # Singleton services, guards, interceptors
  │   ├── guards/              # Route guards (auth.guard.ts)
  │   ├── interceptors/        # HTTP interceptors (auth.interceptor.ts)
  │   └── services/            # Core services (auth.service.ts)
  ├── shared/                   # Shared utilities, pipes, directives
  │   ├── models/              # TypeScript interfaces/types
  │   └── components/          # Reusable UI components
  ├── features/                 # Feature modules organized by domain
  │   ├── products/
  │   │   ├── product-list/
  │   │   ├── product-detail/
  │   │   └── products.service.ts
  │   ├── cart/
  │   │   ├── cart-view/
  │   │   └── cart.service.ts
  │   ├── orders/
  │   │   ├── order-list/
  │   │   ├── order-detail/
  │   │   ├── checkout/
  │   │   └── order.service.ts
  │   └── auth/
  │       ├── login/
  │       └── register/
  └── store/                    # State management (BehaviorSubject pattern)
      ├── cart.store.ts
      └── auth.store.ts
```

**Naming Conventions:**

- Components: `product-list.component.ts` (kebab-case)
- Services: `product.service.ts` (domain.service)
- Models: `product.model.ts` or `product.interface.ts`
- Guards: `auth.guard.ts` (purpose.guard)
- Clear, descriptive names that indicate purpose

## Critical Developer Workflows

### Development Server

```powershell
npm run build      # Builds project in development mode
npm start          # Starts dev server at http://localhost:4200
ng serve           # Alternative command
```

### Code Generation (Use Angular CLI)

```powershell
# Create components with CLI (automatically updates app.module.ts)
ng generate component components/product-list
ng generate component components/product-detail
ng generate component components/cart
ng generate component components/checkout
ng generate component components/login
ng generate component components/register

# Create services
ng generate service services/auth
ng generate service services/product
ng generate service services/cart
ng generate service services/order

# Create guards
ng generate guard guards/auth

# Create interceptors
ng generate interceptor interceptors/auth
```

### Testing

```powershell
npm test           # Runs Jasmine/Karma tests
ng test            # Alternative command
```

### Building

```powershell
npm run build      # Production build to dist/training-angular/
ng build           # Development build
```

## Project-Specific Conventions

### HTTP Client Setup

Angular's `HttpClient` is NOT imported yet. When creating API services:

```typescript
// In app.module.ts, add:
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule  // Add this
  ],
  // ...
})
```

### API Service Pattern

Follow this structure for consistency:

```typescript
// services/auth.service.ts
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class AuthService {
  private apiUrl = "http://localhost:5296/api/auth";

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password });
  }

  getToken(): string | null {
    return sessionStorage.getItem("token");
  }

  setToken(token: string): void {
    sessionStorage.setItem("token", token);
  }

  logout(): void {
    sessionStorage.removeItem("token");
  }
}
```

### HTTP Interceptor for Auth

Create an interceptor to inject tokens automatically:

```typescript
// interceptors/auth.interceptor.ts
import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler } from "@angular/common/http";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = sessionStorage.getItem("token");
    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }
    return next.handle(req);
  }
}

// Register in app.module.ts:
import { HTTP_INTERCEPTORS } from "@angular/common/http";
providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }];
```

### TypeScript Strict Mode

The project has `strict: true` in `tsconfig.json`. Always:

- Define explicit types for function parameters and returns
- Handle null/undefined cases with optional chaining (`?.`)
- Use `strictNullChecks` compatible code

### Bootstrap Setup

Install and configure Bootstrap 5:

```powershell
npm install bootstrap
```

Add to `angular.json` styles array:

```json
"styles": [
  "node_modules/bootstrap/dist/css/bootstrap.min.css",
  "src/styles.css"
]
```

### Reactive Forms (When Needed)

Import `ReactiveFormsModule` or `FormsModule` in `app.module.ts` for forms:

```typescript
imports: [
  BrowserModule,
  AppRoutingModule,
  HttpClientModule,
  ReactiveFormsModule, // For reactive forms
  // or FormsModule for template-driven forms
];
```

### State Management Pattern

Use BehaviorSubject pattern for lightweight state management (no NgRx needed):

```typescript
// store/cart.store.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CartStore {
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  public cart$: Observable<Cart | null> = this.cartSubject.asObservable();

  updateCart(cart: Cart): void {
    this.cartSubject.next(cart);
  }

  getCartValue(): Cart | null {
    return this.cartSubject.value;
  }

  clearCart(): void {
    this.cartSubject.next(null);
  }
}

// Usage in service:
constructor(private cartStore: CartStore) {}

loadCart(): void {
  this.http.get<Cart>('api/cart').subscribe(cart => {
    this.cartStore.updateCart(cart);
  });
}

// Usage in component:
constructor(private cartStore: CartStore) {}

ngOnInit(): void {
  this.cartStore.cart$.subscribe(cart => {
    this.cart = cart;
  });
}
```

## Common Patterns & Gotchas

### Pagination Handling

All list endpoints return `PaginatedResult<T>`:

```typescript
interface PaginatedResult<T> {
  items: T[];
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// Use in component:
loadProducts(page: number = 1): void {
  this.productService.getProducts(page, 10, this.searchTerm)
    .subscribe(result => {
      this.products = result.items;
      this.totalPages = result.totalPages;
    });
}
```

### Error Handling Pattern

Handle 401 errors to redirect to login:

```typescript
import { catchError } from "rxjs/operators";
import { throwError } from "rxjs";

this.http
  .get<Cart>("http://localhost:5296/api/cart")
  .pipe(
    catchError((error) => {
      if (error.status === 401) {
        this.router.navigate(["/login"]);
      }
      return throwError(() => error);
    })
  )
  .subscribe(/* ... */);
```

### Route Guards for Protected Pages

Cart, checkout, and order pages require authentication:

```typescript
// guards/auth.guard.ts
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.getToken()) {
    return true;
  }
  return router.parseUrl("/login");
};

// In app-routing.module.ts:
const routes: Routes = [
  { path: "cart", component: CartComponent, canActivate: [authGuard] },
  { path: "checkout", component: CheckoutComponent, canActivate: [authGuard] },
];
```

## Key Documentation References

- **API Documentation**: `API_DOCUMENTATION.md` - Complete endpoint reference
- **API Quick Reference**: `API_QUICK_REFERENCE.md` - Common workflows and cheat sheet
- **Frontend Guide**: `FRONTEND_GUIDE.md` - Integration examples and common issues
- **Postman Collection**: `MockTest_API.postman_collection.json` - Test API endpoints

## Important Notes

1. **GUIDs are case-insensitive** - Backend accepts both `3FA85F64...` and `3fa85f64...`
2. **Pagination is 1-based** - First page is `pageNumber=1`, not 0
3. **Soft deletes** - Deleted items are marked `IsDeleted=true`, not physically removed
4. **Cart auto-creation** - GET /api/cart creates an empty cart if none exists
5. **Order creation clears cart** - Cart is emptied after successful order
6. **Default product images** - New products automatically get a default image URL

## VS Code Tasks Available

- `npm: run build` - Build project for production
- `npm: start` - Start Angular dev server
- `npm: test` - Run tests in watch mode

Use `npm start` to launch the development server at `http://localhost:4200`.
