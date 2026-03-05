# Sprint 1 Test Cases – Orderly
(Sprint 1: Foundation & Environment Setup)

---

## Overview

Sprint 1 primarily delivers the initial project scaffold and development environment setup.  
Functional feature implementation has not yet begun.

This test file reflects:
- Environment smoke testing (executed)
- Feature-level test cases (prepared but currently blocked)

---

## TC-00 – Environment Smoke Test

### Test Case ID:
TC-00

### Feature:
Initial Codebase / Server Startup

### User Story:
As a developer, I want the initial codebase to run successfully so that the team can begin implementing features on a stable foundation.

### Preconditions:
- PR branch checked out locally
- Dependencies installed
- Required environment variables configured (if applicable)

### Test Steps:
1. Start the backend (Django) server.
2. Open backend URL in browser.
3. Verify Django default success page loads.
4. Start the frontend server.
5. Open frontend URL in browser.
6. Verify placeholder page ("Orderly frontend working...") loads.
7. Check browser console for critical errors.
8. Check backend logs for runtime errors.

### Expected Result:
- Backend starts without crashes or tracebacks.
- Django success page loads correctly.
- Frontend starts without crashes.
- Placeholder frontend page loads successfully.
- No blocking console or server errors.

### Actual Result:
Backend and frontend both start successfully. Placeholder pages load as expected.

### Status:
Pass

### Notes:
Functional features are not yet implemented. Feature-level test cases remain blocked until implementation.

---

# Functional Test Cases (Prepared for Future Execution)

---

## TC-01 – Product Browsing Interface

### Test Case ID:
TC-01

### Feature:
Product Browsing Interface

### User Story:
As a customer, I want to browse available products or menu items so that I can decide what I want to order.

### Preconditions:
- User is logged in as customer
- Product data exists

### Test Steps:
1. Navigate to product browsing page.
2. View available products.

### Expected Result:
- Product list is displayed.
- Each product shows basic information (name, price).
- No errors occur.

### Actual Result:

### Status:
Blocked – Feature not implemented in Sprint 1 baseline

### Notes:
To be executed once product catalog is implemented.

---

## TC-02 – Order Submission and Status Tracking

### Test Case ID:
TC-02

### Feature:
Order Submission and Status Tracking

### User Story:
As a customer, I want to submit my order and see its current status so that I know when it is being prepared or completed.

### Preconditions:
- User is logged in
- At least one product is available

### Test Steps:
1. Add product to order.
2. Submit order.
3. View order status.

### Expected Result:
- Order submits successfully.
- Confirmation/status is displayed.

### Actual Result:

### Status:
Blocked – Feature not implemented in Sprint 1 baseline

### Notes:
To be executed once ordering functionality is implemented.

---

## TC-03 – Role-Based Access Control

### Test Case ID:
TC-03

### Feature:
Role-Based User Permissions

### User Story:
As a system administrator, I want to restrict access based on user roles so that customers and business users can only access relevant features.

### Preconditions:
- User logged in as customer

### Test Steps:
1. Attempt to access admin-only route.
2. Observe system behavior.

### Expected Result:
- Access is denied or redirected.
- Admin features are not accessible.

### Actual Result:

### Status:
Blocked – Feature not implemented in Sprint 1 baseline

### Notes:
To be executed once authentication and RBAC are implemented.

---

## TC-04 – Inventory Management

### Test Case ID:
TC-04

### Feature:
Inventory Management

### User Story:
As a business owner, I want to update inventory quantities in real time so that customers cannot order items that are out of stock.

### Preconditions:
- User logged in as business owner/admin
- Inventory feature available

### Test Steps:
1. Navigate to inventory page.
2. Modify product quantity.
3. Save changes.

### Expected Result:
- Inventory updates successfully.
- Updated quantity is reflected.

### Actual Result:

### Status:
Blocked – Feature not implemented in Sprint 1 baseline

### Notes:
To be executed once inventory feature is implemented.

---

# Sprint 1 Summary

- Environment smoke testing completed successfully.
- Codebase scaffold verified functional.
- Functional test cases prepared for upcoming feature implementation.
- No critical defects identified in baseline environment.

