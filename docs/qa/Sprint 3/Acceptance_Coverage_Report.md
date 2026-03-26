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
| US3.1 | Product Browsing | Not Tested | Not Started | N/A |
| US3.2 (B3.2.2) | Shopping Cart (Draft Order) | Fully Tested (Manual + Automated) | Pass | TC-3.2.2, Screenshots |
| US3.3 (B3.3.2) | Order Submission | Fully Tested (Manual + Automated) | Pass | TC-3.3.2, Screenshots |
| US3.4 | Order Confirmation | Not Tested | Not Started | N/A |
| US3.5 | Order History | Not Tested | Not Started | N/A |
| US3.6 (B3.6.2) | User Profile Management | Fully Tested (Manual + Automated) | Pass | TC-3.6.2, Screenshots |
| US3.7 | Item Customization | Not Tested | Not Started | N/A |
| US3.8 | Seed Data Validation | Fully Tested (Manual) | Pass | TC-3.8.2, Screenshots |

---

## Detailed Coverage

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

### ✅ US3.8 — Seed Data Validation
- Verified seed script execution
- Confirmed products, variants, and modifiers created
- Validated relationships between entities
- Confirmed reproducibility after DB reset

**Result:** Pass  

---

## Coverage Metrics

- Total User Stories in Sprint: 8  
- Fully Tested: 4  
- Not Started: 4  
- Failed: 0  
- Blocked: 0  

---

## Conclusion

All completed Sprint 3 user stories met their acceptance criteria and passed both manual and automated validation. Core customer ordering functionality—including cart management, order submission, user profile management, and seed data validation—was successfully verified. Remaining stories are pending implementation or testing.
