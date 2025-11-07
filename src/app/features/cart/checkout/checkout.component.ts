import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CartService } from 'src/app/core/services/cart.service';
import { OrderService } from 'src/app/core/services/order.service';
import { Cart } from 'src/app/shared/models/cart.model';
import { PaymentMethod } from 'src/app/shared/models/order.model';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit, OnDestroy {
  checkoutForm!: FormGroup;
  cart: Cart | null = null;
  isLoading = false;
  isProcessing = false;
  errorMessage = '';
  timeoutIds: number[] = [];

  // Payment method options
  paymentMethods = [
    {
      value: PaymentMethod.CashOnDelivery,
      label: 'Cash on Delivery',
      icon: 'bi-cash-coin',
    },
    {
      value: PaymentMethod.CreditCard,
      label: 'Credit Card',
      icon: 'bi-credit-card',
    },
    { value: PaymentMethod.PayPal, label: 'PayPal', icon: 'bi-paypal' },
    {
      value: PaymentMethod.BankTransfer,
      label: 'Bank Transfer',
      icon: 'bi-bank',
    },
  ];

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadCart();
  }

  ngOnDestroy(): void {
    this.timeoutIds.forEach((id) => clearTimeout(id));
    this.timeoutIds = [];
  }

  initializeForm(): void {
    this.checkoutForm = this.fb.group({
      shippingAddress: ['', [Validators.required, Validators.minLength(10)]],
      paymentMethod: [PaymentMethod.CashOnDelivery, Validators.required],
    });
  }

  loadCart(): void {
    this.isLoading = true;
    this.cartService.getCart().subscribe({
      next: () => {
        this.cartService.cart$.subscribe((cart) => {
          this.cart = cart;
          this.isLoading = false;

          // Redirect if cart is empty
          if (!cart || cart.items.length === 0) {
            this.errorMessage =
              'Your cart is empty. Please add items before checkout.';
            const timeoutId = window.setTimeout(() => {
              this.router.navigate(['/products']);
            }, 2000);
            this.timeoutIds.push(timeoutId);
          }
        });
      },
      error: (err) => {
        console.error('Error loading cart:', err);
        this.isLoading = false;
        this.errorMessage = 'Failed to load cart. Please try again.';
      },
    });
  }

  placeOrder(): void {
    if (this.checkoutForm.invalid) {
      this.markFormGroupTouched(this.checkoutForm);
      return;
    }

    if (!this.cart || this.cart.items.length === 0) {
      this.errorMessage = 'Your cart is empty.';
      return;
    }

    this.isProcessing = true;
    this.errorMessage = '';

    const orderRequest = {
      shippingAddress: this.checkoutForm.value.shippingAddress,
      paymentMethod: this.checkoutForm.value.paymentMethod,
    };

    this.orderService.createOrder(orderRequest).subscribe({
      next: (order) => {
        this.isProcessing = false;

        this.cartService.clearCart().subscribe({
          next: () => {
            console.log('Cart cleared successfully after order creation');
          },
          error(err) {
            console.error('Error clearing cart after order creation:', err);
          },
          complete: () => {
            console.log('Redirecting to order detail page');
            this.router.navigate(['/orders', order.id]);
          },
        });
      },
      error: (err) => {
        this.isProcessing = false;
        console.error('Error creating order:', err);

        if (err.status === 401) {
          this.errorMessage = 'Session expired. Please login again.';
          const timeoutId = window.setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
          this.timeoutIds.push(timeoutId);
        } else {
          this.errorMessage =
            err.error?.message || 'Failed to place order. Please try again.';
        }
      },
    });
  }

  getPaymentMethodLabel(value: PaymentMethod): string {
    const method = this.paymentMethods.find((m) => m.value === value);
    return method ? method.label : 'Unknown';
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
