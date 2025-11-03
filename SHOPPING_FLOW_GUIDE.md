# Shopping Flow Implementation Guide

## 🎉 What We've Built

This guide documents the implementation of the header, footer, and shopping flow functionality following the API documentation.

---

## 📦 Components Created

### 1. **Header Component** (`src/app/shared/header/`)

**Features:**

- Responsive navigation bar with logo
- Dynamic user menu (shows email when logged in)
- Cart icon with item count badge
- Login/Register buttons (when not logged in)
- Dropdown menu with Profile, My Orders, and Logout
- Sticky positioning at top of page

**Key Implementation Details:**

```typescript
// Cart badge updates automatically
this.cartService.cart$.subscribe((cart) => {
  this.cartItemCount = cart ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
});
```

### 2. **Footer Component** (`src/app/shared/footer/`)

**Features:**

- Company info and social links
- Quick links (Products, Cart, Orders)
- Customer service links
- Contact information
- Copyright with dynamic year
- Responsive layout

### 3. **Cart Service** (`src/app/core/services/cart.service.ts`)

**Purpose:** Manage all cart operations following the API specification

**Methods:**

- `getCart()` - Get current user's cart
- `addToCart(request)` - Add item to cart
- `updateCartItem(cartItemId, request)` - Update quantity
- `removeCartItem(cartItemId)` - Remove item
- `clearCart()` - Clear all items
- `getCartItemCount()` - Get total item count

**State Management:**

```typescript
// BehaviorSubject for reactive cart updates
private cartSubject = new BehaviorSubject<Cart | null>(null);
public cart$ = this.cartSubject.asObservable();
```

### 4. **Order Service** (`src/app/core/services/order.service.ts`)

**Purpose:** Handle order creation and retrieval

**Methods:**

- `createOrder(request)` - Create order from cart
- `getMyOrders(params)` - Get user's orders (paginated)
- `getOrderById(orderId)` - Get order details

---

## 🛒 Shopping Flow Implementation

### Step 1: Browse Products

**Location:** `src/app/features/products/product-list/`

**Features Added:**

- "Add to Cart" button on each product card
- Loading spinner while adding to cart
- Success message after adding item
- Automatic login check (redirects if not authenticated)
- Error handling for failed requests

**Code:**

```typescript
addToCart(product: Product): void {
  // Check authentication
  if (!this.authStore.getAuthValue().isAuthenticated) {
    alert('Please login to add items to cart');
    this.router.navigate(['/login']);
    return;
  }

  // Add to cart with loading state
  this.addingToCart[product.id] = true;

  this.cartService.addToCart({ productId: product.id, quantity: 1 }).subscribe({
    next: (cart) => {
      this.successMessage = `${product.name} added to cart!`;
      this.addingToCart[product.id] = false;
    },
    error: (error) => {
      // Handle errors (401, network, etc.)
      this.addingToCart[product.id] = false;
      if (error.status === 401) {
        this.router.navigate(['/login']);
      }
    }
  });
}
```

### Step 2: View Cart (To Be Implemented)

**Location:** `src/app/features/cart/cart-view/`

**Features to Implement:**

- Display all cart items
- Update quantity with +/- buttons
- Remove individual items
- Show subtotal and total
- "Proceed to Checkout" button
- Empty cart state

### Step 3: Checkout (To Be Implemented)

**Location:** `src/app/features/checkout/checkout/`

**Features to Implement:**

- Shipping address form
- Payment method selection:
  - Cash on Delivery
  - PayPal
  - Bank Transfer
  - Credit Card
- Order summary review
- Place order button
- Order confirmation

---

## 🔄 Complete Shopping Flow

```
1. User browses products (/products)
   ↓
2. User clicks "Add to Cart"
   ↓
3. System checks authentication
   ↓
   If not logged in → Redirect to /login
   If logged in → Continue
   ↓
4. API Call: POST /api/cart/items
   {
     "productId": "guid",
     "quantity": 1
   }
   ↓
5. Cart updated (BehaviorSubject emits new state)
   ↓
6. Header cart badge updates automatically
   ↓
7. Success message displays
   ↓
8. User continues shopping or goes to /cart
   ↓
9. User reviews cart, updates quantities
   ↓
10. User clicks "Proceed to Checkout" (/checkout)
   ↓
11. User fills shipping address & payment method
   ↓
12. API Call: POST /api/order
    {
      "shippingAddress": "123 Main St...",
      "paymentMethod": 0
    }
   ↓
13. Order created, cart automatically cleared
   ↓
14. User redirected to order confirmation
```

