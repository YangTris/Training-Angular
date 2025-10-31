# Frontend Developer Guide

Welcome! This guide will help you get started integrating with the MockTest API.

## 📚 Documentation Files

- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API reference with all endpoints, request/response examples, and authentication details
- **[API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md)** - Quick lookup table for common endpoints and workflows
- **[MockTest_API.postman_collection.json](./MockTest_API.postman_collection.json)** - Postman/Thunder Client collection for testing

## 🚀 Quick Start (5 minutes)

### 1. Make sure the API is running

```powershell
# In the project root directory
cd API
dotnet run
```

The API will be available at: `http://localhost:5296/api`

### 2. Test with the seeded accounts

**Regular User:**

- Email: `user@gmail.com.com`
- Password: `P@ssw0rd`

**Admin User:**

- Email: `admin@gmail.com.com`
- Password: `P@ssw0rd`

### 3. Try a quick test

```javascript
// Login
const response = await fetch("http://localhost:5296/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "user@gmail.com.com",
    password: "P@ssw0rd",
  }),
});

const { token } = await response.json();
console.log("Token:", token);

// Get products
const products = await fetch(
  "http://localhost:5296/api/product?pageNumber=1&pageSize=10"
);
const productData = await products.json();
console.log("Products:", productData);
```

## 📖 Common Use Cases

### Authentication Flow

```javascript
// 1. Login and save token
async function login(email, password) {
  const response = await fetch("http://localhost:5296/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  const data = await response.json();
  sessionStorage.setItem("token", data.token);
  sessionStorage.setItem("userId", data.userId);
  return data;
}

// 2. Use token for authenticated requests
async function getCart() {
  const token = sessionStorage.getItem("token");

  const response = await fetch("http://localhost:5296/api/cart", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (response.status === 401) {
    // Token expired - redirect to login
    window.location.href = "/login";
    return;
  }

  return await response.json();
}
```

### Shopping Flow

```javascript
// 1. Browse products
const products = await fetch(
  "http://localhost:5296/api/product?pageNumber=1&pageSize=8"
);
const productList = await products.json();

// 2. Add to cart (requires authentication)
async function addToCart(productId, quantity = 1) {
  const token = sessionStorage.getItem("token");

  const response = await fetch("http://localhost:5296/api/cart/items", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ productId, quantity }),
  });

  return await response.json();
}

// 3. Create order from cart
async function checkout(shippingAddress) {
  const token = sessionStorage.getItem("token");

  const response = await fetch("http://localhost:5296/api/order", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      shippingAddress,
      paymentMethod: 0, // 0=Cash on Delivery
    }),
  });

  return await response.json();
}
```

## 🎯 Key Endpoints

### Public (No Auth Required)

- `GET /api/product` - Get all products (paginated)
- `GET /api/product/{id}` - Get product details with images
- `GET /api/category` - Get all categories
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login

### Authenticated (Requires Token)

- `GET /api/cart` - Get user's cart
- `POST /api/cart/items` - Add item to cart
- `POST /api/order` - Create order from cart
- `GET /api/order` - Get user's orders
- `GET /api/order/{id}` - Get order details

### Admin Only

- `POST /api/category` - Create category
- `PATCH /api/order/{id}/status` - Update order status
- `GET /api/order/all` - Get all orders

## 🔑 Authentication

### Getting a Token

```javascript
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@gmail.com.com",
  "password": "P@ssw0rd"
}

// Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2025-10-30T11:00:00Z",
  "userId": "user-guid",
  "email": "user@gmail.com.com"
}
```

### Using the Token

