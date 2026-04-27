# Sprint 4 Testing Matrix

Project: Orderly  
Sprint: Sprint 4 — Close the Customer Flow + Admin Foundation  
QA Lead: Kenny Bacdayan  

---

# Test Coverage Matrix

| User Story | Backend Task | Frontend Task | Feature | Test Cases | Tested By | Date Tested | Result | Notes |
|------------|--------------|---------------|---------|------------|-----------|-------------|--------|-------|
| US2.9 | Auth API | Frontend Auth | Registration, Login, Password Reset | TC-4.1-01 | Kenny | 4/3 | Pass | Auth forms, token handling, logout, persistence validated |
| US3.1 | B3.1.2 | F3.1.1 | Product Browsing | TC-4.2-01 / TC-4.3-01 | Kenny | 4/3 | Pass | Product UI and API pagination/filtering validated |
| US3.2 / US3.7 | B3.2.2 / B3.7.x | F3.2.1 / F3.7.5 | Cart Management + Modifier Display | TC-4.4-01 | Kenny | 4/3 | Pass | Cart items, modifiers, pricing, totals, persistence validated |
| US3.3 | B3.3.2 | F3.3.1 | Order Submission / Checkout | TC-4.5-01 / TC-4.6-01 | Kenny | 4/3 | Pass | Draft order submit, checkout UI, validation, redirect tested |
| US3.4 | B3.4.2 | F3.4.1 | Order Confirmation | TC-4.7-01 / TC-4.8-01 | Kenny | 4/3 | Pass | Receipt page, order detail, status API validated |
| US3.5 | B3.5.2 | F3.5.1 | Order History | TC-4.9-01 / TC-4.10-01 | Kenny | 4/3 | Pass | Past orders, pagination, draft exclusion, detail navigation tested |
| US3.6 | B3.6.2 | F3.6.1 | Profile Editing | TC-4.11-01 | Kenny | 4/3 | Pass | Profile load, update, validation, persistence verified |
| US3.7 | B3.7.2 / B3.7.3/4 | F3.7.1 | Product Customization | TC-4.12-01 / TC-4.13-01 / TC-4.14-01 | Kenny | 4/3 | Pass | Modifier retrieval, selection rules, pricing, cart modifier APIs tested |
| US4.1 | B4.1 | F4.1 | Role-Based Access Control | TC-4.15-01 | Kenny | 4/3 | Pass | Admin endpoint RBAC and frontend access control validated |

---

# Execution Status Summary

| Status | Meaning |
|------|------|
| Not Started | Testing has not begun |
| In Progress | Testing currently being executed |
| Pass | All test steps passed |
| Fail | One or more steps failed |
| Blocked | Cannot test due to dependency |

---

# Notes

- Sprint 4 focused on completing the customer ordering pipeline and admin access foundation.
- Backend endpoints were validated with pytest and manual API testing.
- Frontend functionality was validated through Jest, Robot Framework, and browser testing.
- Final customer flow validated:

Browse Products → Customize Item → Add to Cart → Checkout → Order Confirmation → Order History

- Admin foundation validated through RBAC and protected route testing.

---