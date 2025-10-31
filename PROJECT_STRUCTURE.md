# Project Structure Guide

This Angular project follows a feature-based architecture with clear separation of concerns:

## 📁 Folder Structure

```
src/app/
├── core/                      # Singleton services, guards, and interceptors
│   ├── guards/               # Route guards (auth.guard.ts)
│   ├── interceptors/         # HTTP interceptors (auth.interceptor.ts)
│   └── services/             # Core services (auth.service.ts, product.service.ts)
│
├── shared/                    # Shared utilities, models, and components
│   ├── models/               # TypeScript interfaces and types
│   │   ├── api.model.ts     # Generic API models (PaginatedResult, etc.)
│   │   ├── auth.model.ts    # Authentication models
│   │   ├── product.model.ts # Product models
│   │   ├── cart.model.ts    # Cart models
│   │   ├── order.model.ts   # Order models
│   │   └── index.ts         # Barrel export
│   └── components/           # Reusable UI components
│
├── features/                  # Feature modules organized by domain
│   ├── auth/
│   │   ├── login/           # Login component
│   │   └── register/        # Register component
│   ├── products/
│   │   ├── product-list/    # Product listing page
│   │   └── product-detail/  # Product detail page
│   ├── cart/
│   │   └── cart-view/       # Shopping cart page
│   └── orders/
│       ├── order-list/      # Order history page
│       ├── order-detail/    # Order detail page
│       └── checkout/        # Checkout page
│
└── store/                     # State management (BehaviorSubject pattern)
    ├── auth.store.ts         # Authentication state
    ├── cart.store.ts         # Cart state
    └── index.ts              # Barrel export
```

## 🎯 Key Patterns

### 1. State Management (BehaviorSubject)

```typescript
// In store/cart.store.ts
private cartSubject = new BehaviorSubject<Cart | null>(null);
public cart$: Observable<Cart | null> = this.cartSubject.asObservable();

// Usage in component
constructor(private cartStore: CartStore) {}

ngOnInit(): void {
  this.cartStore.cart$.subscribe(cart => {
    this.cart = cart;
  });
}
```

### 2. API Services

```typescript
// In core/services/auth.service.ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:5296/api/auth';

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(tap(response => this.authStore.setAuth(...)));
  }
}
```

### 3. HTTP Interceptor

Automatically adds JWT token to all HTTP requests:

```typescript
// In core/interceptors/auth.interceptor.ts
intercept(req: HttpRequest<any>, next: HttpHandler) {
  const token = this.authStore.getToken();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next.handle(req);
}
```

### 4. Route Guards

Protects authenticated routes:

```typescript
// In core/guards/auth.guard.ts
export const authGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree(["/login"]);
};
```

## 🚀 Getting Started

### 1. Configure App Module

Add HttpClientModule to `app.module.ts`:

```typescript
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule  // Add when creating forms
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ]
})
```

### 2. Generate Components

Use Angular CLI to generate components:

```bash
# Auth features
ng generate component features/auth/login
ng generate component features/auth/register

# Product features
ng generate component features/products/product-list
ng generate component features/products/product-detail

# Cart feature
ng generate component features/cart/cart-view

# Order features
ng generate component features/orders/order-list
ng generate component features/orders/order-detail
ng generate component features/orders/checkout
```

### 3. Configure Routes

Add routes to `app-routing.module.ts`:

```typescript
import { authGuard } from "./core/guards/auth.guard";

const routes: Routes = [
  { path: "", redirectTo: "/products", pathMatch: "full" },
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  { path: "products", component: ProductListComponent },
  { path: "products/:id", component: ProductDetailComponent },
  { path: "cart", component: CartViewComponent, canActivate: [authGuard] },
  { path: "checkout", component: CheckoutComponent, canActivate: [authGuard] },
  { path: "orders", component: OrderListComponent, canActivate: [authGuard] },
  { path: "orders/:id", component: OrderDetailComponent, canActivate: [authGuard] },
];
```

## 📋 Naming Conventions

- **Components**: `product-list.component.ts` (kebab-case)
- **Services**: `auth.service.ts` (domain.service)
- **Models**: `product.model.ts` (domain.model)
- **Guards**: `auth.guard.ts` (purpose.guard)
- **Stores**: `cart.store.ts` (domain.store)

## 🎨 Bootstrap 5

Bootstrap is configured in `angular.json`:

```json
"styles": [
  "node_modules/bootstrap/dist/css/bootstrap.min.css",
  "src/styles.css"
]
```

Use Bootstrap classes in your templates:

```html
<div class="container">
  <div class="row">
    <div class="col-md-6">
      <button class="btn btn-primary">Add to Cart</button>
    </div>
  </div>
</div>
```

## 📚 Additional Resources

- [API Documentation](../API_DOCUMENTATION.md) - Complete API reference
- [API Quick Reference](../API_QUICK_REFERENCE.md) - Common workflows
- [Frontend Guide](../FRONTEND_GUIDE.md) - Integration examples

## 💡 Tips

1. **Use stores for shared state** - Cart and auth state are centralized
2. **Leverage interceptors** - Token management is automatic
3. **Protect routes** - Use authGuard for authenticated pages
4. **Type everything** - Project uses strict TypeScript mode
5. **Follow the structure** - Keep feature components in their respective folders
