import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Cart } from '../shared/models';

/**
 * Cart state store using BehaviorSubject pattern
 * Provides centralized cart state management across the application
 */
@Injectable({
  providedIn: 'root'
})
export class CartStore {
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  private itemCountSubject = new BehaviorSubject<number>(0);

  public cart$: Observable<Cart | null> = this.cartSubject.asObservable();
  public itemCount$: Observable<number> = this.itemCountSubject.asObservable();

  /**
   * Update the cart state
   */
  updateCart(cart: Cart): void {
    this.cartSubject.next(cart);
    this.updateItemCount(cart);
  }

  /**
   * Get current cart value synchronously
   */
  getCartValue(): Cart | null {
    return this.cartSubject.value;
  }

  /**
   * Clear the cart
   */
  clearCart(): void {
    this.cartSubject.next(null);
    this.itemCountSubject.next(0);
  }

  /**
   * Update item count based on cart items
   */
  private updateItemCount(cart: Cart | null): void {
    if (!cart || !cart.items) {
      this.itemCountSubject.next(0);
      return;
    }
    const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    this.itemCountSubject.next(count);
  }
}
