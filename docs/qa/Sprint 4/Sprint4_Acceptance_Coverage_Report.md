# Sprint 4 Acceptance Coverage Report

Project: Orderly  
Sprint: Sprint 4 — Close the Customer Flow + Admin Foundation  
QA Lead: Kenny Bacdayan  

---

## Overview

This report documents validation of Sprint 4 user stories against their acceptance criteria through manual testing, backend automated tests, frontend automated tests, and Robot Framework end-to-end testing.

Sprint 4 focused on completing the customer-facing order flow, validating authentication, wiring cart and checkout behavior, confirming order history and profile functionality, and establishing the admin RBAC foundation.

---

## Acceptance Coverage Summary

| User Story | Feature | Test Coverage | Result | Evidence |
|------------|---------|--------------|--------|---------|
| US2.9 | Registration, Login, Password Reset | Fully Tested Manual + Automated | Pass | TC-4.1-01 |
| US3.1 | Product Browsing UI/API | Fully Tested Manual + Automated | Pass | TC-4.2-01, TC-4.3-01 |
| US3.2 / US3.7 | Cart Management + Modifier Display | Fully Tested Manual + Automated | Pass | TC-4.4-01 |
| US3.3 | Checkout and Order Submission | Fully Tested Manual + Automated | Pass | TC-4.5-01, TC-4.6-01 |
| US3.4 | Order Confirmation + Receipt API | Fully Tested Manual + Automated | Pass | TC-4.7-01, TC-4.8-01 |
| US3.5 | Order History UI/API | Fully Tested Manual + Automated | Pass | TC-4.9-01, TC-4.10-01 |
| US3.6 | Profile Editing | Fully Tested Manual + Automated | Pass | TC-4.11-01 |
| US3.7 | Product Customization + Modifier APIs | Fully Tested Manual + Automated | Pass | TC-4.12-01, TC-4.13-01, TC-4.14-01 |
| US4.1 | Role-Based Access Control | Fully Tested Manual + Automated | Pass | TC-4.15-01 |

---

## Detailed Coverage

### US2.9 — User Interface for Registration and Login

- Verified registration, login, password reset request, and password reset confirmation forms.
- Confirmed required fields and validation behavior.
- Verified registration and login connect to backend authentication endpoints.
- Confirmed token storage, cookie handling, logout behavior, and authentication persistence.
- Tested invalid login and API/network failure handling.

Result: Pass

---

### US3.1 — Product Browsing

- Verified storefront product grid loads correctly.
- Confirmed product cards display product name, variant dropdown, price, and availability.
- Validated category filtering.
- Confirmed variant selection updates price and product details.
- Verified product browsing API pagination, filtering, sorting, and response structure.

Result: Pass

---

### US3.2 / US3.7 — Cart Management and Modifier Display

- Verified customized products can be added to the cart.
- Confirmed modifier selections display under cart items.
- Validated modifier pricing in item totals.
- Tested quantity increase/decrease behavior.
- Confirmed subtotal, tax, and grand total update correctly.
- Verified delete item, empty cart, empty state, and persistence after refresh.

Result: Pass

---

### US3.3 — Checkout and Order Submission

- Verified checkout page loads from cart.
- Confirmed draft order items, modifiers, and totals display correctly.
- Validated required customer fields and payment type behavior.
- Confirmed successful order submission transitions DRAFT to PENDING.
- Tested empty order, unavailable item, missing payment type, unauthorized access, unauthenticated access, and non-DRAFT submission handling.
- Confirmed failed submissions do not alter order status.

Result: Pass

---

### US3.4 — Order Confirmation and Receipt API

- Verified order confirmation page is accessible through Order History.
- Confirmed receipt displays order ID, date, status, items, tax, and total.
- Validated item-level details including product name, quantity, unit price, and item total.
- Tested order status endpoint and full receipt endpoint.
- Verified ownership enforcement, 401/403/404 handling, and unsupported method handling.

Result: Pass

---

### US3.5 — Order History

- Verified authenticated customers can access Order History.
- Confirmed only past non-DRAFT orders display.
- Validated order ID, status, total, and created date.
- Confirmed pagination behavior.
- Verified navigation from order history to order detail.
- Tested empty state and API error handling.
- Confirmed API returns only the logged-in user’s orders.

Result: Pass

---

### US3.6 — Profile Editing

- Verified Profile page loads for authenticated users.
- Confirmed profile data loads from API.
- Validated editable fields and disabled email field.
- Confirmed profile updates persist after refresh.
- Tested success message, loading state, backend validation errors, and unauthorized access behavior.

Result: Pass

---

### US3.7 — Product Customization and Modifier APIs

- Verified product customization page loads from View Details.
- Confirmed variant selection updates modifier groups.
- Validated single-select and multi-select modifier behavior.
- Confirmed max selection rules are enforced.
- Verified required modifier groups display.
- Confirmed total price updates based on selected modifiers.
- Tested modifier retrieval API and order item modifier API.
- Validated invalid modifier IDs, mismatched variants, unauthorized access, non-DRAFT restrictions, quantity updates, and modifier removal.

Result: Pass

---

### US4.1 — Role-Based Access Control

- Verified unauthenticated requests to admin endpoints return 401.
- Confirmed CUSTOMER users receive 403 Forbidden.
- Validated contract-compliant error response:
  `{ "error": "INVALID_ROLE", "message": "user does not have this permission" }`
- Confirmed permission checks occur before validation logic.
- Verified BUSINESS users can access protected admin endpoints.
- Confirmed successful PATCH/DELETE actions persist correctly.

Result: Pass

---

## Automated Coverage Supporting Acceptance

| Test Layer | Tool | Result |
|---|---|---|
| Backend | Pytest | Pass |
| Frontend | Jest | Pass |
| End-to-End | Robot Framework | Pass |

---

## Coverage Metrics

| Metric | Count |
|---|---|
| Sprint 4 User Stories / Features Tested | 9 |
| Fully Tested | 9 |
| Not Started | 0 |
| Failed | 0 |
| Blocked | 0 |

---

## Conclusion

All Sprint 4 tested user stories were fully validated and met their acceptance criteria.

Sprint 4 successfully closed the customer ordering flow and established the admin RBAC foundation. Authentication, product browsing, cart management, customization, checkout, order confirmation, order history, profile editing, and admin access control were confirmed through layered manual and automated testing.

Final Sprint 4 Acceptance Status: PASS