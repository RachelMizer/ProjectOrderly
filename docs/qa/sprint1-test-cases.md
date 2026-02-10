# Sprint 1 Test Cases – Orderly

---

### Test Case ID:
TC-01

### Feature:
Product Browsing Interface

### User Story:
As a customer, I want to browse available products or menu items so that I can decide what I want to order.

### Preconditions:
- Application is running
- User is logged in as customer
- Product data exists (sample or seeded data)

### Test Steps:
1. Navigate to the product browsing or catalog page
2. View available products or menu items

### Expected Result:
- A list of products or menu items is displayed
- Each item shows basic information (such as name and price)
- No errors occur during page load

### Actual Result:

### Status:
Pass / Fail

### Notes:

---

### Test Case ID:
TC-02

### Feature:
Order Submission and Status Tracking

### User Story:
As a customer, I want to submit my order and see its current status so that I know when it is being prepared or completed.

### Preconditions:
- User is logged in as customer
- At least one product is available

### Test Steps:
1. Add a product to the order/cart
2. Proceed to submit the order
3. Observe the order status after submission

### Expected Result:
- Order is submitted successfully
- A confirmation or status indicator is displayed
- Order status is visible to the customer

### Actual Result:

### Status:
Pass / Fail

### Notes:
- Status may be basic or simulated in Sprint 1

---

### Test Case ID:
TC-03

### Feature:
Role-Based User Permissions

### User Story:
As a system administrator, I want to restrict access based on user roles so that customers and business users can only access features relevant to them.

### Preconditions:
- User is logged in as a customer

### Test Steps:
1. Attempt to access an admin-only page (such as inventory management)
2. Observe system behavior

### Expected Result:
- Customer is prevented from accessing admin-only features
- User is redirected or shown an authorization error
- Admin functionality is not displayed

### Actual Result:

### Status:
Pass / Fail

### Notes:

---

### Test Case ID:
TC-04

### Feature:
Inventory Management

### User Story:
As a business owner, I want to update inventory quantities in real time so that customers cannot order items that are out of stock.

### Preconditions:
- User is logged in as a business owner or admin
- Inventory management feature is accessible

### Test Steps:
1. Navigate to the inventory management page
2. Update the quantity of an existing product
3. Save the inventory changes

### Expected Result:
- Inventory quantity is updated successfully
- Updated quantity is reflected in the system
- No errors occur during update

### Actual Result:

### Status:
Pass / Fail

### Notes:
