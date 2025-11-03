import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from 'src/app/core/services/order.service';
import {
  OrderDetail,
  OrderStatus,
  PaymentMethod,
} from 'src/app/shared/models/order.model';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css'],
})
export class OrderDetailComponent implements OnInit {
  order: OrderDetail | null = null;
  isLoading = false;
  errorMessage = '';

  // Enums for template
  OrderStatus = OrderStatus;
  PaymentMethod = PaymentMethod;

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrderDetail(orderId);
    } else {
      this.errorMessage = 'Order ID not found';
    }
  }

  loadOrderDetail(orderId: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.orderService.getOrderById(orderId).subscribe({
      next: (order) => {
        console.log('API received:', order);
        // Handle potential case sensitivity issues from API
        if (!order.orderItems && (order as any).Items) {
          order.orderItems = (order as any).Items;
        }

        this.order = order;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading order detail:', err);
        this.isLoading = false;

        if (err.status === 401) {
          this.errorMessage = 'Session expired. Please login again.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else if (err.status === 404) {
          this.errorMessage = 'Order not found.';
        } else {
          this.errorMessage = 'Failed to load order details. Please try again.';
        }
      },
    });
  }

  getStatusBadgeClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Pending:
        return 'bg-warning';
      case OrderStatus.Processing:
        return 'bg-info';
      case OrderStatus.Shipped:
        return 'bg-primary';
      case OrderStatus.Completed:
        return 'bg-success';
      case OrderStatus.Cancelled:
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getStatusText(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Pending:
        return 'Pending';
      case OrderStatus.Processing:
        return 'Processing';
      case OrderStatus.Shipped:
        return 'Shipped';
      case OrderStatus.Completed:
        return 'Completed';
      case OrderStatus.Cancelled:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }

  getPaymentMethodText(method: PaymentMethod): string {
    switch (method) {
      case PaymentMethod.CashOnDelivery:
        return 'Cash on Delivery';
      case PaymentMethod.CreditCard:
        return 'Credit Card';
      case PaymentMethod.PayPal:
        return 'PayPal';
      case PaymentMethod.BankTransfer:
        return 'Bank Transfer';
      default:
        return 'Unknown';
    }
  }

  getPaymentMethodIcon(method: PaymentMethod): string {
    switch (method) {
      case PaymentMethod.CashOnDelivery:
        return 'bi-cash-coin';
      case PaymentMethod.CreditCard:
        return 'bi-credit-card';
      case PaymentMethod.PayPal:
        return 'bi-paypal';
      case PaymentMethod.BankTransfer:
        return 'bi-bank';
      default:
        return 'bi-question-circle';
    }
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }
}
