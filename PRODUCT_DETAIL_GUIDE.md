# Product Detail Page - GetProductById API Guide

## Overview

This guide explains how to consume the **GetProductById** API to display detailed product information with image gallery, pricing, and metadata.

---

## 🎯 What We Built

A complete product detail page that:

- **Fetches product details** by ID from the URL
- **Displays multiple images** with clickable thumbnail gallery
- **Shows product information**: name, price, description, metadata
- **Handles loading and error states**
- **Provides navigation** back to product list
- **Placeholder for cart functionality**

---

## 📡 API Endpoint

**GET** `http://localhost:5296/api/product/{id}`

### Request

- **Method**: GET
- **Headers**: `Authorization: Bearer <token>` (optional for public products)
- **URL Parameter**: `id` (Product GUID)

### Response (ProductDetail)

```typescript
{
  id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  name: "Wireless Mouse",
  description: "Ergonomic wireless mouse with long battery life",
  price: 29.99,
  mainImageUrl: "https://example.com/main.jpg",
  categoryId: "category-guid",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-20T14:45:00Z",
  images: [
    {
      id: "image-guid-1",
      imageUrl: "https://example.com/img1.jpg",
      isMain: true
    },
    {
      id: "image-guid-2",
      imageUrl: "https://example.com/img2.jpg",
      isMain: false
    }
  ]
}
```

---

## 🏗️ Implementation Steps

### Step 1: Service Method (Already Done)

The `ProductService` already has the `getProductById()` method:

```typescript
// src/app/core/services/product.service.ts
getProductById(id: string): Observable<ProductDetail> {
  return this.http.get<ProductDetail>(`${this.apiUrl}/${id}`);
}
```

**What it does:**

- Takes product ID as parameter
- Makes HTTP GET request to `/api/product/{id}`
- Returns Observable that emits ProductDetail
- Automatically includes JWT token via AuthInterceptor

---

### Step 2: Component TypeScript Logic

**File**: `src/app/features/products/product-detail/product-detail.component.ts`

#### Key Concepts:

**1. Route Parameter Extraction**

```typescript
ngOnInit(): void {
  // Get 'id' from URL like /products/3fa85f64-5717-4562...
  const id = this.route.snapshot.paramMap.get('id');
  if (id) {
    this.loadProductDetails(id);
  }
}
```

**Why?**

- `ActivatedRoute` provides access to URL parameters
- `snapshot.paramMap.get('id')` extracts the `:id` from route `/products/:id`
- Always check if ID exists before making API call

**2. API Call with Error Handling**

```typescript
loadProductDetails(id: string): void {
  this.isLoading = true;
  this.errorMessage = '';

  this.productService.getProductById(id).subscribe({
    next: (result: ProductDetail) => {
      this.product = result;
      this.selectedImage = this.getMainImage();
      this.isLoading = false;
    },
    error: (error) => {
      console.error('Error loading product details:', error);
      this.errorMessage = 'Failed to load product details. Please try again.';
      this.isLoading = false;
    },
  });
}
```

**Pattern Explained:**

- Set `isLoading = true` before API call → shows spinner
- Clear any previous `errorMessage`
- Subscribe to Observable with `next` and `error` callbacks
- On success: Store product data, select main image, hide spinner
- On error: Log error, show user-friendly message, hide spinner

**3. Image Gallery Logic**

```typescript
getMainImage(): string {
  if (!this.product?.images || this.product.images.length === 0) {
    // No images? Use mainImageUrl or placeholder
    return this.product?.mainImageUrl || 'https://via.placeholder.com/500x500?text=No+Image';
  }

  // Find the image marked as main
  const mainImage = this.product.images.find((img) => img.isMain);
  if (mainImage) {
    return mainImage.imageUrl;
  }

  // Fallback to first image
  return this.product.images[0].imageUrl;
}
```

**Why multiple fallbacks?**

