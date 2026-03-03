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
  - variant name <!-- New -->
  - unit price <!-- Changed -->
  - description <-- This field does not currently exit. It's something we need to figure out -->
  - availability <!-- New -->
- "Add to Cart" button
- Load products from API

### Acceptance Criteria

- Products displayed correctly
- Prices displayed correctly <!-- New -->
- Availability displayed correctly <!-- New -->
- Buttons visible
- Products loaded from backend API
- Each variant can be added to cart <!-- Changed -->

---

## B3.1.2 – Product Browsing API (Backend)

### Description
Create API endpoints that allow customers to retrieve product and variant information. <!-- Changed -->

### Tasks

- Create Product serializer
- Create variant serializer <!-- New -->
- Create product list endpoint
- Create product endpoint <! -- SR -- >

Return:

- productId
- productName
- categoryName <!-- New -->
- variants <!-- New -->
    - variantId
    - variantName
    - unitPrice
    - availability

- Availability rules: <!-- New -->
    - stock_quantity is NULL = available
    - stock_quantity > 0 = available
    - otherwise unavailable

### Acceptance Criteria

- `GET /api/v1/products`
- Each variant includes a unique variantId <!-- Changed -->
- Returns JSON product list with variants <!-- Changed -->
- Only available variants returned <!-- Changed -->
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

## B3.2.2 – Draft Order API (Backend) <!-- Changed -->

### Description
Create backend support for storing and updating a customer draft order (cart). <!-- Changed -->

### Tasks

- Get-or-create the authenticated customer’s single DRAFT order <!-- Changed -->
- Load DRAFT order for logged-in user <!-- Changed -->
- Add/update/remove items on the draft order. <!-- New -->
- Save cart changes immediately
- Recalculate totals after each change


Return full DRAFT order contents including: <!-- Changed -->

- orderId <!-- New -->
- items <!-- New -->
    - itemId
    - variantId
    - productName
    - variantName
    - quantity
    - unitPriceCharged
    - itemTotal
    - modifiers:
        - optionId
        - name
        - priceAdjustmentCharged
- totals: <!-- New -->
    - subtotal
    - taxAmount
    - totalPaymentDue

Create endpoints:
- GET /api/v1/orders?status=DRAFT <!-- Changed -->
- POST /api/v1/orders/{orderId}/items <!-- Changed -->
- PATCH /api/v1/orders/{orderId}/items/{itemId} <!-- Changed -->
- DELETE /api/v1/orders/{orderId}/items/{itemId} <!-- Changed -->


### Acceptance Criteria <!-- Changed -->

- Uses order(status=DRAFT) as the cart
- Only the owner can access/modify the draft order
- Items can be added
- Items can be removed
- Quantities update correctly
- Cart persists after refresh
- One active DRAFT order per customer
- Totals returned are correct
- Adding/updating items does not change inventory quantities
- Responses use contract error structure
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

## B3.3.2 – Finalize Order API (Backend) <!-- Changed -->

### Description
Allow customers to finalize DRAFT orders. <!-- Changed -->

### Tasks <!-- Changed -->

- Locate customer DRAFT order
- Validate order has at least 1 item
- Validate order identity: customer XOR guest_email
- Validate availability
- Perform payment simulation:
    - If required fields present = pass
    - If required fields missing = fail
- Lock pricing field
- Transition status DRAFT to PENDING

Create submit endpoint:
- POST /api/v1/orders/{orderId}/finalize


### Acceptance Criteria <!-- Changed -->

- Order status becomes PENDING
- Finalize fails if required information missing
- Finalize fails if order empty
- Availability validated before finalize
- Failed finalize leaves order in DRAFT

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
- GET /api/v1/orders/{id}


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
- GET /api/v1/orders/history


### Acceptance Criteria

- Returns only logged-in user orders
- Sorted newest first
- Users can only access their own orders
- DRAFT orders excluded <!-- New -->

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
  - name (first, last) <!-- sr -- >
  - address <!-- SR -->
  - email
  - phone

---

# Order Item Customization

## Original User Story

**US3.7**

As a customer, I want to customize items (extras or notes) so that my order matches my preferences.

---

## F3.7.1 – Item Customization Page (Frontend) <!-- New -->

### Description

Create UI that allows customers to select modifier options for a product variant before adding it to the cart.

### Tasks

- Display modifier groups for selected variant
- Display modifier options for each group
- Show price adjustments for options
- Allow option selection
- Show updated item price dynamically
- Submit selected options when adding item to cart

### Acceptance Criteria

- Modifier groups display correctly
- Modifier options display correctly
- Required groups enforced
- Min/max selections enforced
- Price updates when options selected
- Selected options sent to backend
- Variant without modifiers skips customization page

---

## B3.7.2 – Modifier Retrieval API (Backend) <!-- New -->

### Description

Provide endpoints to retrieve modifier information for a variant.
### Tasks

Return:

- variantId
- modifierGroups:
    - groupId
    - name
    - required
    - minSelections
    - maxSelections

    - options:
        - optionId
        - name
        - priceAdjustment

Create endpoints:
- GET /api/v1/variants/{variantId}/modifiers



### Acceptance Criteria

- Returns modifier groups for variant
- Returns modifier options
- Required flag returned
- Min/max values returned
- Returns empty list if variant has no modifiers
- Only valid variantId accepted
- Tested with Postman

---

## B3.7.3 – Add Item with Modifiers API (Backend) <!-- New -->

### Description

Extend cart item creation endpoint to support modifier selections.
### Tasks

Implement:

-validate:
    - Options belong to variant
    - Required groups satisfied
    - Min selections satisfied
    - Max selections not exceeded
 
- Create:
    - OrderItem
    - OrderItemModifier records
    
- Recalculate:
    - itemTotal
    - subtotal
    - totalPaymentDue

Create endpoints:
- POST /api/v1/orders/{orderId}/items



### Acceptance Criteria

- Items can be added with modifiers
- OrderItemModifier records created
- Invalid modifiers rejected
- Required groups enforced
- Min/max enforced
- Prices calculated correctly
- Totals updated correctly

---

# B3.7.4 – Update Item Modifiers API <!-- New -->

## Description

Allow modification of selected options on existing cart items.

## Tasks

Endpoint:

PATCH /api/v1/orders/{orderId}/items/{itemId}


Actions:

- Update OrderItem quantity
- Replace OrderItemModifier records
- Recalculate totals

## Acceptance Criteria

- Modifiers update correctly
- Old modifiers removed
- New modifiers saved
- Totals recalculated
- Validation enforced

---

# F3.7.5 – Cart Display of Customizations <!-- New -->

## Description

Display modifier selections on the cart page.

## Tasks

Show modifier selections under each item:

Example:

Large Pizza  
- Pepperoni  
- Extra Cheese  

## Acceptance Criteria

- Modifiers visible in cart
- Correct modifiers shown
- Price reflects modifiers

---

# B3.7.6 – Draft Order API Modifier Support <!-- New -->

## Description

Extend draft order retrieval to include modifier selections.

Existing endpoint:

GET /api/v1/orders?status=DRAFT

## Tasks

Return modifiers with each item:

- items:

  - itemId
  - variantName

  - modifiers:
    - optionId
    - name
    - priceAdjustmentCharged

## Acceptance Criteria

- Modifiers returned for each item
- Empty list returned if none selected
- Names returned for UI display
- Prices match stored values

### Product Owner Decision <!-- Changed -->

Although I think this may be out of scope for this sprint, I have added backlog items for it so we can see what it would require.