---

## 🎨 UI/UX Features

### Header

- **Responsive:** Collapses to hamburger menu on mobile
- **Cart Badge:** Shows total item count with red badge
- **User Dropdown:** Quick access to profile and orders
- **Sticky:** Stays at top while scrolling

### Footer

- **Multi-column layout** on desktop
- **Centered content** on mobile
- **Social media icons** with hover effects
- **Quick navigation** links

### Product List

- **Add to Cart button** on each card
- **Loading state** while adding (spinner)
- **Success notification** after adding
- **Disabled state** prevents double-clicking

---

## 📡 API Integration

### API Endpoints Used

#### 1. **GET /api/cart**

**Purpose:** Get current user's cart  
**Authentication:** Required (JWT token)

**Response:**

```json
{
  "id": "cart-guid",
  "userId": "user-guid",
  "items": [
    {
      "id": "item-guid",
      "productId": "product-guid",
      "productName": "Product Name",
      "quantity": 2,
      "unitPrice": 29.99,
      "totalPrice": 59.98,
      "imageUrl": "https://..."
    }
  ],
  "totalAmount": 59.98
}
```

#### 2. **POST /api/cart/items**

**Purpose:** Add item to cart  
**Authentication:** Required

**Request:**

```json
{
  "productId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "quantity": 1
}
```

**Response:** Returns updated cart (same as GET)

#### 3. **PUT /api/cart/items/{cartItemId}**

**Purpose:** Update cart item quantity  
**Authentication:** Required

**Request:**

```json
{
  "quantity": 3
}
```

#### 4. **DELETE /api/cart/items/{cartItemId}**

**Purpose:** Remove item from cart  
**Authentication:** Required  
**Response:** 204 No Content

#### 5. **POST /api/order**

**Purpose:** Create order from cart  
**Authentication:** Required

**Request:**

```json
{
  "shippingAddress": "123 Main St, Springfield, IL 62701",
  "paymentMethod": 0
}
```

**Payment Methods:**

- `0` = Cash on Delivery
- `1` = PayPal
- `2` = Bank Transfer
- `3` = Credit Card

**Response:**

```json
{
  "id": "order-guid",
  "userId": "user-guid",
  "orderDate": "2025-11-03T10:30:00Z",
  "totalAmount": 59.98,
  "status": 0,
  "paymentMethod": 0,
  "shippingAddress": "123 Main St...",
  "items": [...]
}
```

**Note:** Cart is automatically cleared after order creation!

---

## 🚀 Testing the Shopping Flow

### Test Scenario 1: Add to Cart (Logged In)

1. Login as `user@example.com` / `P@ssw0rd`
2. Navigate to `/products`
3. Click "Add to Cart" on any product
4. **Expected:**
   - ✅ Button shows spinner
   - ✅ Success message appears
   - ✅ Cart badge in header updates
   - ✅ Item count increases

### Test Scenario 2: Add to Cart (Not Logged In)

1. Logout if logged in
2. Navigate to `/products`
3. Click "Add to Cart"
4. **Expected:**
   - ✅ Alert: "Please login to add items to cart"
   - ✅ Redirected to `/login`

### Test Scenario 3: Cart Badge Updates

1. Login and add items to cart
2. **Expected:**
   - ✅ Badge shows total quantity (not item count)
   - ✅ Badge updates immediately after adding
   - ✅ Badge persists across page navigation

---

## 🔧 Technical Implementation Details

### State Management Pattern

**BehaviorSubject for Cart:**

```typescript
// In cart.service.ts
private cartSubject = new BehaviorSubject<Cart | null>(null);
public cart$ = this.cartSubject.asObservable();

// In header.component.ts
this.cartService.cart$.subscribe(cart => {
  this.cartItemCount = cart
    ? cart.items.reduce((sum, item) => sum + item.quantity, 0)
    : 0;
});
```

**Benefits:**

- Automatic UI updates when cart changes
- Single source of truth for cart state
- No need to manually refresh cart data

### Error Handling