1. Check if `images` array exists and has items
2. Try to find image with `isMain: true`
3. If no main image, use first image in array
4. If no images array, use `mainImageUrl` from product
5. Final fallback: placeholder image

**4. User Actions**

```typescript
selectImage(imageUrl: string): void {
  this.selectedImage = imageUrl;  // Change main display image
}

goBack(): void {
  this.router.navigate(['/products']);  // Return to list
}

addToCart(): void {
  // Placeholder for future cart integration
  alert('Cart functionality will be implemented soon!');
}
```

---

### Step 3: HTML Template

**File**: `src/app/features/products/product-detail/product-detail.component.html`

#### Key Sections:

**1. Loading State**

```html
<div *ngIf="isLoading" class="text-center my-5">
  <div class="spinner-border text-primary" role="status">
    <span class="visually-hidden">Loading...</span>
  </div>
  <p class="mt-3">Loading product details...</p>
</div>
```

**Bootstrap Components:**

- `spinner-border` - Animated loading spinner
- `text-center my-5` - Center with vertical margins
- `*ngIf="isLoading"` - Only show when loading

**2. Error State**

```html
<div *ngIf="errorMessage && !isLoading" class="alert alert-danger">
  {{ errorMessage }}
  <button class="btn btn-primary mt-3" (click)="goBack()">Back to Products</button>
</div>
```

**When displayed:**

- `errorMessage` has value (API failed)
- AND `!isLoading` (not currently loading)

**3. Main Image Display**

```html
<img [src]="selectedImage" [alt]="product.name" class="img-fluid rounded shadow" style="width: 100%; height: 500px; object-fit: cover;" />
```

**Property Binding:**

- `[src]="selectedImage"` - Binds to TypeScript property (reactive)
- `[alt]="product.name"` - Accessibility text
- `object-fit: cover` - Crops image to fit container without distortion

**4. Thumbnail Gallery**

```html
<div *ngFor="let image of product.images" class="col-3">
  <img [src]="image.imageUrl" class="img-thumbnail thumbnail-image" [class.active]="selectedImage === image.imageUrl" (click)="selectImage(image.imageUrl)" style="cursor: pointer;" />
</div>
```

**Key Techniques:**

- `*ngFor` - Loop through images array
- `[class.active]` - Conditionally add 'active' class if image is selected
- `(click)="selectImage()"` - Click handler to change main image
- `cursor: pointer` - Indicates clickable

**5. Conditional Display with Pipes**

```html
<h2 class="text-primary mb-0">{{ product.price | currency }}</h2>

<p class="text-muted">{{ product.description || 'No description available for this product.' }}</p>

<li class="mb-2" *ngIf="product.createdAt"><strong>Created:</strong> {{ product.createdAt | date: 'medium' }}</li>
```

**Pipes Used:**

- `currency` - Formats number as currency (e.g., $29.99)
- `date: 'medium'` - Formats ISO date string (e.g., Jan 15, 2024, 10:30 AM)
- `number` - Formats numbers with thousands separators

**Null Handling:**

- `|| 'fallback text'` - Shows fallback if value is null/undefined
- `*ngIf="product.createdAt"` - Only shows if property exists

---

### Step 4: CSS Styling

**File**: `src/app/features/products/product-detail/product-detail.component.css`

#### Key Styles:

**1. Thumbnail Hover Effects**

```css
.thumbnail-image {
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.thumbnail-image:hover {
  transform: scale(1.05); /* Slight zoom on hover */
  border-color: #0d6efd; /* Blue border */
}

.thumbnail-image.active {
  border-color: #0d6efd;
  box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.25); /* Glow effect */
}
```

**Why?**

- Visual feedback for selected thumbnail
- Smooth transitions improve UX
- Active state clearly indicates current image

**2. Responsive Design**

```css
@media (max-width: 768px) {
  .action-buttons .btn {
    width: 100%; /* Full width on mobile */
    margin-bottom: 0.5rem; /* Stack vertically */
  }
}
```

