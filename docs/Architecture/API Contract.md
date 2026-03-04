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
        "role": "CUSTOMER"
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
        "role": "CUSTOMER"
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
**Unauthorized (401):**  
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
**Request Parameters:** firstName, lastName, email, streetAddress, city, state, zipcode, and/or phone  
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
+ Only submitted fields will be updated
+ All fields are strings
+ 10-15 digit phone number with optional '+ country code"
+ Zipcode must be 5 digits or 5 digits dash 4 digits
+ State must be 2 uppercase code
+ Changing email requires email_verified=true
+ if changing email, email_verified is set to false and a new verification is sent.

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
+ Returns customers in alphabetic order, using first name then last name

**Success Response (200 OK):**
```
body

{
    "count": 100,
    "pageSize": 25,
    "next": "/api/v1/users?page=2",
    "previous": null,
    "results": [
        {
            "id": 1,
            "firstName": "Jacob",
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
            "firstName": "John",
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
**Endpoint:** `<POST> /api/v1/orders`  
**Description:** Creates a new, empty order. Returns order id  
**Authentication:** `Bearer <accessToken>` (OPTIONAL)  
**Role:** None  
**URL Parameters:** None  
**Request Parameters:** guestEmail if no accessToken in header  
### Request  
**Header:**  
```
Authorization: Bearer <accessToken> (OPTIONAL)
Content-Type: application/json
```
**Body:** 
```
{
    "guestEmail": "test@example.com"
}
or if accessToken in header,
{}
```
**Rules:** If no JWT is present, requires a guest email  
**Success Response (201 Created):**  
```
body
{
    "id": 1
}
```
**Bad Request (400):**  
```
body
{
    "error": "MISSING_INPUT",
    "message": "missing access token or guest email"
}
```

## Add item to Order  
**Endpoint:** `<POST> /api/v1/orders/items`  
**Description:** Adds an order item to a customer's order draft  
**Authentication:** `Bearer <accessToken>` (OPTIONAL)  
**Role:** Owner of order  
**URL Parameters:** None  
**Request Parameters:** variantId, quantity, orderId  
### Request  
**Header:**  
```
Content-Type: application/json
```
**Body:**  
```
{
    "guestEmail": "test@example.com" (OPTIONAL)
    "variantId": 507,
    "quantity": 2
}
```
**Rules:**   
+ Customer must have an order in a draft state
+ Quantity must be greater than 0
+ Order and variant must exist
+ If not accessToken in header, must provide a guest email with a drafted order
  
**Success Response (201 Created):**  
```
{
    "message": "order updated",
    "orderId": 1,
    "orderItemId: 1
}
```
**Bad Request (400):**  
```
{
    "error": "INVALID_INPUT",
    "message": "order or variant does not exist or bad quantity"
}
```
**Forbidden (403):**  
```
{
    "error": "NOT_AUTHORIZED",
    "message": "you do not have permission to modify this order"
}
```
**Not Found (404):**  
```
{
    "error": "NO_ORDER",
    "message": "customer does not have a draft order"
}
```

## Update orderItem quantity  
**Endpoint:** `<PATCH> /api/v1/orders/items/{orderItemId}`  
**Description:** Update quantity of an orderItem  
**Authentication:** `Bearer <accessToken>` (OPTIONAL)  
**Role:** Owner of order  
**URL Parameters:** orderItemId = [integer]  
**Request Parameters:** quantity and optional guestEmail  
### Request  
**Header:**  
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```
**Body:**  
```
{
    "guestEmail": "test@example.com" (OPTIONAL),
    "quantity": 2
}
```
**Rules:**  
+ Customer must have an order in a draft state
+ Must include guest email if no accessToken in header
+ OrderItem must exist
+ Quantity represents final quantity (if quantity equals 2, item quantity on order will be set to 2)
+ Quantity must be equal to or greater than 0
+ Zero quantity removes the item from the order
  
