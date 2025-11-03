# Cart Offcanvas Implementation Guide

## Overview

This document describes the implementation of the cart offcanvas (sliding panel) functionality in the header component, replacing the previous routing to `/cart` page.

## Changes Made

### 1. Header Component - TypeScript (`header.component.ts`)

**New Properties:**

- `cart: Cart | null = null` - Stores the full cart object
- `isLoadingCart = false` - Loading state for cart operations
- `updatingItemId: string | null = null` - Tracks which item is being updated
- `private cartOffcanvas: any` - Bootstrap offcanvas instance

**New Methods:**

- `openCartOffcanvas()` - Opens the cart offcanvas and reloads cart data
- `increaseQuantity(item: CartItem)` - Increases item quantity by 1
- `decreaseQuantity(item: CartItem)` - Decreases item quantity by 1 (or removes if quantity is 1)
- `removeItem(item: CartItem)` - Removes an item from the cart with confirmation

**Updated Logic:**

- Now subscribes to full `cart$` observable instead of just counting items
- Cart is cleared when user logs out
- Added Bootstrap declaration for offcanvas functionality

### 2. Header Component - HTML (`header.component.html`)

**Cart Icon Changes:**

- Changed from `routerLink="/cart"` to `(click)="openCartOffcanvas()"` with pointer cursor
- Opens offcanvas instead of navigating to a new page

**New Offcanvas Section:**
Added a Bootstrap 5 offcanvas component with:

1. **Header Section:**

   - Title "Shopping Cart" with badge showing item count
   - Close button

2. **Loading State:**

   - Spinner and loading message while cart is being fetched

3. **Empty Cart State:**

   - Icon and message when cart is empty
   - "Browse Products" button to navigate to products page

4. **Cart Items Section:**

   - Scrollable list of cart items with:
     - Product image (80x80px)
     - Product name
     - Unit price
     - Quantity controls (+/- buttons)
     - Remove button with trash icon
     - Item subtotal
   - Loading spinner on quantity buttons when updating

5. **Cart Summary Section:**
   - Total amount display
   - "Proceed to Checkout" button (navigates to `/checkout`)
   - "View Full Cart" button (navigates to `/cart`)

### 3. Header Component - CSS (`header.component.css`)

**New Styles:**

- `.offcanvas` - 400px width, max 90vw for mobile
- `.offcanvas-header` - Gradient background matching brand colors
- `.cart-item-card` - Hover effects for cart items
- `.cart-item-image` - Border styling for product images
- Scrollbar styling for cart items list
- Button group sizing for quantity controls

### 4. Product Detail Component - TypeScript (`product-detail.component.ts`)

**New Properties:**

- `quantity = 1` - Selected quantity (default: 1)
- `isAddingToCart = false` - Loading state for add to cart action
- `successMessage = ''` - Success message after adding to cart

**New Imports:**

- `CartService` - For cart operations
- `AuthStore` - For authentication checks

**New Methods:**

- `increaseQuantity()` - Increases quantity (max: 99)
- `decreaseQuantity()` - Decreases quantity (min: 1)
- `addToCart()` - Adds product to cart with:
  - Authentication check
  - Loading state
  - Success message (auto-clears after 3 seconds)
  - Error handling (401 redirects to login)

### 5. Product Detail Component - HTML (`product-detail.component.html`)

**New Elements:**

1. **Success Alert:**

   - Green alert with checkmark icon
   - Dismissible button
   - Shows product name and confirmation message

2. **Quantity Selector:**

   - Three-button group (-, quantity, +)
   - Disabled state when adding to cart
   - Min: 1, Max: 99
   - Centered display with 60px width for quantity

3. **Updated Add to Cart Button:**
   - Shows spinner when `isAddingToCart` is true
   - "Adding..." text during operation
   - Disabled state during operation

### 6. Cart Model - TypeScript (`cart.model.ts`)

**Updated Interface:**

- Added `imageUrl?: string` to `CartItem` interface
- Optional field for displaying product images in cart

## User Experience Flow

### Adding to Cart from Product Detail:

1. User views product detail page
2. User adjusts quantity using +/- buttons
3. User clicks "Add to Cart"
4. System checks authentication (redirects to login if not authenticated)
5. Loading spinner shows on button
6. Item added to cart via API
7. Success message appears
8. Quantity resets to 1
9. Cart badge in header updates automatically

### Viewing Cart (Offcanvas):

1. User clicks cart icon in header
2. Offcanvas slides in from right
3. Loading spinner shows while fetching cart
4. Cart items display with:
   - Product images
   - Names and prices
   - Quantity controls
   - Remove buttons
5. Total amount shown at bottom
6. User can:
   - Adjust quantities (triggers API update)
   - Remove items (with confirmation)
   - Proceed to checkout
   - View full cart page
   - Close offcanvas

### Cart Updates:

1. User clicks +/- on an item
2. Button shows spinner
3. API updates quantity
4. Cart data refreshes automatically via BehaviorSubject
5. Total recalculates
6. Cart badge updates

### Removing Items:

1. User clicks trash icon
2. Confirmation dialog appears
3. If confirmed, item removed via API
4. Cart refreshes automatically
5. If last item removed, empty state shows

## Technical Notes

### Bootstrap 5 Integration:

- Uses Bootstrap's offcanvas component
- Requires Bootstrap JavaScript to be loaded
- Offcanvas instance created on first open
- Uses `data-bs-dismiss="offcanvas"` for closing

### Reactive State Management:

- Cart updates propagate via `CartService.cart$` observable
- All components subscribing to `cart$` update automatically
- No manual refresh needed

### API Integration:

- `GET /api/cart` - Load cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/{id}` - Update item quantity
- `DELETE /api/cart/items/{id}` - Remove item from cart

### Error Handling:

- 401 errors redirect to login (session expired)
- Network errors show alert messages
- Loading states prevent duplicate requests
- Confirmation dialogs for destructive actions

## Testing Checklist

- [ ] Cart icon opens offcanvas when clicked
- [ ] Cart badge shows correct item count
- [ ] Product detail page allows quantity selection
- [ ] Add to cart works with authentication check
- [ ] Success message appears after adding to cart
- [ ] Cart offcanvas shows loading state
- [ ] Empty cart state displays correctly
- [ ] Cart items display with images and details
- [ ] Increase quantity button works
- [ ] Decrease quantity button works (removes if quantity = 1)
- [ ] Remove button shows confirmation
- [ ] Total amount calculates correctly
- [ ] Proceed to checkout button navigates to `/checkout`
- [ ] View full cart button navigates to `/cart`
- [ ] Cart badge updates after any cart change
- [ ] Logout button is visible in user dropdown
- [ ] Session expiration redirects to login

## Known Issues and Future Enhancements

### Fixed Issues:

✅ Logout button not visible - was already present in dropdown, just needed proper testing
✅ Cart functionality placeholder - now fully implemented
✅ Cart navigation - changed to offcanvas instead of routing

### Future Enhancements:

- Add animations for cart item updates
- Add product stock validation
- Add "Recently Added" indicator
- Add cart item recommendations
- Add bulk actions (clear all, save for later)
- Add cart expiration notice
- Add coupon/promo code input in offcanvas

## Developer Notes

### Bootstrap Declaration:

```typescript
declare var bootstrap: any;
```

This allows TypeScript to recognize Bootstrap's JavaScript objects without installing type definitions.

### Offcanvas Initialization:

```typescript
const offcanvasElement = document.getElementById("cartOffcanvas");
if (!this.cartOffcanvas) {
  this.cartOffcanvas = new bootstrap.Offcanvas(offcanvasElement);
}
this.cartOffcanvas.show();
```

### Cart Item Update Pattern:

```typescript
this.updatingItemId = item.id;
this.cartService.updateCartItem(item.id, { quantity: newQuantity }).subscribe({
  next: () => {
    this.updatingItemId = null;
  },
  error: (err) => {
    // Handle error
    this.updatingItemId = null;
  },
});
```

## Related Documentation

- [SHOPPING_FLOW_GUIDE.md](./SHOPPING_FLOW_GUIDE.md) - Complete shopping flow documentation
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API endpoint reference
- [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md) - Frontend integration guide

---

**Last Updated:** November 3, 2025