**Why?**

- On mobile, side-by-side buttons become stacked
- Full width prevents tiny buttons on small screens

---

### Step 5: Routing Configuration

**File**: `src/app/app-routing.module.ts`

```typescript
const routes: Routes = [
  { path: "products", component: ProductListComponent },
  { path: "products/:id", component: ProductDetailComponent }, // ← Dynamic route
];
```

**How it works:**

- `:id` is a route parameter (placeholder for actual product ID)
- When user navigates to `/products/3fa85f64...`, Angular:
  1. Matches the route pattern
  2. Creates ProductDetailComponent instance
  3. Passes `3fa85f64...` as the `:id` parameter
  4. Component reads ID via `ActivatedRoute`

---

### Step 6: Navigation from Product List

**File**: `src/app/features/products/product-list/product-list.component.html`

```html
<button class="btn btn-sm btn-outline-primary" [routerLink]="['/products', product.id]">View Details</button>
```

**Why `[routerLink]` instead of `href`?**

- `routerLink` - Client-side navigation (no page reload, fast)
- `href` - Server request (full page reload, slow)

**Array syntax explained:**

- `['/products', product.id]` constructs URL `/products/{product.id}`
- Angular automatically builds the URL from array segments
- Example: `['/products', '3fa85f64...']` → `/products/3fa85f64...`

---

## 🎨 User Experience Features

### 1. **Loading Spinner**

Shows immediately when page loads, indicates data is being fetched.

### 2. **Error Handling**

If API fails (network error, 404, server error), shows friendly message with "Back to Products" button.

### 3. **Image Gallery**

- Large main image display
- Clickable thumbnails below
- Active thumbnail highlighted with blue border
- Hover effects for visual feedback

### 4. **Fallback Images**

Multiple fallback strategies prevent broken images:

1. Main image from `images` array
2. `mainImageUrl` property
3. Placeholder image from via.placeholder.com

### 5. **Metadata Display**

Shows additional product info:

- Product ID (useful for debugging)
- Category ID
- Created date
- Last updated date

### 6. **Navigation**

- "Back to Products" button at top
- "Continue Shopping" button at bottom
- Both use `router.navigate()` for smooth transitions

---

## 🔍 How Data Flows

```
User clicks "View Details" on Product List
          ↓
URL changes to /products/{id}
          ↓
Angular Router matches route pattern /products/:id
          ↓
ProductDetailComponent created
          ↓
ngOnInit() runs → gets ID from URL
          ↓
loadProductDetails(id) called
          ↓
ProductService.getProductById(id) makes HTTP request
          ↓
AuthInterceptor adds JWT token to request
          ↓
Backend API returns ProductDetail JSON
          ↓
Observable emits result → .subscribe() callback runs
          ↓
Component stores product data
          ↓
Template re-renders with product information
          ↓
User sees product details page
```

---

## 🧪 Testing Your Implementation

### 1. **Run the Dev Server**

```powershell
npm start
```

### 2. **Navigate to Product List**

Open browser: `http://localhost:4200/products`

### 3. **Click "View Details"**

Should navigate to `/products/{some-guid}`

### 4. **Verify Display**

Check that you see:

- ✅ Product name
- ✅ Product price formatted as currency
- ✅ Product description
- ✅ Main image
- ✅ Thumbnail gallery (if product has multiple images)
- ✅ Metadata (Created date, Updated date)
- ✅ "Add to Cart" and "Continue Shopping" buttons

### 5. **Test Image Gallery**

- Click different thumbnails
- Main image should change
- Active thumbnail should have blue border

### 6. **Test Navigation**

- Click "Back to Products" → Should return to product list
- Click "Continue Shopping" → Should return to product list

### 7. **Test Error Handling**

- Try navigating to `/products/invalid-guid`
- Should show error message with "Back to Products" button

---

## 🐛 Common Issues & Solutions

