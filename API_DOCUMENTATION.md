# API Documentation for Frontend Developers

## Base URL

```
Development: http://localhost:5296/api
```

## Table of Contents

1. [Authentication](#authentication)
2. [Products](#products)
3. [Categories](#categories)
4. [Cart](#cart)
5. [Orders](#orders)
6. [Users](#users)
7. [Common Models](#common-models)
8. [Error Handling](#error-handling)

---

## Authentication

All authenticated endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

### Register a New User

**Endpoint:** `POST /api/auth/register`

**Access:** Public

**Request Body:**

```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "password": "P@ssw0rd"
}
```

**Response:** `201 Created`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "createdAt": "2025-10-30T10:30:00Z"
}
```

---

### Login

**Endpoint:** `POST /api/auth/login`

**Access:** Public

**Request Body:**

```json
{
  "email": "john.doe@example.com",
  "password": "P@ssw0rd"
}
```

**Response:** `200 OK`

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2025-10-30T11:00:00Z",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com"
}
```

**Error Response:** `401 Unauthorized`

```json
{
  "message": "Invalid credentials"
}
```

---

### Test Authentication

**Endpoint:** `GET /api/auth/test-auth`

**Access:** Authenticated (User role required)

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Response:** `200 OK`

```json
{
  "message": "Authentication is working!",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "userRoles": ["User"]
}
```

---

### Test Public Endpoint

**Endpoint:** `GET /api/auth/test-public`

**Access:** Public

**Response:** `200 OK`

```json
{
  "message": "This is a public endpoint"
}
```

---

## Products

### Get All Products (Paginated)

**Endpoint:** `GET /api/product`

**Access:** Public

**Query Parameters:**

- `pageNumber` (int, optional, default: 1) - Page number
- `pageSize` (int, optional, default: 8) - Items per page
- `searchTerm` (string, optional) - Search in product name/description
- `sortBy` (string, optional, default: "CreatedAt") - Sort field
- `isDescending` (bool, optional, default: false) - Sort direction

**Example Request:**

```
GET /api/product?pageNumber=1&pageSize=10&searchTerm=laptop&sortBy=Price&isDescending=true
```

**Response:** `200 OK`

```json
{
  "items": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "Gaming Laptop",
      "description": "High performance gaming laptop",
      "price": 1299.99,
      "mainImageUrl": "https://example.com/images/laptop.jpg"
    }
  ],
  "totalItems": 50,
  "pageNumber": 1,
  "pageSize": 10,
  "totalPages": 5
}
```

---

### Get Product by ID

**Endpoint:** `GET /api/product/{productId}`

**Access:** Public

**Example Request:**

```
GET /api/product/3fa85f64-5717-4562-b3fc-2c963f66afa6
```

**Response:** `200 OK`

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "Gaming Laptop",
  "description": "High performance gaming laptop with RTX 4070",
  "price": 1299.99,
  "mainImageUrl": "https://example.com/images/laptop-main.jpg",
  "createdAt": "2025-10-15T10:00:00Z",
  "updatedAt": "2025-10-20T14:30:00Z",
  "categoryId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "images": [
    {
      "id": "1a2b3c4d-5e6f-7890-abcd-ef1234567890",
      "imageUrl": "https://example.com/images/laptop-main.jpg"
    },
    {
      "id": "9f8e7d6c-5b4a-3210-fedc-ba0987654321",
      "imageUrl": "https://example.com/images/laptop-side.jpg"
    }
  ]
}
```

**Error Response:** `404 Not Found`

```json
{
  "message": "Product 3fa85f64-5717-4562-b3fc-2c963f66afa6 not found"
}
```

---

### Create Product

**Endpoint:** `POST /api/product`

**Access:** Public (consider adding `[Authorize(Roles = "Admin")]` in production)

**Request Body:**

```json
{
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse with 6 buttons",
  "price": 29.99,
  "categoryId": "7c9e6679-7425-40de-944b-e07fc1f90ae7"
}
```

**Response:** `201 Created`

```json
{
  "id": "new-product-guid",
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse with 6 buttons",
  "price": 29.99,
  "mainImageUrl": "https://vyghvmdysxqvocgvytoe.supabase.co/storage/v1/object/public/Training_img/default_img.jpg",
  "createdAt": "2025-10-30T10:30:00Z",
  "updatedAt": "2025-10-30T10:30:00Z",
  "categoryId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "images": [
    {
      "id": "auto-generated-guid",
      "imageUrl": "https://vyghvmdysxqvocgvytoe.supabase.co/storage/v1/object/public/Training_img/default_img.jpg",
      "isMain": true
    }
  ]
}
```

**Location Header:**

```
Location: /api/product/new-product-guid
```

**Error Responses:**

`400 Bad Request` - Invalid data

```json
{
  "message": "Price cannot be negative"
}
```

`404 Not Found` - Category doesn't exist

```json
{
  "message": "Category 7c9e6679-7425-40de-944b-e07fc1f90ae7 does not exist"
}
```

---

### Update Product

**Endpoint:** `PUT /api/product/{productId}`

**Access:** Public (consider adding `[Authorize(Roles = "Admin")]` in production)

**Request Body:**

```json
{
  "name": "Wireless Gaming Mouse",
  "description": "Updated description with RGB lighting",
  "price": 34.99
}
```

**Response:** `204 No Content`

**Error Responses:**

`404 Not Found`

```json
{
  "message": "Product {productId} not found"
}
```

`400 Bad Request`

```json
{
  "message": "Price cannot be negative"
}
```

---

### Delete Product

**Endpoint:** `DELETE /api/product/{productId}`

**Access:** Public (consider adding `[Authorize(Roles = "Admin")]` in production)

**Response:** `204 No Content`

**Error Response:** `404 Not Found`

**Note:** Products are soft-deleted (marked as `IsDeleted = true`, not physically removed from database).

---

## Categories

### Get All Categories

**Endpoint:** `GET /api/category`

**Access:** Public

**Response:** `200 OK`

```json
[
  {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "name": "Electronics",
    "description": "Electronic devices and accessories"
  },
  {
    "id": "8d0f7780-8536-51ef-c4ad-3d084e2f91bf",
    "name": "Books",
    "description": "Physical and digital books"
  }
]
```

---

### Get Category by ID

**Endpoint:** `GET /api/category/{categoryId}`

**Access:** Public

**Response:** `200 OK`

```json
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "name": "Electronics",
  "description": "Electronic devices and accessories",
  "createdAt": "2025-10-01T10:00:00Z",
  "updatedAt": "2025-10-01T10:00:00Z"
}
```

**Error Response:** `404 Not Found`

---

### Create Category

**Endpoint:** `POST /api/category`

**Access:** Admin only

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Request Body:**

```json
{
  "name": "Home Appliances",
  "description": "Kitchen and household appliances"
}
```

**Response:** `201 Created`

```json
{
  "id": "new-category-guid",
  "name": "Home Appliances",
  "description": "Kitchen and household appliances",
  "createdAt": "2025-10-30T10:30:00Z",
  "updatedAt": "2025-10-30T10:30:00Z"
}
```

**Error Response:** `403 Forbidden` (if not admin)

---

### Update Category

**Endpoint:** `PUT /api/category/{categoryId}`

**Access:** Admin only

**Request Body:**

```json
{
  "name": "Consumer Electronics",
  "description": "Updated description"
}
```

**Response:** `204 No Content`

---

### Delete Category

**Endpoint:** `DELETE /api/category/{categoryId}`

**Access:** Admin only

**Response:** `204 No Content`

**Note:** Categories are soft-deleted.

---

## Cart

All cart endpoints require authentication.

### Get Current User's Cart

**Endpoint:** `GET /api/cart`

**Access:** Authenticated

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Response:** `200 OK`

```json
{
  "id": "cart-guid",
  "userId": "user-guid",
  "items": [
    {
      "id": "cart-item-guid",
      "productId": "product-guid",
      "productName": "Gaming Laptop",
      "quantity": 1,
      "unitPrice": 1299.99,
      "totalPrice": 1299.99,
      "imageUrl": "https://example.com/images/laptop.jpg"
    },
    {
      "id": "cart-item-guid-2",
      "productId": "product-guid-2",
      "productName": "Wireless Mouse",
      "quantity": 2,
      "unitPrice": 29.99,
      "totalPrice": 59.98,
      "imageUrl": "https://example.com/images/mouse.jpg"
    }
  ],
  "totalAmount": 1359.97
}
```

**Note:** If the user doesn't have a cart yet, return empty cart.

---

### Add Item to Cart

**Endpoint:** `POST /api/cart/items`

**Access:** Authenticated

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Request Body:**

```json
{
  "productId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "quantity": 2
}
```

**Response:** `200 OK`

```json
{
  "id": "cart-guid",
  "userId": "user-guid",
  "items": [
    {
      "id": "new-cart-item-guid",
      "productId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "productName": "Gaming Laptop",
      "quantity": 2,
      "unitPrice": 1299.99,
      "totalPrice": 2599.98,
      "imageUrl": "https://example.com/images/laptop.jpg"
    }
  ],
  "totalAmount": 2599.98
}
```

**Error Responses:**

`404 Not Found` - Product doesn't exist

```json
{
  "message": "Product not found"
}
```

`400 Bad Request` - Invalid quantity

```json
{
  "message": "Quantity must be greater than zero"
}
```

---

### Update Cart Item Quantity

**Endpoint:** `PUT /api/cart/items/{cartItemId}`

**Access:** Authenticated

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Request Body:**

```json
{
  "quantity": 3
}
```

**Response:** `200 OK`

```json
{
  "id": "cart-guid",
  "userId": "user-guid",
  "items": [
    {
      "id": "cart-item-guid",
      "productId": "product-guid",
      "productName": "Gaming Laptop",
      "quantity": 3,
      "unitPrice": 1299.99,
      "totalPrice": 3899.97,
      "imageUrl": "https://example.com/images/laptop.jpg"
    }
  ],
  "totalAmount": 3899.97
}
```

**Error Responses:**

`404 Not Found` - Cart item doesn't exist or doesn't belong to user

```json
{
  "message": "Cart item not found"
}
```

---

### Remove Item from Cart

**Endpoint:** `DELETE /api/cart/items/{cartItemId}`

**Access:** Authenticated

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Response:** `204 No Content`

**Error Response:** `404 Not Found`

---

### Clear Cart

**Endpoint:** `DELETE /api/cart/clear`

**Access:** Authenticated

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Response:** `204 No Content`

**Note:** Removes all items from the cart but keeps the cart itself.

---

## Orders

All order endpoints require authentication.

### Create Order from Cart

**Endpoint:** `POST /api/order`

**Access:** Authenticated

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Request Body:**

```json
{
  "shippingAddress": "123 Main St, Springfield, IL 62701",
  "paymentMethod": 0
}
```

**Payment Method Values:**

- `0` - CashOnDelivery
- `1` - PayPal
- `2` - BankTransfer
- `3` - CreditCard

**Response:** `201 Created`

```json
{
  "id": "order-guid",
  "userId": "user-guid",
  "orderDate": "2025-10-30T10:30:00Z",
  "totalAmount": 1359.97,
  "status": 0,
  "paymentMethod": 0,
  "shippingAddress": "123 Main St, Springfield, IL 62701",
  "items": [
    {
      "id": "order-item-guid",
      "productId": "product-guid",
      "productName": "Gaming Laptop",
      "quantity": 1,
      "unitPrice": 1299.99,
      "totalPrice": 1299.99
    },
    {
      "id": "order-item-guid-2",
      "productId": "product-guid-2",
      "productName": "Wireless Mouse",
      "quantity": 2,
      "unitPrice": 29.99,
      "totalPrice": 59.98
    }
  ]
}
```

**Error Responses:**

`400 Bad Request` - Cart is empty or shipping address missing

```json
{
  "message": "Shipping address is required"
}
```

`404 Not Found` - Cart not found

**Note:** After order creation, the cart is automatically cleared.

---

### Get My Orders (Paginated)

**Endpoint:** `GET /api/order`

**Access:** Authenticated

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Query Parameters:**

- `pageNumber` (int, optional, default: 1)
- `pageSize` (int, optional, default: 8)
- `searchTerm` (string, optional)
- `sortBy` (string, optional, default: "CreatedAt")
- `isDescending` (bool, optional, default: false)

**Example Request:**

```
GET /api/order?pageNumber=1&pageSize=10&sortBy=OrderDate&isDescending=true
```

**Response:** `200 OK`

```json
{
  "items": [
    {
      "id": "order-guid",
      "userId": "user-guid",
      "orderDate": "2025-10-30T10:30:00Z",
      "totalAmount": 1359.97,
      "status": 1,
      "paymentMethod": 0,
      "itemCount": 2
    },
    {
      "id": "order-guid-2",
      "userId": "user-guid",
      "orderDate": "2025-10-25T14:20:00Z",
      "totalAmount": 49.99,
      "status": 3,
      "paymentMethod": 1,
      "itemCount": 1
    }
  ],
  "totalItems": 5,
  "pageNumber": 1,
  "pageSize": 10,
  "totalPages": 1
}
```

**Order Status Values:**

- `0` - Pending
- `1` - Processing
- `2` - Shipped
- `3` - Completed
- `4` - Cancelled

---

### Get Order by ID

**Endpoint:** `GET /api/order/{orderId}`

**Access:** Authenticated (users can only view their own orders; admins can view any order)

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Response:** `200 OK`

```json
{
  "id": "order-guid",
  "userId": "user-guid",
  "orderDate": "2025-10-30T10:30:00Z",
  "totalAmount": 1359.97,
  "status": 1,
  "paymentMethod": 0,
  "shippingAddress": "123 Main St, Springfield, IL 62701",
  "items": [
    {
      "id": "order-item-guid",
      "productId": "product-guid",
      "productName": "Gaming Laptop",
      "quantity": 1,
      "unitPrice": 1299.99,
      "totalPrice": 1299.99
    },
    {
      "id": "order-item-guid-2",
      "productId": "product-guid-2",
      "productName": "Wireless Mouse",
      "quantity": 2,
      "unitPrice": 29.99,
      "totalPrice": 59.98
    }
  ]
}
```

**Error Responses:**

`404 Not Found` - Order doesn't exist or user doesn't have permission

```json
{
  "message": "Order not found"
}
```

---

### Update Order Status (Admin Only)

**Endpoint:** `PATCH /api/order/{orderId}/status`

**Access:** Admin only

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Request Body:**

```json
{
  "status": 2
}
```

**Status Values:**

- `0` - Pending
- `1` - Processing
- `2` - Shipped
- `3` - Completed
- `4` - Cancelled

**Response:** `204 No Content`

**Error Responses:**

`403 Forbidden` - User is not admin

`404 Not Found` - Order doesn't exist

`400 Bad Request` - Invalid status transition (implementation pending)

---

### Get All Orders (Admin Only)

**Endpoint:** `GET /api/order/all`

**Access:** Admin only

**Query Parameters:** Same as "Get My Orders"

**Example Request:**

```
GET /api/order/all?pageNumber=1&pageSize=20
```

**Response:** `200 OK` (same format as "Get My Orders" but includes all users' orders)

**Error Response:** `403 Forbidden` - User is not admin

---

## Users

### Get All Users (Paginated)

**Endpoint:** `GET /api/user`

**Access:** Public (consider adding authentication in production)

**Query Parameters:**

- `pageNumber` (int, optional, default: 1)
- `pageSize` (int, optional, default: 8)
- `searchTerm` (string, optional)
- `sortBy` (string, optional)
- `isDescending` (bool, optional, default: false)

**Response:** `200 OK`

```json
{
  "items": [
    {
      "id": "user-guid",
      "fullName": "John Doe",
      "email": "john.doe@example.com"
    },
    {
      "id": "user-guid-2",
      "fullName": "Jane Smith",
      "email": "jane.smith@example.com"
    }
  ],
  "totalItems": 25,
  "pageNumber": 1,
  "pageSize": 8,
  "totalPages": 4
}
```

---

### Get User by ID

**Endpoint:** `GET /api/user/{id}`

**Access:** Public (consider adding authentication in production)

**Response:** `200 OK`

```json
{
  "id": "user-guid",
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "createdAt": "2025-10-01T10:00:00Z"
}
```

**Error Response:** `404 Not Found`

---

### Update User

**Endpoint:** `PUT /api/user/{id}`

**Access:** Public (consider adding authentication + authorization in production)

**Request Body:**

```json
{
  "fullName": "John Updated Doe",
  "email": "john.updated@example.com"
}
```

**Response:** `204 No Content`

**Error Response:** `404 Not Found`

---

### Delete User

**Endpoint:** `DELETE /api/user/{id}`

**Access:** Public (consider adding admin authentication in production)

**Response:** `204 No Content`

**Error Response:** `404 Not Found`

---

### Assign Role to User

**Endpoint:** `POST /api/user/assign-role?id={userId}&role={roleName}`

**Access:** Public (should be admin-only in production)

**Query Parameters:**

- `id` (string) - User ID
- `role` (string) - Role name (e.g., "Admin", "User")

**Example:**

```
POST /api/user/assign-role?id=user-guid&role=Admin
```

**Response:** `204 No Content`

**Error Responses:**

`404 Not Found` - User doesn't exist

`400 Bad Request` - Role doesn't exist

---

## Common Models

### PaginatedResult<T>

Returned by paginated endpoints.

```json
{
  "items": [],
  "totalItems": 0,
  "pageNumber": 1,
  "pageSize": 10,
  "totalPages": 0
}
```

**Fields:**

- `items` (array) - Array of items for the current page
- `totalItems` (int) - Total number of items across all pages
- `pageNumber` (int) - Current page number (1-based)
- `pageSize` (int) - Number of items per page
- `totalPages` (int) - Total number of pages (calculated)

---

### PaginatedFilterParams

Query parameters for pagination and filtering.

**Parameters:**

- `pageNumber` (int, default: 1) - Page to retrieve (1-based)
- `pageSize` (int, default: 8) - Items per page
- `searchTerm` (string, optional) - Search query
- `sortBy` (string, default: "CreatedAt") - Field to sort by
- `isDescending` (bool, default: false) - Sort direction

**Example:**

```
GET /api/product?pageNumber=2&pageSize=20&searchTerm=laptop&sortBy=Price&isDescending=true
```

---

## Error Handling

The API uses standard HTTP status codes and returns error messages in a consistent format.

### Common Status Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `204 No Content` - Request succeeded with no response body
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or invalid credentials
- `403 Forbidden` - User doesn't have permission
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate email)
- `500 Internal Server Error` - Server error

### Error Response Format

```json
{
  "message": "Descriptive error message"
}
```

### Examples

**400 Bad Request:**

```json
{
  "message": "Price cannot be negative"
}
```

**401 Unauthorized:**

```json
{
  "message": "Invalid credentials"
}
```

**404 Not Found:**

```json
{
  "message": "Product 3fa85f64-5717-4562-b3fc-2c963f66afa6 not found"
}
```

**409 Conflict:**

```json
{
  "message": "Email john.doe@example.com is already in use."
}
```

---

## Authentication Flow

### For New Users

1. **Register**: `POST /api/auth/register`

   - Provide fullName, email, password
   - Receive user details (no token yet)

2. **Login**: `POST /api/auth/login`

   - Provide email, password
   - Receive JWT token and user info

3. **Store Token**: Save the token in sessionStorage

4. **Use Token**: Include in Authorization header for authenticated requests

### For Existing Users

1. **Login**: `POST /api/auth/login`
2. **Store Token**
3. **Use Token**

### Token Expiration

- Tokens expire after 30 minutes (configurable)
- When a token expires, the user must log in again
- `401 Unauthorized` response indicates expired/invalid token

---

## Example Frontend Code

### JavaScript/Fetch Example

```javascript
// Login and store token
async function login(email, password) {
  const response = await fetch("http://localhost:5296/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  const data = await response.json();
  localStorage.setItem("token", data.token);
  localStorage.setItem("userId", data.userId);
  return data;
}

// Make authenticated request
async function getCart() {
  const token = localStorage.getItem("token");

  const response = await fetch("http://localhost:5296/api/cart", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (response.status === 401) {
    // Token expired, redirect to login
    window.location.href = "/login";
    return;
  }

  return await response.json();
}

// Get paginated products
async function getProducts(page = 1, searchTerm = "") {
  const params = new URLSearchParams({
    pageNumber: page,
    pageSize: 10,
    searchTerm: searchTerm,
    sortBy: "CreatedAt",
    isDescending: true,
  });

  const response = await fetch(`http://localhost:5296/api/product?${params}`);
  return await response.json();
}

// Add item to cart
async function addToCart(productId, quantity) {
  const token = localStorage.getItem("token");

  const response = await fetch("http://localhost:5296/api/cart/items", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ productId, quantity }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
}

// Create order
async function createOrder(shippingAddress, paymentMethod = 0) {
  const token = localStorage.getItem("token");

  const response = await fetch("http://localhost:5296/api/order", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ shippingAddress, paymentMethod }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
}
```

---

### React/Axios Example

```javascript
import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: "http://localhost:5296/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
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

// API functions
export const authAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),

  register: (fullName, email, password) =>
    api.post("/auth/register", { fullName, email, password }),
};

export const productAPI = {
  getAll: (params) => api.get("/product", { params }),

  getById: (id) => api.get(`/product/${id}`),

  create: (data) => api.post("/product", data),

  update: (id, data) => api.put(`/product/${id}`, data),

  delete: (id) => api.delete(`/product/${id}`),
};

export const cartAPI = {
  get: () => api.get("/cart"),

  addItem: (productId, quantity) =>
    api.post("/cart/items", { productId, quantity }),

  updateItem: (cartItemId, quantity) =>
    api.put(`/cart/items/${cartItemId}`, { quantity }),

  removeItem: (cartItemId) => api.delete(`/cart/items/${cartItemId}`),

  clear: () => api.delete("/cart/clear"),
};

export const orderAPI = {
  create: (shippingAddress, paymentMethod) =>
    api.post("/order", { shippingAddress, paymentMethod }),

  getMyOrders: (params) => api.get("/order", { params }),

  getById: (id) => api.get(`/order/${id}`),
};

// Usage in component
import { productAPI, cartAPI } from "./api";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await productAPI.getAll({
          pageNumber: 1,
          pageSize: 10,
          sortBy: "CreatedAt",
          isDescending: true,
        });
        setProducts(response.data.items);
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const handleAddToCart = async (productId) => {
    try {
      await cartAPI.addItem(productId, 1);
      alert("Added to cart!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add to cart");
    }
  };

  // ... render logic
}
```

---

## Testing the API

### Using cURL

```bash
# Register
curl -X POST http://localhost:5296/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","email":"test@example.com","password":"P@ssw0rd"}'

# Login
curl -X POST http://localhost:5296/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"P@ssw0rd"}'

# Get products
curl http://localhost:5296/api/product?pageNumber=1&pageSize=10

# Get cart (authenticated)
curl http://localhost:5296/api/cart \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Add to cart (authenticated)
curl -X POST http://localhost:5296/api/cart/items \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"productId":"PRODUCT_GUID","quantity":2}'
```

---

## Seeded Test Accounts

The application comes with two pre-seeded accounts for testing:

### Admin Account

- **Email:** `admin@example.com`
- **Password:** `P@ssw0rd`
- **Roles:** Admin, User

### Regular User Account

- **Email:** `user@example.com`
- **Password:** `P@ssw0rd`
- **Roles:** User

---

## Notes and Best Practices

1. **Always include the Authorization header** for protected endpoints
2. **Handle token expiration** by redirecting to login on 401 responses
3. **Store tokens securely** (consider httpOnly cookies for production)
4. **Validate user input** on the frontend before sending requests
5. **Handle errors gracefully** and show user-friendly messages
6. **Use HTTPS in production** to protect tokens and sensitive data
7. **Implement refresh tokens** for better user experience (not yet implemented)
8. **Consider implementing rate limiting** on the frontend to prevent abuse
9. **GUIDs are case-insensitive** - the API accepts both lowercase and uppercase
10. **Pagination is 1-based** - first page is pageNumber=1, not 0

---

## Future Enhancements

Items marked as "TODO" or "consider adding" in the documentation:

1. Add proper authorization to Product CRUD operations (Admin only)
2. Add proper authorization to User management endpoints
3. Implement refresh token mechanism
4. Add order status transition validation
5. Add file upload endpoint for product images
6. Add search filters by category, price range, etc.
7. Add order history details endpoint
8. Add password reset functionality
9. Add email verification for new users
10. Add webhooks for order status changes

---

## Support

For questions or issues, contact the backend development team or refer to the main project README.

**Last Updated:** October 30, 2025