**Success Response (200 OK):**  
```
{
    "message": "quantity updated",
    "orderId": 1,
    "orderItemId: 1
}
or
{
    "message": "item removed",
    "orderId" : 1
}
```
**Bad Request (400):**  
```
{
    "error": "INVALID_INPUT",
    "message": "Bad quantity or no draft order"
}
```
**Forbidden (403):**  
```
{
    "error": "NOT_AUTHORIZED",
    "message": "you do not have permission to modify this order"
}
```
**Not Found (404):**  
```
{
    "error": "BAD_ITEM",
    "message": "order item does not exist"
}
```

## Add item modifer  
**Endpoint:** `<POST> /api/v1/orders/items/{orderItemId}/modifiers`  
**Description:** add modifier to an order item  
**Authentication:** `Bearer <accessToken>` (OPTIONAL)  
**Role:** Owner of order  
**URL Parameters:** orderItemId = [integer]  
**Request Parameters:** optional guestEmail  
### Request  
**Header:**  
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```
**Body:**  
```
{
    "guestEmail": "test@example.com" (OPTIONAL),
    "modiferId": 1
}
```
**Rules:**  
+ Customer must have an order in a draft state
+ Must include guest email if no accessToken in header
+ OrderItem must exist
+ Modifer must exist and belong to the product variant
  
**Success Response (201 Created):**  
```
{
    "message": "order updated",
    "orderId": 1,
    "orderItemId: 1,
    "orderModifierId": 1
}
```
**Bad Request (400):**  
```
{
    "error": "INVALID_INPUT",
    "message": "bad modifierId"
}
```
**Forbidden (403):**  
```
{
    "error": "NOT_AUTHORIZED",
    "message": "you do not have permission to modify this order"
}
```
**Not Found (404):**  
```
{
    "error": "NO_ORDER",
    "message": "customer does not have a draft order or no matching order item"
}
```

## Get Order/:id  
**Endpoint:** `<GET> /api/v1/orders/{orderId}`  
**Description:** Returns order information  
**Authentication:** `Bearer <accessToken>`  
**Role:** Business or order owner  
**URL Parameters:** orderId = [integer]  
**Request Parameters:** None  
### Request  
**Header:**  
```
Authorization: Bearer <accessToken>
```
**Body:** None  
**Rules:**   
+ Customers can view their orders
+ Business can view any order
  
**Success Response (200 OK):**  
```
{
    "id": 1,
    "date": "2026-04-18T14:30:00Z",
    "orderSubtotal": 20.32,
    "taxAmount": 1.42,
    "totalDue": 21.74,
    "status": "COMPLETED",
    "createdAt": "2026-04-18T14:26:23Z",
    "updatedAt": "2026-04-18T14:30:00Z",
    "variants": [
        {
            "id"; 302,
            "variantName": "large_shirt_black",
            modifiers: [
                "id": 3,
                "groupId": 2
            ]
        },
        ...
    ]
}
```
**Forbidden (403):**  
```
{
    "error": "NOT_AUTHORIZED",
    "message": "you do not have permission to modify this order"
}
```
**Not Found (404):**  
```
{
    "error": "NO_ORDER",
    "message": "customer does not have a draft order or no matching order item"
}
```

## Get Order Status  
**Endpoint:** `<GET> /api/v1/orders/{orderId}/status`  
**Description:** Returns only order status  
**Authentication:** `Bearer <accessToken>`  
**Role:** Business or order owner  
**URL Parameters:** orderId = [integer]  
**Request Parameters:** None  
### Request  
**Header:**  
```
Authorization: Bearer <accessToken>
```
**Body:** None  
**Rules:**  
+ Customers can view their orders
+ Business can view any order

**Success Response (200 OK):**  
{
    "status": "PENDING",
}

**Forbidden (403):**  
```
{
    "error": "NOT_AUTHORIZED",
    "message": "you do not have permission to modify this order"
}
```
**Not Found (404):**  
```
{
    "error": "NO_ORDER",
    "message": "customer does not have a draft order or no matching order item"
}
```

## Get my order history
**Endpoint:** `<GET> /api/v1/orders/me`, `<GET> /api/v1/orders/me?page=1&pageSize=10` 
**Description:** Returns all order objects owned by user  
**Authentication:** `Bearer <accessToken>`  
**Role:** Customer  
**URL Parameters:**  
+ page (defaults to 1)
+ pageSize (defaults to 25)
**Request Parameters:** None
### Request
**Header:**
```
Authorization: Bearer <accessToken>
```
**Body:** None  
**Rules:**  
+ Returns all customer orders EXCEPT draft order  
+ If the customer has no orders, returns an empty collection 
+ Returns orders in createdAt descending order 
  
**Success Response (200 OK):**  
```
{
    "count": 100, 
    "pageSize": 10,
    "next": "/api/v1/orders/me?page=2",
    "previous": null,
    "results": [
        {
            "id": 28,
            "date": "2026-06-21T14:30:00Z",
            "subtotal": 10.00,
            "taxAmount": 0.07,
            "totalDue": 10.07,
            "status": "PENDING",
            "createdAt": "2026-06-20T14:30:00Z",
            "updatedAt": "2026-06-21T14:30:00Z",
        },
        {
            "id": 15,
            "date": "2026-04-18T14:30:00Z",
            "subtotal": 10.00,
            "taxAmount": 0.07,
            "totalDue": 10.07,
            "status": "COMPLETED",
            "createdAt": "2026-04-18T14:30:00Z",
            "updatedAt": "2026-04-18T14:30:00Z",
        },
        ...
    ]
}
```
**Unauthorized (401):**  
```
{
    "error": "NOT_AUTHORIZED",
    "message": "bad token"
}
```

## List Orders  
**Endpoint:** `<GET> /api/v1/orders`, `<GET> /api/v1/orders?page=2&pageSize=20`, `<GET> /api/v1/orders?dateCreated=YYYY-MM-DD`, `<GET> /api/v1/orders?status=pending`  
**Description:** Returns a list of orders  
**Authentication:** `Bearer <accessToken>`  
**Role:** Business owner  
**URL Parameters:**  
+ page (optional)
+ pageSize (optional. default pageSize is 25, max is 200)
+ dateCreated (optional. only returns orders created on the matching day)
+ status (optional. only returns orders with matching status)
+ returns orders in createdAt descending order

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
+ Returns a collection of orders
+ URL parameters can be combined with &
  
**Success Response (200 OK):**  
```
{
    "count": 100, 
    "pageSize": 25,
    "next": "/api/v1/orders?page=2",
    "previous": null,
    "results": [
        {
            "id": 10,
            "customerId": 1,
            "date": "2026-04-18T15:00:00Z",
            "subtotal": 10.00,
            "taxAmount": 0.07,
            "totalDue": 10.07,
            "status": "COMPLETED",
            "createdAt": "2026-04-18T14:45:00Z",
            "updatedAt": "2026-04-18T15:00:00Z",
        },
        {
            "id": 11,
            "customerId": 9,
            "date": "2026-04-18T14:30:00Z",
            "subtotal": 20.00,
            "taxAmount": 0.14,
            "totalDue": 20.14,
            "status": "PENDING",
            "createdAt": "2026-04-18T14:30:00Z",
            "updatedAt": "2026-04-18T14:30:00Z",
        },
        ...
    ]
}
```

## Submit Order  
**Endpoint:** `<PATCH> /api/v1/orders/{orderId}/submit`  
**Description:** Set an order to pending status  
**Authentication:** `Bearer <accessToken>`  
**Role:** Order owner  
**URL Parameters:** orderId = [integer]  
**Request Parameters:** None  
### Request  
**Header:**  
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```
**Body:**  
```
{}
```
**Rules:**  
+ Customers can submit their own order
+ Order must exist and be in draft state
+ Order must have at least one variant
  