### Issue 1: "Can't bind to 'routerLink'"

**Cause**: `RouterModule` not imported
**Fix**: Ensure `AppRoutingModule` imports and exports `RouterModule`

### Issue 2: Images not displaying

**Cause**: Backend returning invalid image URLs or CORS issues
**Fix**: Check browser console for errors, verify image URLs are accessible

### Issue 3: "Cannot read property 'name' of null"

**Cause**: Template trying to render before data loads
**Fix**: Use safe navigation operator `product?.name` or `*ngIf="product"`

### Issue 4: Date not formatting correctly

**Cause**: `CommonModule` not imported
**Fix**: Ensure `BrowserModule` (which includes CommonModule) is imported in `app.module.ts`

### Issue 5: Clicking "View Details" doesn't navigate

**Cause**: `[routerLink]` syntax error or route not configured
**Fix**:

- Check route syntax: `[routerLink]="['/products', product.id]"`
- Verify route exists in `app-routing.module.ts`

---

## 📚 Key Angular Concepts Used

### 1. **Dependency Injection**

```typescript
constructor(
  private productService: ProductService,
  private route: ActivatedRoute,
  private router: Router
) {}
```

Angular automatically provides instances of these services.

### 2. **Observables & Subscriptions**

```typescript
this.productService.getProductById(id).subscribe({ ... })
```

Observables are streams of data. `.subscribe()` starts listening.

### 3. **Route Parameters**

```typescript
this.route.snapshot.paramMap.get("id");
```

Extract dynamic values from URL.

### 4. **Property Binding**

```html
[src]="selectedImage"
```

Binds HTML attribute to TypeScript property (one-way).

### 5. **Event Binding**

```html
(click)="selectImage(imageUrl)"
```

Binds DOM event to TypeScript method.

### 6. **Structural Directives**

```html
*ngIf="isLoading"
<!-- Conditional rendering -->
*ngFor="let image of product.images"
<!-- Loop -->
```

### 7. **Class Binding**

```html
[class.active]="selectedImage === image.imageUrl"
```

Conditionally add/remove CSS class.

### 8. **Pipes**

```html
{{ product.price | currency }} {{ product.createdAt | date: 'medium' }}
```

Transform data in templates.

---

## 🚀 Next Steps

Now that you have the product detail page working, consider:

1. **Add Cart Functionality**

   - Implement `addToCart()` method
   - Integrate with CartService
   - Update CartStore

2. **Add Product Reviews**

   - Fetch reviews from API
   - Display rating stars
   - Show customer reviews

3. **Add Related Products**

   - Fetch products in same category
   - Display carousel of similar items

4. **Improve Image Gallery**

   - Add image zoom on hover
   - Full-screen image modal
   - Image navigation arrows

5. **Add Breadcrumbs**

   - Show navigation path: Home > Products > Product Name

6. **Share Functionality**
   - Add social media share buttons
   - Copy product link to clipboard

---

## 📝 Summary

You've successfully consumed the **GetProductById** API by:

✅ **Creating a service method** that fetches product details by ID  
✅ **Building a component** that extracts the ID from the URL  
✅ **Implementing error handling** with loading and error states  
✅ **Designing a responsive UI** with Bootstrap and custom CSS  
✅ **Adding an image gallery** with thumbnail selection  
✅ **Integrating navigation** from product list to detail page  
✅ **Using Angular features**: routing, observables, directives, pipes

This pattern can be applied to any detail view in your application (orders, users, categories, etc.).

---

## 🎓 For Beginners

**What you learned:**

- How to extract route parameters from URLs
- How to make HTTP GET requests with path parameters
- How to handle asynchronous data with Observables
- How to display loading and error states
- How to build interactive UI components
- How to navigate between pages programmatically

**Key Takeaway:** The detail page pattern (list → detail) is fundamental in web apps. Master this, and you can build any data-driven application!

---

Happy coding! 🎉
