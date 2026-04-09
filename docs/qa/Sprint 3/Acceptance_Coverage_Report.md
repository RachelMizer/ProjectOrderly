# Sprint 3 Acceptance Coverage Report  
Project: Orderly  
Sprint: Sprint 3 — Customer Ordering Experience  
QA Lead: Kenny Bacdayan  

---

## Overview

This report documents the validation of all Sprint 3 user stories against their acceptance criteria through both manual and automated testing. Testing included API validation, authorization checks, data validation, and end-to-end workflows.

---

## Acceptance Coverage Summary

| User Story | Feature | Test Coverage | Result | Evidence |
|------------|--------|--------------|--------|---------|
| US3.1 | Product Browsing | Fully Tested (Manual + Automated) | Pass | TC-3.1-01, Screenshots |
| US3.2 (B3.2.2) | Shopping Cart (Draft Order) | Fully Tested (Manual + Automated) | Pass | TC-3.2.2, Screenshots |
| US3.3 (B3.3.2) | Order Submission | Fully Tested (Manual + Automated) | Pass | TC-3.3.2, Screenshots |
| US3.4 | Order Confirmation | Fully Tested (Manual + Automated) | Pass | TC-3.4-01, Screenshots |
| US3.5 | Order History | Fully Tested (Manual + Automated) | Pass | TC-3.5-01, Screenshots |
| US3.6 (B3.6.2) | User Profile Management | Fully Tested (Manual + Automated) | Pass | TC-3.6.2, Screenshots |
| US3.7 | Item Customization | Fully Tested (Manual + Automated) | Pass | TC-3.7-01, Screenshots |
| US3.8 | Seed Data Validation | Fully Tested (Manual) | Pass | TC-3.8.2, Screenshots |

---

## Detailed Coverage

### ✅ US3.1 — Product Browsing
- Verified product list loads with correct names, prices, and availability
- Confirmed UI renders product cards correctly
- Validated data consistency between API and frontend
- Tested empty and edge states

**Result:** Pass  

---

### ✅ US3.2 — Shopping Cart (Draft Order)
- Verified draft order creation and persistence
- Confirmed only one active draft per user
- Validated item addition, merging, updates, and removal
- Tested authentication and authorization protections
- Verified input validation (invalid variant, invalid quantity)

**Result:** Pass  

---

### ✅ US3.3 — Order Submission
- Validated successful submission of draft orders
- Verified status transition to `PENDING`
- Confirmed error handling for:
  - Empty orders
  - Invalid inputs
  - Unauthorized access
  - Duplicate submissions
- Verified failed submissions do not change order state

**Result:** Pass  

---

### ✅ US3.4 — Order Confirmation
- Verified confirmation screen displays after successful order submission
- Confirmed receipt details (items, totals, order status) are accurate
- Validated UI behavior after order completion

**Result:** Pass  

---

### ✅ US3.5 — Order History
- Verified retrieval of previous orders for authenticated users
- Confirmed orders are displayed in correct order (most recent first)
- Validated data accuracy and UI rendering
- Confirmed exclusion of draft orders

**Result:** Pass  

---

### ✅ US3.6.2 — User Profile Management
- Verified profile retrieval (GET /me)
- Validated profile updates (PATCH /me)
- Confirmed partial updates work correctly
- Tested validation rules:
  - Email uniqueness
  - Phone format
  - State format
  - Zipcode format
- Verified authentication requirements

**Result:** Pass  

---

### ✅ US3.7 — Order Item Customization
- Verified modifier groups and options display correctly
- Validated selection rules (min/max constraints)
- Confirmed UI prevents invalid selections
- Tested integration with cart and order flow

**Result:** Pass  

---

### ✅ US3.8 — Seed Data Validation
- Verified seed script execution
- Confirmed products, variants, and modifiers created
- Validated relationships between entities
- Confirmed reproducibility after DB reset

**Result:** Pass  

---

## Coverage Metrics

- Total User Stories in Sprint: 8  
- Fully Tested: 8  
- Not Started: 0  
- Failed: 0  
- Blocked: 0  

---

## Conclusion

All Sprint 3 user stories were fully tested and successfully met their acceptance criteria. End-to-end customer ordering functionality—including product browsing, cart management, item customization, order submission, confirmation, order history, user profile management, and seed data validation—was validated through both manual and automated testing. The system is stable, and no blocking defects were identified.