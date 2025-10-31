# API Quick Reference Guide

Quick reference for common API workflows and endpoints.

## Base URL

```
http://localhost:5296/api
```

---

## 🔐 Authentication

| Action    | Method | Endpoint          | Auth Required |
| --------- | ------ | ----------------- | ------------- |
| Register  | POST   | `/auth/register`  | ❌            |
| Login     | POST   | `/auth/login`     | ❌            |
| Test Auth | GET    | `/auth/test-auth` | ✅ User       |

### Quick Login Flow

```javascript
// 1. Login
POST /api/auth/login
Body: { "email": "user@example.com", "password": "P@ssw0rd" }

// 2. Save token from response
Response: { "token": "...", "userId": "...", "email": "..." }

// 3. Use token in headers
Authorization: Bearer <token>
```

---

## 🛍️ Products

| Action               | Method | Endpoint                            | Auth Required |
| -------------------- | ------ | ----------------------------------- | ------------- |
| List all (paginated) | GET    | `/product?pageNumber=1&pageSize=10` | ❌            |
| Get by ID            | GET    | `/product/{id}`                     | ❌            |
| Create               | POST   | `/product`                          | ❌\*          |
| Update               | PUT    | `/product/{id}`                     | ❌\*          |
| Delete               | DELETE | `/product/{id}`                     | ❌\*          |

\*Should be Admin-only in production

### Quick Examples

```javascript
// Get products with search and sort
GET /api/product?searchTerm=laptop&sortBy=Price&isDescending=true

// Get product details with images
GET /api/product/3fa85f64-5717-4562-b3fc-2c963f66afa6

// Create product
POST /api/product
Body: {
  "name": "Product Name",
  "description": "Description",
  "price": 99.99,
  "categoryId": "category-guid"
}
```

---

## 📁 Categories

| Action    | Method | Endpoint         | Auth Required |
| --------- | ------ | ---------------- | ------------- |
| List all  | GET    | `/category`      | ❌            |
| Get by ID | GET    | `/category/{id}` | ❌            |
| Create    | POST   | `/category`      | ✅ Admin      |
| Update    | PUT    | `/category/{id}` | ✅ Admin      |
| Delete    | DELETE | `/category/{id}` | ✅ Admin      |

---

## 🛒 Cart (All require authentication)

| Action          | Method | Endpoint               | Returns            |
| --------------- | ------ | ---------------------- | ------------------ |
| Get cart        | GET    | `/cart`                | CartDTO with items |
| Add item        | POST   | `/cart/items`          | Updated CartDTO    |
| Update quantity | PUT    | `/cart/items/{itemId}` | Updated CartDTO    |
| Remove item     | DELETE | `/cart/items/{itemId}` | 204 No Content     |
| Clear cart      | DELETE | `/cart/clear`          | 204 No Content     |

### Quick Cart Flow

```javascript
// 1. Get current cart
GET /api/cart
Headers: { "Authorization": "Bearer <token>" }

// 2. Add item to cart
POST /api/cart/items
Headers: { "Authorization": "Bearer <token>" }
Body: { "productId": "product-guid", "quantity": 2 }

// 3. Update quantity
PUT /api/cart/items/{cartItemId}
Body: { "quantity": 5 }

// 4. Remove item
DELETE /api/cart/items/{cartItemId}
```

---

## 📦 Orders (All require authentication)

| Action           | Method | Endpoint             | Auth Required |
| ---------------- | ------ | -------------------- | ------------- |
| Create from cart | POST   | `/order`             | ✅ User       |
| Get my orders    | GET    | `/order`             | ✅ User       |
| Get by ID        | GET    | `/order/{id}`        | ✅ User/Admin |
| Update status    | PATCH  | `/order/{id}/status` | ✅ Admin      |
| Get all orders   | GET    | `/order/all`         | ✅ Admin      |

### Quick Order Flow

```javascript
// 1. Create order from cart (cart will be cleared)
POST /api/order
Headers: { "Authorization": "Bearer <token>" }
Body: {
  "shippingAddress": "123 Main St, City, State 12345",
  "paymentMethod": 0
}

// 2. Get my orders
GET /api/order?pageNumber=1&pageSize=10

// 3. Get order details
GET /api/order/{orderId}

// 4. Admin: Update order status
PATCH /api/order/{orderId}/status
Body: { "status": 2 }
```

### Payment Methods

```
0 = CashOnDelivery
1 = PayPal
2 = BankTransfer
3 = CreditCard
```

### Order Statuses

```
0 = Pending
1 = Processing
2 = Shipped
3 = Completed
4 = Cancelled
```

---

## 👥 Users

| Action      | Method | Endpoint                                | Auth Required |
| ----------- | ------ | --------------------------------------- | ------------- |
| List all    | GET    | `/user`                                 | ❌\*          |
| Get by ID   | GET    | `/user/{id}`                            | ❌\*          |
| Update      | PUT    | `/user/{id}`                            | ❌\*          |
| Delete      | DELETE | `/user/{id}`                            | ❌\*          |
| Assign role | POST   | `/user/assign-role?id={id}&role={role}` | ❌\*          |

\*Should require authentication/authorization in production

---

## 🔄 Common Workflows

### User Registration & First Purchase

