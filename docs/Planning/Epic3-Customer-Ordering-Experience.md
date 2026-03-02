# Epic 3 – Customer Ordering Experience

## Assumptions
When we say **customer**, we mean someone who is ordering items from a store’s website.

---

# Product Browsing Interface

## Original User Story
**Product browsing interface**

As a customer, I want to browse available products or menu items so that I can decide what I want to order.

## Refined User Story

**US3.1**  
As a customer, I want to view a list of products with names, prices, and availability so that I can select items to order.

---

## F3.1.1 – Product Browsing Page (Frontend)

### Description
Create UI for browsing products.

### Tasks

- Product list page
- Display:
  - name
  - price
  - description
- "Add to Cart" button
- Load products from API

### Acceptance Criteria

- Products displayed correctly
- Buttons visible
- Products loaded from backend API
- Each product can be added to cart

---

## B3.1.2 – Product Browsing API (Backend)

### Description
Create API endpoints that allow customers to retrieve product information.

### Tasks

- Create Product serializer
- Create product list endpoint

Return:

- product_id
- name
- price
- description
- availability

- Filter out unavailable products

### Acceptance Criteria

- `GET /api/v1/products`
- Each product includes a unique `product_id`
- Returns JSON product list
- Only available products returned
- Tested with Postman

---

# Shopping Cart System

## Original User Story

As a customer, I want to add multiple items to a cart before checkout so that I can review and modify my order before submitting.

## Refined User Story

**US3.2**

As a customer, I want to add, remove, and update quantities in my cart and have my cart saved automatically so that I can prepare my order before checkout without losing my selections.

---

## F3.2.1 – Shopping Cart Page (Persistent) (Frontend)

### Description
Create UI for managing cart.

### Tasks

- Cart page
- Quantity controls
- Remove buttons
- Cart total
- Cart loads automatically on page refresh
- Cart reflects last saved state
- Update cart via API calls

### Acceptance Criteria

- Items visible
- Quantities editable
- Total updates
- Cart updates persist after refresh

---

## B3.2.2 – Shopping Cart API (Backend)

### Description
Create backend support for storing customer carts.

### Tasks

- Create Cart model
- Create CartItem model
- Link cart to authenticated user
- Load cart for logged-in user
- Save cart changes immediately

Return full cart contents including:

- product id
- name
- quantity
- price
- subtotal

Create endpoints:
- GET/cart
- POST/cart/add
- POST/cart/update
- POST/cart/remove


### Acceptance Criteria

- Customer cart stored in database
- Items can be added
- Items can be removed
- Quantities update correctly
- Cart persists after logout/login
- Cart persists after refresh
- Each user has only one active cart
- `GET /cart` returns current cart contents
- Cart returns correct totals and subtotals

---

# Order Submission and Status Tracking

## Original User Story

**US3.3**

As a customer, I want to submit my order and see its current status so that I know when it is being prepared or completed.

---

## F3.3.1 – Checkout Page (Frontend)

### Description
Create order submission UI.

### Tasks

- Checkout button
- Submit order button
- Display cart contents
- Display order total

### Acceptance Criteria

- Checkout shows correct items and total
- Customer can submit order from checkout page
- Order submits successfully
- Cart is empty after successful order submission

---

## B3.3.2 – Order Creation API (Backend)

### Description
Allow customers to submit orders.

### Tasks

- Create Order model
- Create OrderItem model
- Convert cart items into OrderItems
- Clear cart after order submission

Create submit endpoint:
- POST /orders


### Acceptance Criteria

- Order stored in database
- OrderItems stored
- Order assigned to user
- Default status = Pending
- OrderItems created from cart
- Cart emptied after order submission

---

# Order Submission & Confirmation with Receipt

## Original User Story

**US3.4**

As a customer, I want to see a confirmation screen with my receipt after placing an order so that I have immediate proof of my purchase.

---

## F3.4.1 – Order Confirmation Page (Frontend)

### Description

Display order confirmation details after order submission.

### Tasks

Show:

- Order number
- Items
- Total
- Date
- Status

### Acceptance Criteria

- Confirmation visible after order submission

---

## B3.4.2 – Order Status API (Backend)

### Description

Allow customers to view order status.

### Tasks

Create endpoint:
- GET /orders/{id}


### Acceptance Criteria

- Users can only access their own orders
- Returns:
  - status
  - items
  - total
  - date

---

# Customer Access to Order History

## Original User Story

**US3.5**

As a customer, I want to view my previous orders so that I can reorder my favorites quickly.

---

## F3.5.1 – Order History Page (Frontend)

### Description

Display past orders.

### Tasks

- Order list
- Click order to view

### Acceptance Criteria

- Orders displayed correctly

---

## B3.5.2 – Order History API (Backend)

### Description

Allow customers to retrieve past orders.

### Tasks

Create endpoint:
- GET /orders/history


### Acceptance Criteria

- Returns only logged-in user orders
- Sorted newest first
- Users can only access their own orders

---

# User Profile Management

## Original User Story

**US3.6**

As a customer, I want to update my profile information so that my contact details and preferences stay current.

---

## F3.6.1 – Profile Page (Frontend)

### Description

Allow profile editing.

### Tasks

- Profile form
- Save button

### Acceptance Criteria

- Profile updates successfully

---

## B3.6.2 – Profile Management API (Backend)

### Description

Allow customers to update profile data.

### Tasks

Return:

- name
- email
- phone

Create endpoints:
- GET /profile
- PUT /profile


### Acceptance Criteria

- Only logged-in users can access profile
- User can update:
  - name
  - email
  - phone

---

# Order Item Customization

## Original User Story

**US3.7**

As a customer, I want to customize items (extras or notes) so that my order matches my preferences.

### Product Owner Decision

This story is currently **out of scope** for Sprint 3.

If time permits, it may be added later.
