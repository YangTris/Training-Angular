import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Order,
  OrderDetail,
  CreateOrderRequest,
  PaginatedResult,
  PaginationParams,
} from 'src/app/shared/models';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = 'http://localhost:5296/api/order';

  constructor(private http: HttpClient) {}

  /**
   * Create order from cart
   */
  createOrder(request: CreateOrderRequest): Observable<OrderDetail> {
    return this.http.post<OrderDetail>(this.apiUrl, request);
  }

  /**
   * Get current user's orders (paginated)
   */
  getMyOrders(params?: PaginationParams): Observable<PaginatedResult<Order>> {
    return this.http.get<PaginatedResult<Order>>(this.apiUrl, {
      params: params as any,
    });
  }

  /**
   * Get order by ID
   */
  getOrderById(orderId: string): Observable<OrderDetail> {
    return this.http.get<OrderDetail>(`${this.apiUrl}/${orderId}`);
  }
}
