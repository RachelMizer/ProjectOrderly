# Sprint 5 Testing Matrix

Project: Orderly  
Sprint: Sprint 5 — Admin Functionality, Reporting, Inventory, and Final QA  
QA Lead: Kenny Bacdayan  

This matrix tracks testing progress across all Sprint 5 user stories and related admin functionality.  
Rows are updated as manual, backend, frontend, and end-to-end testing are completed.

---

# Test Coverage Matrix

| User Story | Backend Task | Frontend Task | Feature | Test Cases | Tested By | Date Tested | Result | Notes |
|------------|--------------|---------------|---------|------------|-----------|-------------|--------|-------|
| US4.2 | N/A | F4.2 | Admin Navigation & Layout / RBAC Integration | TC-4.2-01, TC-4.2-02, TC-4.2-03 | Kenny | 4/24/2026 | Pass | Verified Admin Dashboard link visibility for BUSINESS users only, protected routes, redirects for logged-out/CUSTOMER users, persistent admin layout, and graceful 403 handling. |
| US5.1 | N/A | UX5.1, F5.1 | Admin Navigation Shell & Layout | TC-5.1-01, TC-5.1-02, TC-5.1-03 | Kenny | 4/24/2026 | Pass | Verified admin shell, persistent sidebar/topbar/footer, route navigation, dashboard cards, deferred disabled links, account settings display, logout flow, and RBAC behavior. |
| US5.2 | B5.2 | UX5.2, F5.2 | Admin Product & Variant Management | TC-5.2-01, TC-5.2-02, TC-5.2-03, TC-5.2-04 | Kenny | 4/24/2026 | Pass | Verified full product CRUD, variant CRUD, data persistence, validation handling, negative value rejection, product-variant relationship enforcement, and BUSINESS-only access control. |
| UX5.2 | B5.2 | UX5.2, F5.2 | Admin Product Management UI | TC-UX5.2-01, TC-UX5.2-02, TC-UX5.2-03 | Kenny | 4/24/2026 | Pass | Verified Product Catalog page, create/edit/delete forms, delete confirmation modal, supplier flow, variant inline actions, search, sorting, cancel actions, image preview/removal, and stable alert handling. |
| US5.3 | B5.3 | F5.3 | Inventory Management API / Variant Inventory | TC-5.3-01, TC-5.3-02, TC-5.3-03 | Kenny | 4/24/2026 | Pass | Verified inventory levels per variant, stock update persistence, stock cannot go below 0, immediate product availability sync, response includes variant name, and unauthorized users receive 403. |
| UX5.3 | B5.3 | UX5.3, F5.3 | Inventory Management UI | TC-UX5.3-01, TC-UX5.3-02, TC-UX5.3-03, TC-UX5.3-04 | Kenny | 4/24/2026 | Pass | Verified inventory page loads, ingredient-controlled and count-based sections render, affected drinks display, inline editing updates UI, item creation works, validation errors surface, and unauthorized users are redirected. |
| UX5.3 / F5.3 | B5.3 | UX5.3, F5.3 | Inventory Search, Sorting, Create, and Validation | TC-UX5.3-05, TC-UX5.3-06, TC-UX5.3-07 | Kenny | 4/24/2026 | Pass | Verified search filtering, stock and reorder level editing, Saved feedback, negative input styling, create panel behavior, duplicate item prevention, cancel reset, current stock sorting, empty states, and API integration. |
| US5.4 | B5.4 | UX5.4, F5.4 | Sales Dashboard Reporting Endpoints | TC-5.4-01, TC-5.4-02, TC-5.4-03, TC-5.4-04 | Kenny | 4/24/2026 | Pass | Verified sales summary endpoint, completed-order-only reporting, revenue calculations, breakdown grouping, best/worst sellers, category reporting, limit validation, date validation, and RBAC enforcement. |
| US5.4 | B5.4 | UX5.4, F5.4 | Sales Summary Dashboard UI | TC-F5.4-01, TC-F5.4-02, TC-F5.4-03 | Kenny | 4/24/2026 | Pass | Verified dashboard sections, stat cards, chart component, year/month filters, clear filters, search input, Reports navigation, API integration, empty states, and no rendering crashes. |
| UX5.4 / F5.4 Dependency | B5.4 | F5.4 | Sales Reporting + Seed Data | TC-5.4-05, TC-5.4-06 | Kenny | 4/24/2026 | Pass | Verified seeded COMPLETED order data appears in reports, zero-data ranges return clean responses, ORM field issue was resolved, response structure is frontend-ready, and reporting endpoints are stable. |
| US5.5 | B5.5 | F5.5 | Inventory Enhancements / Low Stock Indicators | TC-5.5-01, TC-5.5-02, TC-5.5-03 | Kenny | 4/24/2026 | Pass | Verified low-stock endpoint returns productVariants and inventoryItems at or below reorder level, excludes non-low-stock/null records, returns empty arrays gracefully, supports low-stock item creation, and enforces RBAC. |
| F5.5 | B5.5 | F5.5 | Low Stock Indicators UI | TC-F5.5-01, TC-F5.5-02 | Kenny | 4/24/2026 | Pass | Verified admin inventory page displays low/out-of-stock indicators, product dependency section appears for impacted items, availability controls render, and save buttons are present for supply inventory rows. |
| B5.9 | B5.9 | N/A | Order Fulfillment API | TC-B5.9-01, TC-B5.9-02, TC-B5.9-03 | Kenny | 4/24/2026 | Pass | Verified business users can retrieve non-draft orders, filter by status, view order details, complete pending orders, receive proper errors for invalid transitions, and RBAC blocks customers/unauthenticated users. |
| UI5.9 | B5.9 | UI5.9 | Admin Orders Page UI | TC-UI5.9-01, TC-UI5.9-02, TC-UI5.9-03, TC-UI5.9-04 | Kenny | 4/24/2026 | Pass | Verified orders table, status badges, search, status filter, date filters, clear filters, pending-only Mark Complete control, order detail navigation, item details, totals, recent orders sidebar, and serializer fix for order items. |