```javascript
// 1. Register
POST /api/auth/register
Body: { "fullName": "John Doe", "email": "john@example.com", "password": "P@ssw0rd" }

// 2. Login
POST /api/auth/login
Body: { "email": "john@example.com", "password": "P@ssw0rd" }
// Save token from response

// 3. Browse products
GET /api/product?pageNumber=1&pageSize=10

// 4. Add to cart
POST /api/cart/items
Headers: { "Authorization": "Bearer <token>" }
Body: { "productId": "product-guid", "quantity": 1 }

// 5. View cart
GET /api/cart
Headers: { "Authorization": "Bearer <token>" }

// 6. Create order
POST /api/order
Headers: { "Authorization": "Bearer <token>" }
Body: { "shippingAddress": "123 Main St", "paymentMethod": 0 }

// 7. View order history
GET /api/order
Headers: { "Authorization": "Bearer <token>" }
```

### Admin: Manage Products

```javascript
// 1. Login as admin
POST /api/auth/login
Body: { "email": "admin@example.com", "password": "P@ssw0rd" }

// 2. Create category
POST /api/category
Headers: { "Authorization": "Bearer <admin-token>" }
Body: { "name": "Electronics", "description": "Electronic devices" }

// 3. Create product
POST /api/product
Body: {
  "name": "Laptop",
  "description": "Gaming laptop",
  "price": 1299.99,
  "categoryId": "category-guid"
}

// 4. Update product
PUT /api/product/{productId}
Body: { "name": "Gaming Laptop", "description": "Updated", "price": 1199.99 }

// 5. View all orders
GET /api/order/all?pageNumber=1&pageSize=20
Headers: { "Authorization": "Bearer <admin-token>" }

// 6. Update order status
PATCH /api/order/{orderId}/status
Headers: { "Authorization": "Bearer <admin-token>" }
Body: { "status": 2 }
```

---

## 📄 Pagination Parameters

All paginated endpoints accept these query parameters:

| Parameter      | Type   | Default     | Description                |
| -------------- | ------ | ----------- | -------------------------- |
| `pageNumber`   | int    | 1           | Page to retrieve (1-based) |
| `pageSize`     | int    | 8           | Items per page             |
| `searchTerm`   | string | null        | Search query               |
| `sortBy`       | string | "CreatedAt" | Field to sort by           |
| `isDescending` | bool   | false       | Sort descending            |

### Paginated Response Format

```json
{
  "items": [...],
  "totalItems": 50,
  "pageNumber": 1,
  "pageSize": 10,
  "totalPages": 5
}
```

---

## ⚠️ Error Responses

| Status | Meaning      | Example                                  |
| ------ | ------------ | ---------------------------------------- |
| 400    | Bad Request  | Invalid data, negative price             |
| 401    | Unauthorized | Missing/invalid token, wrong credentials |
| 403    | Forbidden    | Not admin when admin required            |
| 404    | Not Found    | Resource doesn't exist                   |
| 409    | Conflict     | Email already exists                     |
| 500    | Server Error | Internal error                           |

### Error Format

```json
{
  "message": "Descriptive error message"
}
```

---

## 🧪 Test Accounts

### Admin

```
Email: admin@example.com
Password: P@ssw0rd
Roles: Admin, User
```

### User

```
Email: user@example.com
Password: P@ssw0rd
Roles: User
```

---

## 📋 Common Header Patterns

### Public Endpoints

```javascript
{
  "Content-Type": "application/json"
}
```

### Authenticated Endpoints

```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}
```

---

## 🚀 Quick Start Code Snippets

### Vanilla JavaScript

```javascript
// Login helper
async function login(email, password) {
  const response = await fetch("http://localhost:5296/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  localStorage.setItem("token", data.token);
  return data;
}

// Authenticated GET
async function authenticatedGet(endpoint) {
  const token = localStorage.getItem("token");
  const response = await fetch(`http://localhost:5296/api${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.json();
}

// Authenticated POST
async function authenticatedPost(endpoint, body) {
  const token = localStorage.getItem("token");
  const response = await fetch(`http://localhost:5296/api${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return response.json();
}

// Usage
await login("user@example.com", "P@ssw0rd");
const products = await authenticatedGet("/product?pageNumber=1");
const cart = await authenticatedGet("/cart");
await authenticatedPost("/cart/items", { productId: "guid", quantity: 2 });
```

### React + Axios

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5296/api",
});

// Add token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Usage
await api.post("/auth/login", { email, password });
const { data } = await api.get("/product", { params: { pageNumber: 1 } });
await api.post("/cart/items", { productId, quantity: 1 });
```

---

## 💡 Tips

1. **Token expires in 30 minutes** - store expiration and refresh before it expires
2. **GUIDs are case-insensitive** - `3FA85F64...` and `3fa85f64...` are the same
3. **Pagination is 1-based** - first page is 1, not 0
4. **Cart auto-creates** - GET /api/cart creates cart if none exists
5. **Creating order clears cart** - cart is emptied after successful order
6. **Soft deletes** - deleted items are marked IsDeleted=true, not physically removed
7. **Default image added automatically** - new products get a default image
8. **Products include main image** - ProductListDTO includes mainImageUrl
9. **Order details include all images** - ProductDetailDTO includes full image collection
10. **Admin can view any order** - regular users only see their own

---

## 🔗 Related Documentation

- [Full API Documentation](./API_DOCUMENTATION.md) - Detailed documentation with all endpoints
- [README](./README.md) - Project setup and overview
- [Copilot Instructions](./.github/copilot-instructions.md) - Project architecture notes

---

**Last Updated:** October 30, 2025
