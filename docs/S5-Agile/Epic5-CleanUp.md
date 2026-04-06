# 🌊 Sprint 5 – Recovery & Completion Plan

## Assumptions

Sprint 5 focuses on completing all remaining admin functionality, stabilizing the system, and preparing for final QA and delivery.

Work is prioritized by dependency:
1. Backend APIs (blockers)
2. Frontend integration
3. UX polish
4. Reporting & enhancements
5. Documentation & QA

---

# 🌊 Wave 1 — Core System (BLOCKERS)

Complete all backend + required frontend for a functional admin system.

---

# US5.1 Admin Navigation (Foundation)

## UX5.1 — Admin Dashboard Navigation (UX)

### Tasks
- UX5.1.1 Admin navigation menu layout and design
- UX5.1.2 Nav link states — default, active, hover
- UX5.1.3 Consistent admin page layout wrapper applied across all admin pages
- UX5.1.4 Placeholder/disabled state for deferred routes
- UX5.1.5 Responsive behavior for admin nav

### Acceptance Criteria
- Navigation visually complete
- All admin routes accessible
- Layout consistent across pages

---

## F5.1 — Admin Dashboard Navigation (Frontend Integration)

### Tasks
- F5.1.1 Connect nav links to React Router routes
- F5.1.2 Wire role check from auth context
- F5.1.3 Apply admin layout wrapper across all admin pages
- F5.1.4 Redirect unauthorized users
- F5.1.5 Handle 403 responses gracefully

### Acceptance Criteria
- Navigation works across all admin pages
- Unauthorized users blocked
- Layout consistent

---

---

# US5.2 Product Management (Core CRUD)

## B5.2 — Product Management API (Backend)

### Tasks
- B5.2.1 Implement GET /products (admin view)
- B5.2.2 Implement POST /products
- B5.2.3 Implement PATCH /products/{id}
- B5.2.4 Implement DELETE /products/{id}
- B5.2.5 Add validation rules
- B5.2.6 Update API contract
- B5.2.7 Restrict endpoints to business role

### Acceptance Criteria
- Full CRUD works
- Validation enforced
- 403 returned for unauthorized users

---

## UX5.2 — Product Management Page (UX)

### Tasks
- UX5.2.1 Product list page layout
- UX5.2.2 Create product form
- UX5.2.3 Edit product form
- UX5.2.4 Product display
- UX5.2.5 Delete confirmation dialog
- UX5.2.6 Empty state
- UX5.2.7 Validation states

---

## F5.2 — Product Management Page (Frontend Integration)

### Tasks
- F5.2.1 Fetch products
- F5.2.2 Create product
- F5.2.3 Edit product
- F5.2.4 Delete product
- F5.2.5 Handle 400/403 errors
- F5.2.6 Update UI dynamically

### Acceptance Criteria
- Full product management works from UI
- Changes reflect immediately

---

---

# US5.3 Inventory Management (HIGH PRIORITY)

## B5.3 — Inventory Management API (Backend)

### Tasks
- B5.3.1 Implement inventory view endpoint
- B5.3.2 Implement inventory update endpoint
- B5.3.3 Enforce stock ≥ 0
- B5.3.4 Sync with product availability

### Acceptance Criteria
- Inventory updates correctly
- Cannot go below 0
- Availability updates immediately

---

## UX5.3 — Inventory Management Page (UX)

### Tasks
- UX5.3.1 Inventory list layout
- UX5.3.2 Inline editing interaction
- UX5.3.3 Save feedback states
- UX5.3.4 Invalid input handling

---

## F5.3 — Inventory Management Page (Frontend Integration)

### Tasks
- F5.3.1 Fetch inventory data
- F5.3.2 Update stock
- F5.3.3 Handle validation errors
- F5.3.4 Update UI dynamically

### Acceptance Criteria
- Inventory fully functional from UI

---

---

# 🌊 Wave 2 — Business Features

---

# US5.4 Sales Dashboard

## B5.4 — Sales Summary API (Backend)

### Tasks
- B5.4.1 Aggregate total revenue
- B5.4.2 Count total orders
- B5.4.3 Calculate best sellers

---

## UX5.4 — Sales Summary Dashboard (UX)

### Tasks
- UX5.4.1 Dashboard layout
- UX5.4.2 Revenue display
- UX5.4.3 Order count display
- UX5.4.4 Top products list
- UX5.4.5 Loading/empty states

---

## F5.4 — Sales Summary Dashboard (Frontend Integration)

### Tasks
- F5.4.1 Fetch dashboard data
- F5.4.2 Display metrics
- F5.4.3 Handle loading/errors

---

---

# US5.5 Supplier Management

## B5.5 — Supplier Management API (Backend)

### Tasks
- B5.5.1 Create supplier endpoints
- B5.5.2 Add validation
- B5.5.3 Link supplier to products

---

## F5.5 — Supplier Management Page (Frontend)

### Tasks
- F5.5.1 Supplier list page
- F5.5.2 Add supplier form
- F5.5.3 Edit supplier form
- F5.5.4 Link suppliers to products

---

---

# 🌊 Wave 3 — Enhancements & Polish

---

# US5.6 Inventory Enhancements

## B5.6 — Low Stock Indicators (Backend)

### Tasks
- B5.6.1 Create low-stock endpoint
- B5.6.2 Add threshold logic

---

## F5.6 — Low Stock Indicators (Frontend)

### Tasks
- F5.6.1 Highlight low-stock items
- F5.6.2 Add filter
- F5.6.3 Visual indicators

---

---

# US5.7 Admin Settings (Optional)

## B5.7 — Settings API (Backend)
## UX5.7 — Settings Page (UX)
## F5.7 — Settings Integration (Frontend)

---

---

# 🌊 Wave 4 — Documentation & QA (CRITICAL)

---

# US5.8 Documentation Completion

## DC5.1 — API Contract Updates
## DC5.2 — README Updates
## DC5.3 — Deployment Documentation
## DC5.4 — Final Documentation Release

---

# US5.9 QA Execution

## QA5.1 — Sprint 5 QA Execution

### Tasks
- QA5.1.1 Execute test cases
- QA5.1.2 Validate all flows
- QA5.1.3 Log defects
- QA5.1.4 Confirm fixes

### Acceptance Criteria
- All features tested
- No critical defects remain
- System ready for demo

---

---

# 🚨 Notes

- Wave 1 MUST be completed first
- Backend → Frontend → UX → QA flow should be followed
- QA should begin as soon as features stabilize
- Documentation should be updated continuously