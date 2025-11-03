import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import {
  Cart,
  AddCartItemRequest,
  UpdateCartItemRequest,
} from 'src/app/shared/models';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = 'http://localhost:5296/api/cart';

  // Cart state management
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  public cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get current user's cart
   */
  getCart(): Observable<Cart> {
    return this.http
      .get<Cart>(this.apiUrl)
      .pipe(tap((cart) => this.cartSubject.next(cart)));
  }

  /**
   * Add item to cart
   */
  addToCart(request: AddCartItemRequest): Observable<Cart> {
    return this.http
      .post<Cart>(`${this.apiUrl}/items`, request)
      .pipe(tap((cart) => this.cartSubject.next(cart)));
  }

  /**
   * Update cart item quantity
   */
  updateCartItem(
    cartItemId: string,
    request: UpdateCartItemRequest
  ): Observable<Cart> {
    return this.http
      .put<Cart>(`${this.apiUrl}/items/${cartItemId}`, request)
      .pipe(tap((cart) => this.cartSubject.next(cart)));
  }

  /**
   * Remove item from cart
   */
  removeCartItem(cartItemId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/items/${cartItemId}`).pipe(
      tap(() => {
        // Reload cart after item removal
        this.getCart().subscribe();
      })
    );
  }

  /**
   * Clear entire cart
   */
  clearCart(): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/clear`)
      .pipe(tap(() => this.cartSubject.next(null)));
  }

  /**
   * Get current cart value
   */
  getCartValue(): Cart | null {
    return this.cartSubject.value;
  }

  /**
   * Get cart item count
   */
  getCartItemCount(): number {
    const cart = this.cartSubject.value;
    return cart ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  }
}
