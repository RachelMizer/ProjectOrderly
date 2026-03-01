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
URL parameters follow this format `api/v1/users?key=value&key=value&...` 
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
**Role:** None  
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

**Unauthorized Response (401):**
```
{
    "error": "INVALID_CREDENTIALS",
    "message": "Email or password is incorrect"
}
```
**Missing / Invalid Fields (400):**
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
**Account Disabled / Locked (403 Forbidden):**
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

**Success Response (201 CREATED):**
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
  
**Missing / Invalid Fields (400):**
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

or

{
    "error": "WEAK_PASSWORD",
    "message": "password must meet all requirements"
}
```
**Conflict (409):**
```
{
    "error": "CONFLICT_ERROR",
    "message": "Email is already registered"
}
```

## Refresh
**Endpoint:** `<POST> /api/v1/auth/refresh`  
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
**Success Response (200 OK):**
```
body

{
    "accessToken": "dsTy5FtytVrtym897SsRv...",
    "expiresIn": 3600,
    "tokenType": "Bearer"
}
```
**Unauthorized (401):**
```
{
    "error": "INVALID_REFRESH_TOKEN",
    "message": "Refresh token is invalid or expired"
}
```


## Logout
**Endpoint:** `<POST> /api/v1/auth/logout`  
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
**Success Response (200 OK):**
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

## Request Password Reset
**Endpoint:** `<POST> /api/v1/auth/password-reset`  
**Description:** Requests an email to reset password  
**Authentication:** None  
**Role:** None  
**URL Parameters:** None  
**Request Parameters:** email  
### Request
**Header:** `Content-Type: application/json`  
**Body:**
```
{
    "email": "smith@email.com"
}
```
**Rules:** `email` - required, string, valid format  
**Success Response (200 OK):**
```
body
{
    "message": "If email exists, will send password reset."
}
```
**Invalid email (400):**
```
{
    "error": "INVALID_EMAIL",
    "message": "Not a valid email format"
}
```

## Confirm New Password
**Endpoint:** `<POST> /api/v1/auth/password-reset/confirm`  
**Description:** Submits a new password.  
**Authentication:** None  
**Role:** Any  
**URL Parameters:** None 
**Request Parameters:** encoded UserID, New password, auth token
### Request
**Header:** `Content-Type: application/json`  
**Body:**
```
{
    "uid": "abc123",
    "token": "xyz321",
    "newPassword": "myNewerStrongerPassword"
}
```
**Rules:**  
+ Reset link example: `/api/v1/auth/password-reset/confirm/?uid=abc123&token=xyz321` 
+ `uid` and `token` - strings. included password reset link.
+ `Password` - string. password hashed server-side.  
+ Token must valid and not expired
+ Token becomes invalid after reset

**Success Response (200 OK):**  
```
body
{
    "message": "Successfully reset password"
}
```
**Bad Request (400):**  
```
{
    "error": "WEAK_PASSWORD",
    "message": "password must meet all requirements"
}

or

{
    "error": "INVALID_TOKEN",
    "message": "token is invalid or expired"
}
```
   

# Customers
## Get current Customer profile
**Endpoint:** `<GET> /api/v1/users/me`
**Description:** Get current customer information
**Authentication:** `Bearer <accessToken>`
**Role:** Customer
**URL Parameters:** None
**Request Parameters:** None
### Request
**Header:** 
```
Authorization: Bearer <accessToken>
```

**Body:** None
**Rules:** Token must not be expired. If expired, frontend should refresh the token gracefully.
**Success Response (200 OK):**
```
body

{
    "firstName": "John",
    "lastName": "Smith",
    "email": "supersmith@example.com",
    "streetAddress": "123 river lane",
    "city": "New York",
    "state": "NY",
    "zipcode": "12345",
    "phone": "123-555-0000"
}
```
**Unauthorized (401)**
```
{
    "error": "INVALID_TOKEN",
    "message": "invalid or expired token"
}
```


## Update Customer profile
**Endpoint:** `<PATCH> /api/v1/users/me`
**Description:** Update the current customer's information
**Authentication:** `Bearer <accessToken>`
**Role:** Customer
**URL Parameters:** None
**Request Parameters:** firstName, lastName, streetAddress, city, state, zipcode, and/or phone
### Request
**Header:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```
**Body:**
```
{
    "streetAddress": "321 lake road",
    "city": "Raleigh",
    "state": "NC",
    "zipcode": "54321"
}
```
**Rules:**
+ All fields are strings
+ 10-15 digit phone number with optional '+ country code"
+ Zipcode must be 5 digits or 5 digits dash 4 digits
+ State must be 2 uppercase code

**Success Response (200 OK):**
```
{
    "firstName": "John",
    "lastName": "Smith",
    "streetAddress": "321 lake road",
    "city": "Raleigh",
    "state": "NC",
    "zipcode": "54321",
    "phone": "123-555-0000"
}
```
**Bad Input (400)**
```
{
    "error": "INVALID_INPUT",
    "message": "incorrect input format",
    "fields": {
        "phone": "invalid format"
    }
}
```