---

# Execution Status Summary

| Status | Meaning |
|--------|---------|
| Not Started | Testing has not begun |
| In Progress | Testing currently being executed |
| Pass | All test steps passed |
| Fail | One or more steps failed |
| Blocked | Cannot test due to dependency |

---

# Testing Methods Used

| Test Type | Tools / Method | Coverage |
|----------|----------------|----------|
| Backend API Testing | pytest, Postman, PowerShell requests | Product management, variants, inventory, reports, low stock, order fulfillment, validation, RBAC |
| Frontend Unit / Integration Testing | Jest, React Testing Library, npm test coverage | Admin navigation, product management UI, inventory UI, sales dashboard UI, orders UI |
| End-to-End Testing | Robot Framework with SeleniumLibrary | Business admin login, admin navigation, inventory, product catalog, sales dashboard, orders, logout/session behavior |
| Manual Testing | Browser validation and screenshot evidence | UI/UX behavior, routing, layout consistency, redirects, validation messages, visual indicators, empty states |

---

# Sprint 5 Final QA Notes

- Sprint 5 focused on completing the admin experience, including navigation, product management, inventory management, reporting, low-stock indicators, and order fulfillment.
- All active Sprint 5 stories tested in this matrix passed.
- BUSINESS users can access protected admin functionality as expected.
- CUSTOMER and logged-out users are restricted from admin pages and endpoints.
- Validation and error states were tested across backend and frontend workflows.
- API responses were confirmed to match frontend needs after serializer and reporting fixes.
- No critical or high-severity defects remain open based on the testing summarized here.

---

# Final End-to-End Admin Flow Validated

Business Login → Admin Dashboard → Product Catalog → Product / Variant Management → Inventory Management → Low Stock Review → Sales Dashboard → Orders → Order Detail → Complete Order → Logout