```javascript
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Expiration

- Tokens expire after **30 minutes**
- When you receive a `401 Unauthorized`, redirect to login
- Store the token in `sessionStorage` or `sessionStorage`

## 📦 Response Formats

### Product List Response

```json
{
  "items": [
    {
      "id": "guid",
      "name": "Product Name",
      "description": "Description",
      "price": 99.99,
      "mainImageUrl": "https://..."
    }
  ],
  "totalItems": 50,
  "pageNumber": 1,
  "pageSize": 10,
  "totalPages": 5
}
```

### Product Detail Response

```json
{
  "id": "guid",
  "name": "Product Name",
  "description": "Detailed description",
  "price": 99.99,
  "mainImageUrl": "https://...",
  "categoryId": "guid",
  "createdAt": "2025-10-30T10:00:00Z",
  "updatedAt": "2025-10-30T10:00:00Z",
  "images": [
    {
      "id": "guid",
      "imageUrl": "https://...",
    }
  ]
}
```

### Cart Response

```json
{
  "id": "guid",
  "userId": "guid",
  "items": [
    {
      "id": "guid",
      "productId": "guid",
      "productName": "Product Name",
      "quantity": 2,
      "unitPrice": 99.99,
      "totalPrice": 199.98,
      "imageUrl": "https://..."
    }
  ],
  "totalAmount": 199.98
}
```

### Order Response

```json
{
  "id": "guid",
  "userId": "guid",
  "orderDate": "2025-10-30T10:30:00Z",
  "totalAmount": 199.98,
  "status": 0,
  "paymentMethod": 0,
  "shippingAddress": "123 Main St",
  "items": [
    {
      "id": "guid",
      "productId": "guid",
      "productName": "Product Name",
      "quantity": 2,
      "unitPrice": 99.99,
      "totalPrice": 199.98
    }
  ]
}
```

## 🔢 Enum Values

### Order Status

```javascript
const OrderStatus = {
  Pending: 0,
  Processing: 1,
  Shipped: 2,
  Completed: 3,
  Cancelled: 4,
};
```

### Payment Method

```javascript
const PaymentMethod = {
  CashOnDelivery: 0,
  PayPal: 1,
  BankTransfer: 2,
  CreditCard: 3,
};
```

## 🛠️ Testing with Postman

1. Import `MockTest_API.postman_collection.json` into Postman or Thunder Client
2. The collection includes variables:
   - `baseUrl` - API base URL (pre-configured)
   - `token` - Auto-set after login
   - `productId`, `categoryId`, etc. - Auto-set from responses
3. Start with "Auth > Login" to get a token
4. All authenticated requests will automatically use the saved token

## ⚠️ Error Handling

### Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `204 No Content` - Success (no response body)
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Duplicate (e.g., email exists)

### Error Response Format

```json
{
  "message": "Descriptive error message"
}
```

### Example Error Handling

```javascript
try {
  const response = await fetch("http://localhost:5296/api/cart/items", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ productId, quantity: 2 }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired
      window.location.href = "/login";
      return;
    }

    const error = await response.json();
    throw new Error(error.message || "Request failed");
  }

  const cart = await response.json();
  return cart;
} catch (error) {
  console.error("Error adding to cart:", error);
  alert(error.message);
}
```

## 📋 Pagination

All paginated endpoints support these query parameters:

```javascript
{
  pageNumber: 1,        // Current page (1-based)
  pageSize: 8,         // Items per page
  searchTerm: 'laptop', // Optional search
  sortBy: 'Price',      // Field to sort by
  isDescending: true    // Sort direction
}
```

Example:

```javascript
const url = new URLSearchParams({
  pageNumber: 1,
  pageSize: 20,
  searchTerm: "gaming",
  sortBy: "Price",
  isDescending: true,
});

const response = await fetch(`http://localhost:5296/api/product?${url}`);
```

## 💡 Tips & Best Practices

1. **Token Management**

   - Store token in sessionStorage
   - Check expiration before making requests
   - Clear token on logout or 401 response

2. **Error Handling**

   - Always handle 401 (redirect to login)
   - Show user-friendly error messages
   - Log errors for debugging

3. **Loading States**

   - Show loading indicators during API calls
   - Disable buttons while submitting forms
   - Handle race conditions

4. **Optimization**

   - Cache product listings when appropriate
   - Debounce search inputs
   - Use pagination to limit data transfer

5. **Security**
   - Never expose tokens in URLs or logs
   - Use HTTPS in production
   - Validate input before sending to API

## 📱 Example React Component

```jsx
import { useState, useEffect } from "react";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5296/api/product?pageNumber=${page}&pageSize=10`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        setProducts(data.items);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [page]);

  const addToCart = async (productId) => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      window.location.href = "/login";
      return;
    }

    try {
      const response = await fetch("http://localhost:5296/api/cart/items", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (response.status === 401) {
        alert("Session expired. Please login again.");
        sessionStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      alert("Added to cart!");
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Products</h1>
      <div className="product-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <img src={product.mainImageUrl} alt={product.name} />
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p className="price">${product.price}</p>
            <button onClick={() => addToCart(product.id)}>Add to Cart</button>
          </div>
        ))}
      </div>
      <div className="pagination">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))}>
          Previous
        </button>
        <span>Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>
    </div>
  );
}

export default ProductList;
```

## 🔗 Additional Resources

- [Full API Documentation](./API_DOCUMENTATION.md) - Complete endpoint reference
- [Quick Reference](./API_QUICK_REFERENCE.md) - Handy lookup table
- [Postman Collection](./MockTest_API.postman_collection.json) - Import and test

## 🆘 Common Issues

### "401 Unauthorized"

- Your token expired (30 min lifetime) → Login again
- Token not included in header → Check Authorization header
- Token format wrong → Ensure "Bearer " prefix

### "404 Not Found"

- Wrong endpoint URL → Check documentation
- Resource deleted/doesn't exist → Verify ID is correct
- API not running → Start the API with `dotnet run`

### "400 Bad Request"

- Invalid data format → Check request body structure
- Missing required fields → Review DTO requirements
- Negative price, empty name, etc. → Validate input

### CORS Issues

- API allows CORS by default for development
- If you see CORS errors, ensure API is running
- For production, configure allowed origins in API/Program.cs

## 📞 Support

For questions or issues:

1. Check the [Full API Documentation](./API_DOCUMENTATION.md)
2. Review this guide and examples
3. Contact the backend team

---

**Happy Coding! 🚀**