**Success Response (200 OK):**  
```
body
{
    "id": 6,
    "status": "PENDING"
}
```
**Forbidden (403):**  
```
{
    "error": "NOT_AUTHORIZED",
    "message": "you do not have permission to modify this order"
}
```
**Not Found (404):**  
```
{
    "error": "NOT_FOUND",
    "message": "order does not exist"
}
```

## Finalize Order  
**Endpoint:** `<PATCH> /api/v1/orders/{orderId}/complete`  
**Description:** Set an order to completed status  
**Authentication:** `Bearer <accessToken>`  
**Role:** Business  
**URL Parameters:** orderId = [integer]  
**Request Parameters:** None  
### Request  
**Header:**  
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```
**Body:**  
```
{}
```
**Rules:**  
+ Must be business user
+ Order must not be completed or draft
  
**Success Response (200 OK):**  
```
body
{
    "id": 1,
    "status": "COMPLETED"
}
```
**Forbidden (403):**  
```
{
    "error": "NOT_AUTHORIZED",
    "message": "you do not have permission to modify this order"
}
```
**Not Found (404):**  
```
{
    "error": "NOT_FOUND",
    "message": "order does not exist"
}
```

## Cancel Order  
**Endpoint:** `{PATCH} /api/v1/orders/{orderId}/cancel`  
**Description:** Sets an order's status to cancelled  
**Authentication:** `Bearer <accessToken>`  
**Role:** Business or order owner  
**URL Parameters:** orderId = [integer]  
**Request Parameters:** None  
### Request  
**Header:**  
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```
**Body:**   
```
{}
```
**Rules:**  
+ Business users can cancel any order that is not a draft, completed, or cancelled
+ Customers can only cancel their draft or pending orders
+ Guest users should contact a business owner
+ The order must exist and not be cancelled

