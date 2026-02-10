# Overview

### Authentication & Authorization
#### How do we prove identity and permissions?
The API uses token-based authentication.
JSON Web Tokens (JWT) are issued upon successful login.
All authenticated requests must include the JWT in the Authorization header:
    ```Authorization: Bearer <token>```
Tokens are stateless and validated on each request.
Login and registration endpoints do not require authentication

## Common Conventions
### URLs
All API endpoints are prefixed with `/api/`.
Endpoints follow RESTful resource-based naming.
Plural nouns are used for collections (`/orders`, `/products`).
### HTTP
+ GET: Retrieve resources
+ POST: Create new resources
+ PUT/PATCH: Update existing resources
+ DELETE: Remove resources
### Status Codes
+ 200 OK: Successful request
+ 201 Created: Resource successfully created
+ 400 Bad Request: Invalid input data
+ 401 Unauthorized: Missing or invalid authentication
+ 403 Forbidden: Insufficient permissions
+ 404 Not Found: Resource does not exist
###
Data Format
All request and response bodies use JSON.
Timestamps are returned in ISO 8601 format (UTC).
Monetary values are represented as decimal numbers.
### Errors
Error respones use a consistent JSON structure:
```
    {
        "error": "Human-readable error message"
    }
```

---
# Endpoint Contracts
# Customers
## Login
## Register
## Guest
## Get current Customer profile
## Update profile


# Orders API
## Create Order
## Add item to Order
## Update item quantity / modifiers
## View Order
## Get Order Status
## List Orders
## Finalize Order


# Menu API
## List Categories
## List Products
## Get Variants
## Get Modifiers
## Create/Update Product
## Create/Update Variant
## Create/Update Modifiers


# Inventory API
## View Inventory levels
## Adjust inventory
## Low-stock report
## (Optional) Inventory usage

# Reporting API
## View Sales

---