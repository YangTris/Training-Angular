import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { AuthStore } from 'src/app/store/auth.store';
import { CartService } from 'src/app/core/services/cart.service';
import { Cart, CartItem } from 'src/app/shared/models/cart.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  userEmail = '';
  cartItemCount = 0;
  cart: Cart | null = null;
  isLoadingCart = false;
  updatingItemId: string | null = null;

  constructor(
    private authService: AuthService,
    private authStore: AuthStore,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to auth state
    this.authStore.auth$.subscribe((auth) => {
      this.isLoggedIn = auth.isAuthenticated;
      this.userEmail = auth.email || '';

      // Load cart if user is logged in
      if (this.isLoggedIn) {
        this.loadCart();
      } else {
        this.cart = null;
        this.cartItemCount = 0;
      }
    });

    // Subscribe to cart changes
    this.cartService.cart$.subscribe((cart) => {
      this.cart = cart;
      this.cartItemCount = cart
        ? cart.items.reduce((sum, item) => sum + item.quantity, 0)
        : 0;
    });
  }

  loadCart(): void {
    this.isLoadingCart = true;
    this.cartService.getCart().subscribe({
      next: () => {
        this.isLoadingCart = false;
      },
      error: (err) => {
        console.error('Error loading cart:', err);
        this.isLoadingCart = false;
      },
    });
  }

  openCartOffcanvas(): void {
    // Reload cart to get latest data
    this.loadCart();

    // Open the offcanvas by adding Bootstrap's show class
    const offcanvasElement = document.getElementById('cartOffcanvas');
    if (offcanvasElement) {
      // Add classes to show the offcanvas
      offcanvasElement.classList.add('show');
      offcanvasElement.style.visibility = 'visible';

      // Add backdrop
      const backdrop = document.createElement('div');
      backdrop.className = 'offcanvas-backdrop fade show';
      backdrop.id = 'cart-backdrop';
      backdrop.onclick = () => this.closeCartOffcanvas();
      document.body.appendChild(backdrop);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px';
    }
  }

  closeCartOffcanvas(): void {
    const offcanvasElement = document.getElementById('cartOffcanvas');
    if (offcanvasElement) {
      offcanvasElement.classList.remove('show');
      offcanvasElement.style.visibility = 'hidden';
    }

    // Remove backdrop
    const backdrop = document.getElementById('cart-backdrop');
    if (backdrop) {
      backdrop.remove();
    }

    // Restore body scroll
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }

  increaseQuantity(item: CartItem): void {
    this.updatingItemId = item.id;
    const newQuantity = item.quantity + 1;

    this.cartService
      .updateCartItem(item.id, { quantity: newQuantity })
      .subscribe({
        next: () => {
          this.updatingItemId = null;
        },
        error: (err) => {
          console.error('Error updating cart item:', err);
          alert('Failed to update quantity. Please try again.');
          this.updatingItemId = null;
        },
      });
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity <= 1) {
      // If quantity is 1, remove the item instead
      this.removeItem(item);
      return;
    }

    this.updatingItemId = item.id;
    const newQuantity = item.quantity - 1;

    this.cartService
      .updateCartItem(item.id, { quantity: newQuantity })
      .subscribe({
        next: () => {
          this.updatingItemId = null;
        },
        error: (err) => {
          console.error('Error updating cart item:', err);
          alert('Failed to update quantity. Please try again.');
          this.updatingItemId = null;
        },
      });
  }

  removeItem(item: CartItem): void {
    if (!confirm(`Remove ${item.productName} from cart?`)) {
      return;
    }

    this.updatingItemId = item.id;

    this.cartService.removeCartItem(item.id).subscribe({
      next: () => {
        this.updatingItemId = null;
      },
      error: (err) => {
        console.error('Error removing cart item:', err);
        alert('Failed to remove item. Please try again.');
        this.updatingItemId = null;
      },
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
