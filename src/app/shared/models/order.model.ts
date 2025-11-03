/**
 * Order related models
 */

export interface Order {
  id: string;
  userId: string;
  orderDate: string;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  itemCount?: number;
}

export interface OrderDetail extends Order {
  shippingAddress: string;
  orderItems?: OrderItem[];
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CreateOrderRequest {
  shippingAddress: string;
  paymentMethod: PaymentMethod;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export enum OrderStatus {
  Pending = 0,
  Processing = 1,
  Shipped = 2,
  Completed = 3,
  Cancelled = 4
}

export enum PaymentMethod {
  CashOnDelivery = 0,
  PayPal = 1,
  BankTransfer = 2,
  CreditCard = 3
}
