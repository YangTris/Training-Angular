import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from 'src/app/core/services/order.service';
import {
  Order,
  OrderStatus,
  PaymentMethod,
  PaginatedResult,
  UpdateOrderStatusRequest,
} from 'src/app/shared/models';

@Component({
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css'],
})
export class AdminOrdersComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  timeoutIds: number[] = [];

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  totalItems = 0;

  // Modal
  showStatusModal = false;
  selectedOrder: Order | null = null;
  selectedStatus: OrderStatus = OrderStatus.Pending;

  // Enums for template
  OrderStatus = OrderStatus;
  PaymentMethod = PaymentMethod;
  Math = Math;

  constructor(private orderService: OrderService, private router: Router) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  ngOnDestroy(): void {
    this.timeoutIds.forEach((id) => clearTimeout(id));
    this.timeoutIds = [];
  }

  /**
   * Load all orders (admin view)
   */
  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.orderService
      .getAllOrders({
        pageNumber: this.currentPage,
        pageSize: this.pageSize,
      })
      .subscribe({
        next: (result: PaginatedResult<Order>) => {
          this.orders = result.items;
          this.totalPages = result.totalPages;
          this.totalItems = result.totalItems;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading orders:', error);
          this.errorMessage = 'Failed to load orders. Please try again.';
          this.isLoading = false;
        },
      });
  }

  /**
   * Open status update modal
   */
  openStatusModal(order: Order): void {
    this.selectedOrder = order;
    this.selectedStatus = order.status;
    this.showStatusModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  /**
   * Close status modal
   */
  closeStatusModal(): void {
    this.showStatusModal = false;
    this.selectedOrder = null;
  }

  /**
   * Update order status
   */
  updateStatus(): void {
    if (!this.selectedOrder) return;

    this.isLoading = true;
    this.errorMessage = '';

    // Ensure we send the numeric value of the enum
    const updateRequest: UpdateOrderStatusRequest = {
      status: this.selectedStatus
    };

    this.orderService
      .updateOrderStatus(this.selectedOrder.id, updateRequest)
      .subscribe({
        next: () => {
          this.successMessage = 'Order status updated successfully!';
          this.closeStatusModal();
          this.loadOrders(); // Reload to get updated data
          this.isLoading = false;

          // Clear success message after 3 seconds
          const timeoutId = window.setTimeout(() => {
            this.successMessage = '';
          }, 3000);
          this.timeoutIds.push(timeoutId);
        },
        error: (error) => {
          console.error('Error updating order status:', error);
          console.error('Full error object:', JSON.stringify(error, null, 2));
          this.errorMessage =
            error.error?.title ||
            error.error?.message ||
            'Failed to update order status. Please try again.';
          this.isLoading = false;
        },
      });
  }

  /**
   * Navigate to order detail page
   */
  viewOrderDetail(orderId: string): void {
    this.router.navigate(['/orders', orderId]);
  }

  /**
   * Get status badge CSS class
   */
  getStatusBadgeClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Pending:
        return 'bg-warning text-dark';
      case OrderStatus.Processing:
        return 'bg-info text-white';
      case OrderStatus.Shipped:
        return 'bg-primary text-white';
      case OrderStatus.Completed:
        return 'bg-success text-white';
      case OrderStatus.Cancelled:
        return 'bg-danger text-white';
      default:
        return 'bg-secondary text-white';
    }
  }

  /**
   * Get status display text
   */
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

  /**
   * Get payment method display text
   */
  getPaymentMethodText(method: PaymentMethod): string {
    switch (method) {
      case PaymentMethod.CashOnDelivery:
        return 'Cash on Delivery';
      case PaymentMethod.PayPal:
        return 'PayPal';
      case PaymentMethod.BankTransfer:
        return 'Bank Transfer';
      case PaymentMethod.CreditCard:
        return 'Credit Card';
      default:
        return 'Unknown';
    }
  }

  /**
   * Pagination methods
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadOrders();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadOrders();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadOrders();
    }
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