**Success Response (200 OK):**  
```
body
{
    "id": 1
    "message": "order cancelled"
}
```
**Forbidden (403):**  
```
{
    "error": "NOT_AUTHORIZED",
    "message": "you do not have permission to modify this order"
}
```
**Not Found (404):**  
```
{
    "error": "NOT_FOUND",
    "message": "order does not exist"
}
```

# Menu API
## List Categories
**Endpoint:** `<GET> /api/v1/categories`  
**Description:** Returns a collection of categories   
**Authentication:** None  
**Role:** Any  
**URL Parameters:** None  
**Request Parameters:** None  
### Request  
**Header:**  
**Body:**  
**Rules:**  
+ Returns a collection of category objects
+ ImageUrl will be null if no image exists
  
**Success Response (200 OK):**
```
body
{
    "results": [
        {
            "id": 1,
            "name": "Apparel",
            "imageUrl": "https://storename.com/media/categories/apparel.png"
        },
        {
            "id": 2,
            "name": "Groceries",
            "imageUrl": "https://storename.com/media/categories/groceries.png"
        },
        {
            "id": 3,
            "name": "Toys and Games",
            "imageUrl": "https://storename.com/media/categories/toys_and_games.png"
        },
        ...
    ]
}
```

## List Products
**Endpoint:** `<GET> /api/v1/prodcts`, `<GET> /api/v1/products?categoryId=1`, `<GET> /api/v1/products?page=1&pageSize=50`  
**Description:** Returns a collection of all products or products by category  
**Authentication:** None  
**Role:** Any  
**URL Parameters:**
+ categoryId
+ page (defaults to 1)
+ pageSize (defaults to 50)

**Request Parameters:** None  
### Request
**Header:** None  
**Body:** None  
**Rules:**
+ Returns products in alphabetical order  
+ For each product, returns if the product has variants and has modifiers as a boolean value  

**Success Response (200 OK):**
```
{
    "count": 500,
    "pageSize": 50,
    "next": "/api/v1/products&page2",
    "previous": /api/v1/products&page3",
    "results": [
        {
            "id": ,
            "name": ,
            "hasVariants": ,
            "hasModifiers": ,
            "minPrice": ,
            "imageUrl": ,
        },
        {

        },
        ...
    ]

}
```

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