**Unauthorized (401)**
```
{
    "error": "INVALID_TOKEN",
    "message": "invalid or expired token"
}
```

## Get All Customers
**Endpoint:** `<GET> /api/v1/users`, `<GET> /api/v1/users?page=4&pageSize=20`, `<GET> /api/v1/users?search=john` 
**Description:** Returns a list of customer profiles. Excludes street address.
**Authentication:** `Bearer <accessToken>`
**Role:** Business owner
**URL Parameters:**
+ page (optional)
+ pageSize (optional. default pageSize is 25, max is 200)
+ search (optional. searches name fields and email)
**Request Parameters:** None
### Request
**Header:**
```
Authorization: Bearer <accessToken>
```
**Body:** None
**Rules:** 
+ Endpoint only available to users with the business role
+ Returns number of returned objects
+ Returns next and previous page urls
+ Returns a collection of users
**Success Response (200 OK):**
```
body

{
    "count": 3,
    "next": "/api/v1/users?page=2",
    "previous": null,
    "results": [
        {
            "id": 1,
            "firstName": "John",
            "lastName": "Smith",
            "email": "supersmith@example.com",
            "phone": "123-555-0000"
        },
        {
            "id": 2,
            "firstName": "Jane",
            "lastName": "Doe",
            "email": "doerocks@example.com",
            "phone": "123-555-4321"
        },
        {
            "id": 3,
            "firstName": "Jacob",
            "lastName": "Mills",
            "email": "jmills@example.com",
            "phone": "555-333-2222"
        }
    ]
}
```
**Unauthorized (401):**
```
{
    "error": "INVALID_TOKEN",
    "message": "invalid or expired token"
}
```

**Wrong Permissions (403):**
```
{
    "error": "INVALID_ROLE",
    "message": "user does not have this permission"
}
```

## Get Customer by ID
**Endpoint:** `<GET> /api/v1/users/{id}`
**Description:** Returns a full customer profile
**Authentication:** `Bearer <accessToken>`
**Role:** Business
**URL Parameters:** id = [integer]
**Request Parameters:** None
### Request
**Header:**
```
Authorization: Bearer <accessToken>
```
**Body:** None
**Rules:** Must include positive integer in url
**Success Response (200 OK):**
```
body

{
    "id": 1,
    "firstName": "John",
    "lastName": "Smith",
    "email": "supersmith@example.com",
    "emailVerified": true,
    "streetAddress": "123 river lane",
    "city": "New York",
    "state": "NY",
    "zipcode": "12345",
    "phone": "123-555-0000"
}
```
**Unauthorized (401):**
```
{
    "error": "INVALID_TOKEN",
    "message": "invalid or expired token"
}
```

**Wrong Permissions (403):**
```
{
    "error": "INVALID_ROLE",
    "message": "user does not have this permission"
}
```
**Not Found (404):**
```
{
    "error": "NOT_FOUND",
    "message": "user not found"
}
```

## Delete Customer
**Endpoint:** `<DELETE> /api/v1/users/{id}`
**Description:** Deactivates a user.
**Authentication:** `Bearer <accessToken>`
**Role:** Business or customer if id matches
**URL Parameters:** id = [integer]
**Request Parameters:** None
### Request
**Header:**
```
Authorization: Bearer <accessToken>
```
**Body:** None
**Rules:** 
+ Token must verify either a business user or the customer deactivated
+ If a customer is deactivating their account, frontend should then call logout
  
**Successfully Deleted (204 OK):** No body

**Unauthorized (401):**
```
{
    "error": "INVALID_TOKEN",
    "message": "invalid or expired token"
}
```
**Wrong Permissions (403):**
```
{
    "error": "INVALID_ROLE",
    "message": "user does not have this permission"
}
```
**Not Found (404):**
```
{
    "error": "NOT_FOUND",
    "message": "user not found"
}
```

# Orders API
## Create Order
**Endpoint:**
**Description:** 
**Authentication:** `Bearer <accessToken>` (optional)
**Role:** None
**URL Parameters:**
**Request Parameters:**
### Request
**Header:**
**Body:**
**Rules:** If no JWT is present, require guest email
**Success Response (200 OK):**

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
**Success Response (200 OK):**

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
**Success Response (200 OK):**

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
**Success Response (200 OK):**

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
**Success Response (200 OK):**

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
**Success Response (200 OK):**

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
**Success Response (200 OK):**

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
**Success Response (200 OK):**

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
**Success Response (200 OK):**

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
**Success Response (200 OK):**

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
**Success Response (200 OK):**

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
**Success Response (200 OK):**

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
**Success Response (200 OK):**

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
**Success Response (200 OK):**

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
**Success Response (200 OK):**



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
**Success Response (200 OK):**

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
**Success Response (200 OK):**

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
**Success Response (200 OK):**

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
**Success Response (200 OK):**


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
**Success Response (200 OK):**


---