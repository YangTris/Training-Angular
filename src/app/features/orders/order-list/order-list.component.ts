import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from 'src/app/core/services/order.service';
import {
  Order,
  OrderStatus,
  PaymentMethod,
} from 'src/app/shared/models/order.model';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css'],
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  isLoading = false;
  errorMessage = '';

  // Pagination
  currentPage = 1;
  pageSize = 5;
  totalPages = 0;
  totalItems = 0;

  // Enums for template
  OrderStatus = OrderStatus;
  PaymentMethod = PaymentMethod;

  constructor(private orderService: OrderService, private router: Router) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(page: number = 1): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.currentPage = page;

    this.orderService
      .getMyOrders({
        pageNumber: page,
        pageSize: this.pageSize,
        sortBy: 'OrderDate',
        isDescending: true,
      })
      .subscribe({
        next: (result) => {
          this.orders = result.items;
          this.totalPages = result.totalPages;
          this.totalItems = result.totalItems;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading orders:', err);
          this.isLoading = false;

          if (err.status === 401) {
            this.errorMessage = 'Session expired. Please login again.';
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          } else {
            this.errorMessage = 'Failed to load orders. Please try again.';
          }
        },
      });
  }

  viewOrderDetail(orderId: string): void {
    this.router.navigate(['/orders', orderId]);
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

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.loadOrders(page);
    }
  }

  get pages(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(
      1,
      this.currentPage - Math.floor(maxPagesToShow / 2)
    );
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }
}