**401 Unauthorized:**

```typescript
if (error.status === 401) {
  alert("Session expired. Please login again.");
  sessionStorage.removeItem("token");
  this.router.navigate(["/login"]);
}
```

**Network Errors:**

```typescript
error: (error) => {
  console.error("Error:", error);
  this.errorMessage = error.error?.message || "Failed to add item to cart.";
};
```

### Loading States

```typescript
// Prevent double-click with loading state
addingToCart: { [productId: string]: boolean } = {};

addToCart(product: Product): void {
  this.addingToCart[product.id] = true;

  this.cartService.addToCart(...).subscribe({
    next: () => {
      this.addingToCart[product.id] = false;
    },
    error: () => {
      this.addingToCart[product.id] = false;
    }
  });
}
```

---

## 📝 Next Steps

### 1. Complete Cart Page

**File:** `src/app/features/cart/cart-view/cart-view.component.ts`

**Features:**

- Display cart items in table
- Quantity adjustment (+/-)
- Remove item button
- Calculate subtotal and total
- "Proceed to Checkout" button
- Empty cart message

### 2. Complete Checkout Page

**File:** `src/app/features/checkout/checkout/checkout.component.ts`

**Features:**

- Reactive form for shipping address
- Radio buttons for payment method
- Order summary sidebar
- Form validation
- "Place Order" button
- Redirect to order confirmation

### 3. Add Product Detail "Add to Cart"

**File:** `src/app/features/products/product-detail/product-detail.component.ts`

**Features:**

- Quantity selector (default: 1)
- "Add to Cart" button
- Success notification
- View similar products

### 4. Create Orders Page

**Features:**

- List user's orders
- Order status display
- View order details
- Reorder functionality

---

## 💡 Key Learnings

### 1. **Reactive State Management**

Using BehaviorSubject allows automatic UI updates across components without manual refresh.

### 2. **API Integration**

Following the API documentation ensures consistent data flow:

- Request format matches DTOs
- Response handling uses interfaces
- Error codes trigger appropriate actions

### 3. **User Experience**

- Loading states prevent confusion
- Success messages provide feedback
- Error handling guides users
- Authentication checks prevent errors

### 4. **Component Communication**

Services act as bridges between components:

- `CartService` manages cart state
- `AuthStore` tracks authentication
- Components subscribe to observables

---

## 🐛 Common Issues & Solutions

### Issue 1: Cart Badge Not Updating

**Cause:** Not subscribed to cart$ observable  
**Solution:** Subscribe in ngOnInit of header component

### Issue 2: "401 Unauthorized" After Adding to Cart

**Cause:** Token expired or missing  
**Solution:** Check token expiration, redirect to login

### Issue 3: Double-Click Adds Item Twice

**Cause:** No loading state on button  
**Solution:** Disable button with `[disabled]="isAddingToCart(product.id)"`

### Issue 4: Cart Not Loading on Refresh

**Cause:** Cart not loaded on app initialization  
**Solution:** Load cart in header's ngOnInit when user is authenticated

---

## ✅ Summary

### Components Implemented:

✅ Header with cart badge  
✅ Footer with links  
✅ Cart Service with full API integration  
✅ Order Service  
✅ Product List "Add to Cart"  
✅ App layout with header/footer

### Pending Implementation:

⏳ Cart view page  
⏳ Checkout page  
⏳ Product detail "Add to Cart"  
⏳ Orders page

### API Endpoints Integrated:

✅ POST /api/cart/items (Add to cart)  
✅ GET /api/cart (Get cart)  
⏳ PUT /api/cart/items/{id} (Update quantity)  
⏳ DELETE /api/cart/items/{id} (Remove item)  
⏳ POST /api/order (Create order)

### Shopping Flow Status:

✅ Step 1: Browse products  
✅ Step 2: Add to cart  
⏳ Step 3: View cart  
⏳ Step 4: Checkout  
⏳ Step 5: Order confirmation

---

## 🚀 Ready to Test!

Start the development server:

```powershell
npm start
```

Test the shopping flow:

1. Login as `user@example.com` / `P@ssw0rd`
2. Browse products at `/products`
3. Click "Add to Cart"
4. See cart badge update in header
5. Success message appears!

The foundation for the complete e-commerce shopping flow is now in place! 🎉
