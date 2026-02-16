# Overview
## Authentication & Authorization
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
### HTTP Methods
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
### Data Format
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

# Authentication
## Login
**Endpoint:** `<POST> /api/v1/auth/login/`  
**Description:** Submit user credentials to login and receive authorization token  
**Authentication:** Not Required  
**Role:** All  
**URL Parameters:** None  
**Request Parameters:** Email & Password  

### Request:

**Header:**`Content-Type: application/json`  
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

http/1.1 200 Ok
Set-Cookie: refreshToken=abc123...; HttpOnly; Secure; SameSite=Lax; Path=/api/v1/auth/; Max-Age=604800
Content-Type: application/json
```

```
body

{
    "accessToken": "dsTy5FtytVrtym897SsRv...",
    "expiresIn": 3600,
    "tokenType": "Bearer",
    "customer": {
        "id": "5001",
        "email": "smith@email.com",
        "role": "customer"
    }
}
```
+ Access token expires in 3600 seconds (1 hour).
+ Refresh token used to get new access token, issued in HTTP cookie. Expires in 7 days
+ Passwords are never returned
+ Passwords are hashed server-side
+ Tokens must be stored locally and sent on future requests as `Authorization: Bearer <accessToken>`

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
**Endpoint:** `<POST> /api/v1/auth/register`  
**Description:** Submit user credentials to register new user and automatically login.  
**Authentication:** Not required  
**Role:** None  
**URL Parameters:** None  
**Request Parameters:** email, password, firstName, lastName  
### Request
**Header:** `Content-Type: application/json`  
**Body:** 
```
{
    "email": "smith@email.com",
    "password": "wordPass1234",
    "firstName": "John",
    "lastName": "Smith"
}
```
**Rules:** 
`email` - required, string, valid format  
`password` - required, string, min 8 characters, not a common password, not only numeric characters, not too similar to username firstName lastName or email  
`firstName` - required, string  
`lastName` - required, string  

**Success Response (201 CREATED)**
```
header

http/1.1 201 Created
Set-Cookie: refreshToken=abc123...; HttpOnly; Secure; SameSite=Lax; Path=/api/v1/auth/; Max-Age=604800
Content-Type: application/json
Location: /api/v1/users/4001
```
```
body
{
    "accessToken": "dsTy5FtytVrtym897SsRv...",
    "expiresIn": 3600,
    "tokenType": "Bearer",
    "customer": {
        "id": 4001,
        "email": "smith@email.com",
        "role": "customer"
    }
}
```
+ Access token expires in 3600 seconds (1 hour).
+ Refresh token used to get new access token, issued in HTTP cookie. Expires in 7 days
+ Passwords are never returned
+ Passwords are hashed server-side
+ Tokens must be stored locally and sent on future requests as `Authorization: Bearer <accessToken>`
  
**Missing / Invalid Fields (400)**
```
{
    "error": "VALIDATION_ERROR",
    "message": "Missing required fields",
    "fields": {
        "email": "required",
        "password": "required",
        "firstName": "required",
        "lastName": "required",
    }
}
```
**Conflict (409)**
```
{
    "error": "CONFLICT_ERROR",
    "message": "Email is already registered"
}
```

## Refresh
**Endpoint:** `<GET> /api/v1/auth/refresh`  
**Description:** When auth token has expired, use refresh token to request new auth token.  
**Authentication:** Refresh token (HTTP cookie)  
**Role:** None  
**URL Parameters:** None  
**Request Parameters:** None  
### Request
**Header:** `Content-Type: application/json`  
**Body:**
```
{}
```
**Rules:** Automatically uses HTTP cookie token issued from login or register.  
**Success Response (200 OK)**
```
body

{
    "accessToken": "dsTy5FtytVrtym897SsRv...",
    "expiresIn": 3600,
    "tokenType": "Bearer"
}
```
**Unauthorized (401)**
```
{
    "error": "INVALID_REFRESH_TOKEN",
    "message": "Refresh token is invalid or expired"
}
```


## Logout
**Endpoint:** `/api/v1/auth/logout`  
**Description:** Clears user refresh token, blacklists token on backend.  
**Authentication:** Refresh token (HTTP cookie)  
**Role:** Any  
**URL Parameters:** None  
**Request Parameters:** None  
### Request
**Header:** `Content-Type: application/json`  
**Body:**
```
{}
```
**Rules:** None  
**Success Response (200 OK)**
```
header

HTTP/1.1 200 OK
Set-Cookie: refreshToken=; HttpOnly; Secure; SameSite=Lax; Path=/api/v1/auth/; Max-Age=0
Content-Type: application/json
```
```
body
{
    "message": "Successfully logged out"
}
```


# Users
## Get current User profile
**Endpoint:**
**Description:**
**Authentication:**
**Role:**
**URL Parameters:**
**Request Parameters:**
### Request
**Header:**
**Body:**
**Rules:**
**Success Response (200 OK)**

## Update User profile
**Endpoint:**
**Description:**
**Authentication:**
**Role:**
**URL Parameters:**
**Request Parameters:**
### Request
**Header:**
**Body:**
**Rules:**
**Success Response (200 OK)**

## Get Users
**Endpoint:**
**Description:**
**Authentication:**
**Role:**
**URL Parameters:**
**Request Parameters:**
### Request
**Header:**
**Body:**
**Rules:**
**Success Response (200 OK)**

## Get User/:id

## Delete User
**Endpoint:**
**Description:**
**Authentication:**
**Role:**
**URL Parameters:**
**Request Parameters:**
### Request
**Header:**
**Body:**
**Rules:**
**Success Response (200 OK)**


# Orders API
## Create Order
**Endpoint:**
**Description:** 
**Authentication:** `Bearer: <JWT>` (optional)
**Role:** None
**URL Parameters:**
**Request Parameters:**
### Request
**Header:**
**Body:**
**Rules:** If no JWT is present, require guest email
**Success Response (200 OK)**

## Add item to Order
**Endpoint:**
**Description:**
**Authentication:**
**Role:**
**URL Parameters:**
**Request Parameters:**
### Request
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
### Request
**Header:**
**Body:**
**Rules:**
**Success Response (200 OK)**

## View Order/:id
**Endpoint:**
**Description:**
**Authentication:**
**Role:**
**URL Parameters:**
**Request Parameters:**
### Request
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
### Request
**Header:**
**Body:**
**Rules:**
**Success Response (200 OK)**

## List Orders/:status
**Endpoint:**
**Description:**
**Authentication:**
**Role:**
**URL Parameters:**
**Request Parameters:**
### Request
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
### Request
**Header:**
**Body:**
**Rules:**
**Success Response (200 OK)**

## Cancel Order
**Endpoint:**
**Description:**
**Authentication:**
**Role:**
**URL Parameters:**
**Request Parameters:**
### Request
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
### Request
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
### Request
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
### Request
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
### Request
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
### Request
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
### Request
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
### Request
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
### Request
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
### Request
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
### Request
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
### Request
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
### Request
**Header:**
**Body:**
**Rules:**
**Success Response (200 OK)**


---