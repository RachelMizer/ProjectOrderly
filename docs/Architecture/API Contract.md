# Overview
---
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
        "error": "ERROR_TYPE",
        "message": "Human readable message"
    }
```


# Endpoint Contracts
---
# Authentication
## Login
**Endpoint:** `<POST> /api/auth/login/`
**Description:** Submit user credentials to login and receive authorization token
**Authentication:** Not Required
**Role:** All
**URL Parameters:** None
**Request Parameters:** Email & Password
#### Request:

**Header:**
`Content-Type: application/json`
**Body:**
```
{
    "email": "smith@email.com",
    "password": "wordPass1234"
}
```
**Rules:**
`email` - required, string, valid format
`password` - required, string
**Success Response (200 OK):**
```
header

http/1.1 200 OK
Set-Cookie: refreshToken=abc123...; HttpOnly; Secure; SameSite=Strict; Path=/api/auth/refresh
content-type: application/json
```
```
body

{
    "accessToken": "dsTy5FtytVrtym897SsRv...",
    "expiresIn": 3600,
    "tokenType": "bearer",
    "user": {
        "id": "5001",
        "email": "smith@email.com",
        "role": "customer"
    }
}
```
+ Access token expires in 3600 seconds (1 hour).
+ Refresh token used to get new access token, issued in HTTP cookie.
+ Passwords are never returned
+ Passwords are hashed server-side
+ Tokens must be sent on future requests as `Authorization: Bearer <accessToken>`

**Unauthorized Response (401)**
```
{
    "error": "INVALID_CREDENTIALS",
    "message": "Email or password is incorrect"
}
```
**Missing / Invalid Fields (400)**
```
{
    "error": "VALIDATION_ERROR",
    "message": "Email and password are required",
    "fields": {
        "email": "required",
        "password": "required"
    }
}
```
**Account Disabled / Locked (403 Forbidden)**
```
{
    "error": "ACCOUNT_DISABLED",
    "message": "This account has been disabled."
}
```

## Register
**Endpoint:**
**Description:**
**Authentication:**
**Role:**
**URL Parameters:**
**Request Parameters:**
#### Request
**Header:**
**Body:**
**Rules:**
**Success Response (200 OK)**

## Refresh
**Endpoint:**
**Description:**
**Authentication:**
**Role:**
**URL Parameters:**
**Request Parameters:**
#### Request
**Header:**
**Body:**
**Rules:**
**Success Response (200 OK)**

## Guest
**Endpoint:**
**Description:**
**Authentication:**
**Role:**
**URL Parameters:**
**Request Parameters:**
#### Request
**Header:**
**Body:**
**Rules:**
**Success Response (200 OK)**

## Logout
**Endpoint:**
**Description:**
**Authentication:**
**Role:**
**URL Parameters:**
**Request Parameters:**
#### Request
**Header:**
**Body:**
**Rules:**
**Success Response (200 OK)**


# Users

## Get current Customer profile
**Endpoint:**
**Description:**
**Authentication:**
**Role:**
**URL Parameters:**
**Request Parameters:**
#### Request
**Header:**
**Body:**
**Rules:**
**Success Response (200 OK)**

## Update profile
**Endpoint:**
**Description:**
**Authentication:**
**Role:**
**URL Parameters:**
**Request Parameters:**
#### Request
**Header:**
**Body:**
**Rules:**
**Success Response (200 OK)**

# Orders API
## Create Order
**Endpoint:**
**Description:**
**Authentication:**
**Role:**
**URL Parameters:**
**Request Parameters:**
#### Request
**Header:**
**Body:**
**Rules:**
**Success Response (200 OK)**

## Add item to Order
**Endpoint:**
**Description:**
**Authentication:**
**Role:**
**URL Parameters:**
**Request Parameters:**
#### Request
**Header:**
**Body:**
**Rules:**
**Success Response (200 OK)**

## Update item quantity / modifiers
**Endpoint:**
**Description:**
**Authentication:**
**Role:**
**URL Parameters:**
**Request Parameters:**
#### Request
**Header:**
**Body:**
**Rules:**
**Success Response (200 OK)**

## View Order
**Endpoint:**
**Description:**
**Authentication:**
**Role:**
**URL Parameters:**
**Request Parameters:**
#### Request
**Header:**
**Body:**
**Rules:**
**Success Response (200 OK)**

## Get Order Status
**Endpoint:**
**Description:**
**Authentication:**
**Role:**
**URL Parameters:**
**Request Parameters:**
#### Request
**Header:**
**Body:**
**Rules:**
**Success Response (200 OK)**

## List Orders
**Endpoint:**
**Description:**
**Authentication:**
**Role:**
**URL Parameters:**
**Request Parameters:**
#### Request
**Header:**
**Body:**
**Rules:**
**Success Response (200 OK)**

## Finalize Order
**Endpoint:**
**Description:**
**Authentication:**
**Role:**
**URL Parameters:**
**Request Parameters:**
#### Request
**Header:**
**Body:**
**Rules:**
**Success Response (200 OK)**


# Menu API
## List Categories
**Endpoint:**
**Description:**
**Authentication:**
**Role:**
**URL Parameters:**
**Request Parameters:**
#### Request
**Header:**
**Body:**
**Rules:**
**Success Response (200 OK)**

## List Products
**Endpoint:**
**Description:**
**Authentication:**
**Role:**
**URL Parameters:**
**Request Parameters:**
#### Request
**Header:**
**Body:**
**Rules:**
**Success Response (200 OK)**

## Get Variants
**Endpoint:**
**Description:**
**Authentication:**
**Role:**
**URL Parameters:**
**Request Parameters:**
#### Request
**Header:**
**Body:**
**Rules:**
**Success Response (200 OK)**

## Get Modifiers
**Endpoint:**
**Description:**
**Authentication:**
**Role:**
**URL Parameters:**
**Request Parameters:**
#### Request
**Header:**
**Body:**
**Rules:**
**Success Response (200 OK)**

## Create/Update Product
**Endpoint:**
**Description:**
**Authentication:**
**Role:**
**URL Parameters:**
**Request Parameters:**
#### Request
**Header:**
**Body:**
**Rules:**
**Success Response (200 OK)**

## Create/Update Variant
**Endpoint:**
**Description:**
**Authentication:**
**Role:**
**URL Parameters:**
**Request Parameters:**
#### Request
**Header:**
**Body:**
**Rules:**
**Success Response (200 OK)**

## Create/Update Modifiers
**Endpoint:**
**Description:**
**Authentication:**
**Role:**
**URL Parameters:**
**Request Parameters:**
#### Request
**Header:**
**Body:**
**Rules:**
**Success Response (200 OK)**



# Inventory API
## View Inventory levels
**Endpoint:**
**Description:**
**Authentication:**
**Role:**
**URL Parameters:**
**Request Parameters:**
#### Request
**Header:**
**Body:**
**Rules:**
**Success Response (200 OK)**

## Adjust inventory
**Endpoint:**
**Description:**
**Authentication:**
**Role:**
**URL Parameters:**
**Request Parameters:**
#### Request
**Header:**
**Body:**
**Rules:**
**Success Response (200 OK)**

## Low-stock report
**Endpoint:**
**Description:**
**Authentication:**
**Role:**
**URL Parameters:**
**Request Parameters:**
#### Request
**Header:**
**Body:**
**Rules:**
**Success Response (200 OK)**

## (Optional) Inventory usage
**Endpoint:**
**Description:**
**Authentication:**
**Role:**
**URL Parameters:**
**Request Parameters:**
#### Request
**Header:**
**Body:**
**Rules:**
**Success Response (200 OK)**


# Reporting API
## View Sales
**Endpoint:**
**Description:**
**Authentication:**
**Role:**
**URL Parameters:**
**Request Parameters:**
#### Request
**Header:**
**Body:**
**Rules:**
**Success Response (200 OK)**


---