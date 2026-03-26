# Epic 4 – Business Admin Tools

## Assumptions

When we say **business admin** or **admin**, we mean a business owner or operator who manages the store's products, inventory, orders, and settings through a protected admin interface. Admin users have the `business` role and are distinct from customers. All admin endpoints require authentication and return `403` for unauthorized access.

> **Capacity note:** Business admin items are Sprint 4 scope, but carry-over closure takes priority. If carry-over volume compresses the sprint, admin items may roll to Sprint 5.

---

# US4.1 Role-Based Access Control

*"As a system, I want all admin endpoints and UI to enforce role-based access so that only authenticated business users can reach admin tools, and unauthorized access is rejected cleanly."*

## B4.1 — Role-Based Access Control (Backend)

### Description

Restrict all admin endpoints to the `business` role and return structured error responses for unauthorized access.

### Tasks

- B4.1.1 Restrict endpoints to `business` role
- B4.1.2 Return `403` for unauthorized access
- B4.1.3 Enforce permissions on:
  - products (admin CRUD)
  - inventory
  - suppliers
  - reports
  - settings

### Acceptance Criteria

- Non-business users receive `403` on all admin endpoints
- Responses use contract error structure
- Permissions enforced consistently across all admin routes

---

## F4.1 — Role-Based Access Control (Frontend)

### Description

Hide admin UI from customers and handle unauthorized access gracefully.

### Tasks

- F4.1.1 Hide admin navigation and pages for non-admin users
- F4.1.2 Redirect unauthorized users away from admin routes
- F4.1.3 Handle `403` responses from backend gracefully

### Acceptance Criteria

- Admin UI not visible to customers
- Unauthorized users redirected correctly
- `403` errors handled without breaking the UI

---

---

# US4.2 Admin Dashboard Navigation

*"As a business admin, I want a persistent admin navigation menu with routes to all admin sections and a clear admin interface so I can move between tools quickly."*

**Note:** Frontend work only

## F4.2 — Admin Dashboard Navigation (Frontend)

### Description

Create the admin navigation shell and routing structure.

### Tasks

- F4.2.1 Create admin navigation menu
- F4.2.2 Add routes:
  - Products
  - Inventory
  - Suppliers
  - Reports
  - Settings
- F4.2.3 Ensure consistent layout across all admin pages

### Acceptance Criteria

- Navigation works across all admin pages
- UI layout is consistent
- Admin navigation is not visible to customers

---

---

# US4.3 Product Management

*"As a business admin, I want to create, edit, and delete products and variants through an admin interface so that the product catalog reflects current offerings."*

## B4.3 — Product Management API (Backend)

### Description

Expose admin endpoints for full product CRUD operations.

### Tasks

- B4.3.1 Implement `GET /api/v1/products` (admin view — all products regardless of availability)
- B4.3.2 Implement `POST /api/v1/products`
- B4.3.3 Implement `PATCH /api/v1/products/{id}`
- B4.3.4 Implement `DELETE /api/v1/products/{id}`
- B4.3.5 Add validation: name required, price ≥ 0
- B4.3.6 Define missing API contract section (Create/Update Product)
- B4.3.7 Restrict all endpoints to `business` role

### Acceptance Criteria

- Admin can create, edit, and delete products
- Data persists correctly
- Validation enforced on create and update
- Unauthorized users receive `403`
- New endpoints documented in API contract

---

## UX4.3 — Product Management Page (UX)

### Description

Design and build the UI components for the product management page. No live API wiring — static or mock data is acceptable. F4.3 depends on this card.

### Tasks

- UX4.3.1 Product list page layout
- UX4.3.2 Create product form — fields: name, price, availability
- UX4.3.3 Edit product form — pre-populated fields, inline validation feedback
- UX4.3.4 View product display
- UX4.3.5 Delete confirmation dialog
- UX4.3.6 Empty state for product list (no products yet)
- UX4.3.7 Validation error states: required field missing, price invalid

### Acceptance Criteria

- All form layouts and states are implemented and visually complete
- Validation feedback displays correctly for error states
- Delete confirmation dialog renders correctly
- Components are ready for API wiring — no hardcoded logic that would block integration

---

## F4.3 — Product Management Page (Frontend Integration)

### Description

Wire the product management UI components (UX4.3) to the backend API (B4.3). Handles all API calls, response handling, and state updates.

> Depends on UX4.3 and B4.3.

### Tasks

- F4.3b.1 Fetch and display product list from `GET /api/v1/products`
- F4.3b.2 Submit create product form to `POST /api/v1/products`
- F4.3b.3 Submit edit product form to `PATCH /api/v1/products/{id}`
- F4.3b.4 Handle delete action against `DELETE /api/v1/products/{id}`
- F4.3b.5 Handle `400` and `403` error responses
- F4.3b.6 Reflect changes in product list without page reload

### Acceptance Criteria

- Admin can create, view, edit, and delete products through the UI
- Product list updates immediately after any change
- Validation errors from backend surface correctly in the UI
- Unauthorized users cannot access the page

---

---

# US4.4 Inventory Management

*"As a business admin, I want to view and update inventory levels per variant so that stock is accurate and customers cannot order unavailable items."*

## B4.4 — Inventory Management API (Backend)

### Description

Expose endpoints for viewing and adjusting inventory levels.

### Tasks

- B4.4.1 Implement inventory view endpoint (stock levels per variant)
- B4.4.2 Implement adjust inventory endpoint
- B4.4.3 Enforce stock ≥ 0 constraint
- B4.4.4 Connect inventory updates to variants

### Acceptance Criteria

- Inventory levels viewable per variant
- Stock can be updated
- Stock cannot be set below 0
- Changes reflected in product availability immediately

---

## UX4.4 — Inventory Management Page (UX)

### Description

Design and build the UI components for the inventory management page. No live API wiring — static or mock data is acceptable. F4.4 depends on this card.

### Tasks

- UX4.4.1 Inventory list page layout — variant name, current stock per row
- UX4.4.2 Inline edit interaction for stock values
- UX4.4.3 Save confirmation feedback (success/error state)
- UX4.4.4 Invalid input state: stock below 0

### Acceptance Criteria

- Inventory list layout is complete with inline edit interaction
- Save feedback states are implemented
- Invalid input (below 0) is visually handled
- Components are ready for API wiring

---

## F4.4 — Inventory Management Page (Frontend Integration)

### Description

Wire the inventory management UI components (UX4.4) to the backend API (B4.4).

> Depends on UX4.4 and B4.4.

### Tasks

- F4.4b.1 Fetch and display inventory levels from view endpoint
- F4.4b.2 Submit stock updates to adjust inventory endpoint
- F4.4b.3 Handle `400` response for stock below 0
- F4.4b.4 Reflect updated stock in UI immediately after save

### Acceptance Criteria

- Inventory levels load correctly from backend
- Admin can update stock inline and save successfully
- Stock cannot be set below 0 — error surfaces correctly
- UI reflects changes immediately after save

---

## *DEFERRED — Sprint 5* —  Low Stock Indicators (Backend)

### Description

Expose a low-stock report endpoint using threshold logic.

### Tasks

- Implement low-stock report endpoint
- Add threshold logic: flag items at or below reorder level

### Acceptance Criteria

- Endpoint returns items at or below reorder threshold
- Threshold logic applied consistently

---

## *DEFERRED — Sprint 5* —  Low Stock Indicators (Frontend)

### Description

Surface low-stock items visually in the inventory UI.

### Tasks

- Highlight low-stock items in the inventory list
- Add "Low Stock" filter
- Visual indicator (color or tag) on low-stock rows

### Acceptance Criteria

- Low-stock items clearly visible
- Filter works correctly
- Visual indicator consistent with design

---

---

# *SCOPE CUT* — US4.5 Supplier Management

*"As a business admin, I want to add, edit, and link suppliers to products so that sourcing information is tracked alongside the catalog."*

---

## B4.5 — Supplier Management API (Backend)

### Description

Create backend support for supplier records and their association to products.

### Tasks

- B4.5.1 Create Supplier model endpoints: `GET`, `POST`, `PATCH /api/v1/suppliers`
- B4.5.2 Add validation: name required
- B4.5.3 Link supplier to product

### Acceptance Criteria

- Suppliers can be created and edited
- Products can reference a supplier
- Validation enforced

---

## F4.5 — Supplier Management Page (Frontend)

### Description

Create admin UI for managing suppliers.

### Tasks

- F4.5.1 Supplier list page
- F4.5.2 Add supplier form
- F4.5.3 Edit supplier form
- F4.5.4 Link supplier to products from the product edit form

### Acceptance Criteria

- Admin can add and edit suppliers
- Supplier can be linked to a product
- Supplier list reflects changes

---

---

# US4.6 Sales Summary Dashboard

*"As a business admin, I want a sales summary dashboard that shows total revenue, order count, and top-selling products so that I can track store performance at a glance."*

**Capacity note:** US4.6 is Sprint 4 scope but may defer to Sprint 5 if carry-over volume compresses the sprint.

---

## B4.6 — Sales Summary API (Backend)

### Description

Aggregate order data and expose a reporting endpoint.

### Tasks

- B4.6.1 Create sales summary endpoint
- B4.6.2 Aggregate order data: total revenue, order count
- B4.6.3 Add best-sellers calculation

### Acceptance Criteria

- Dashboard data endpoint returns total revenue and order count
- Best-selling products returned and ranked correctly
- Data matches underlying order records

---

## UX4.6 — Sales Summary Dashboard Page (UX)

### Description

Design and build the UI layout for the sales summary dashboard. No live API wiring — static or mock data is acceptable. F4.6 depends on this card.

### Tasks

- UX4.6.1 Dashboard page layout
- UX4.6.2 Total revenue display component
- UX4.6.3 Order count display component
- UX4.6.4 Top-selling products list layout
- UX4.6.5 Empty/loading state for dashboard data

### Acceptance Criteria

- Dashboard layout is visually complete with all data display components
- Loading and empty states are implemented
- Components are ready for API wiring

---

## F4.6 — Sales Summary Dashboard Page (Frontend Integration)

### Description

Wire the sales summary dashboard UI components (UX4.6) to the backend API (B4.6).

> Depends on UX4.6 and B4.6.

### Tasks

- F4.6b.1 Fetch sales summary data from reporting endpoint
- F4.6b.2 Populate total revenue, order count, and top-selling products
- F4.6b.3 Handle loading and empty states
- F4.6b.4 Enforce admin-only access

### Acceptance Criteria

- Dashboard loads correctly and displays live data
- Data matches underlying order records
- Admin-only access enforced

---

---

# *SCOPE CUT* —US4.7 Admin Settings

*"As a business admin, I want to view and update store settings (tax rate, contact info) so that the application reflects my business configuration."*

## B4.7 — Admin Settings API (Backend)

### Description

Create settings model and expose read/update endpoints.

### Tasks

- B4.7.1 Create settings model
- B4.7.2 Implement `GET /api/v1/settings`
- B4.7.3 Implement `PATCH /api/v1/settings`

### Acceptance Criteria

- Settings can be retrieved
- Settings can be updated
- Changes persist after save
- Restricted to `business` role

---

## UX4.7 — Admin Settings Page (UX)

### Description

Design and build the UI components for the admin settings page. No live API wiring — static or mock data is acceptable. F4.7 depends on this card.

### Tasks

- UX4.7.1 Settings page layout with editable form
- UX4.7.2 Fields: tax rate, contact info
- UX4.7.3 Save button with success/error feedback states
- UX4.7.4 Unsaved changes state (optional — if time allows)

### Acceptance Criteria

- Settings form layout is complete with all fields
- Save feedback states are implemented
- Components are ready for API wiring

---

## F4.7 — Admin Settings Page (Frontend Integration)

### Description

Wire the admin settings UI components (UX4.7) to the backend API (B4.7).

> Depends on UX4.7 and B4.7.

### Tasks

- F4.7b.1 Fetch current settings from `GET /api/v1/settings` on page load
- F4.7b.2 Submit updates to `PATCH /api/v1/settings`
- F4.7b.3 Handle success and error responses
- F4.7b.4 Confirm data persists after page refresh

### Acceptance Criteria

- Settings load correctly on page load
- Admin can update and save settings
- Data persists after refresh

---

---

# Documentation

---

## DC4.1 — API Contract Completion

### Description

The API contract contains blank stub sections for Create/Update Product, Inventory, Reporting, and Settings endpoints. As developers build and merge each admin endpoint, document it in the contract before the card moves to Done. Documentation happens alongside development — not at end of sprint.

### Tasks

- DC4.1.1 Monitor cards in Review/Testing
- DC4.1.2 Fill in each stub section as the corresponding endpoint ships:
  - Create/Update Product
  - Create/Update Variant
  - Create/Update Modifiers
  - View Inventory Levels
  - Adjust Inventory
  - Low-Stock Report
  - View Sales (Reporting)
- DC4.1.3 Confirm each documented endpoint matches the actual implementation
- DC4.1.4 Commit updated `API_Contract.md` to the repository

### Acceptance Criteria

- All shipped admin endpoints are documented in the contract before Sprint 4 Review
- Each entry includes: endpoint URL, method, authentication, role, request/response structure, and error responses
- No stub sections remain blank for endpoints that have been built and merged

---

## DC4.2 — Developer Setup README

### Description

The current setup documentation reflects the original Sprint 1 environment and is out of date. Produce a clean, accurate README that any team member — or evaluator — can follow to get the application running locally from scratch.

### Tasks

- DC4.2.1 Review Tristin's original environment setup doc
- DC4.2.2 Update to reflect the current stack:
  - MySQL 8.0 (not SQLite)
  - Django + DRF backend setup
  - React frontend setup
  - `requirements.txt` and `npm install` steps
  - Running database migrations and seed scripts
  - GitHub Actions CI/CD pipeline overview
  - Current branching strategy (reference `CONTRIBUTING.md`)
- DC4.2.3 Confirm steps work end-to-end on a clean clone
- DC4.2.4 Commit to repo root as `README.md`

### Acceptance Criteria

- A developer can clone the repo and get the app running locally following only the README
- MySQL setup, migrations, and seed data steps are accurate
- CI/CD and branching sections are current
- Reviewed and confirmed working before Sprint 4 Review

---

## DC5.1 — Deployment Documentation

### Description

Once decision is made on how to deploy the application, the deployment must be documented so it can be reproduced, understood by evaluators, and referenced during the presentation.

### Tasks

- Determine deployment platform and configuration
- Document:
  - Platform used (Railway, Render, or other)
  - Environment variables required and where to set them
  - Database setup on the hosted environment
  - How to trigger a redeploy from GitHub
  - Live URL(s) for frontend and backend
  - Any known gotchas or platform-specific workarounds
- Add deployment section to `README.md`
- Commit to repository

### Acceptance Criteria

- Deployment steps are documented and accurate
- Live URL is recorded in the README
- Another team member could follow the doc to redeploy
- Completed before Sprint 5 code freeze (Apr 17)

---

## DC5.2 — Final Project Documentation Release

**Owner:** Caleb Fowlkes
**Sprint:** 5

### Description

Assemble and finalize all project documentation artifacts into a clean release commit before the April 17 code freeze. This is the documentation package that gets submitted with the project.

### Tasks

- Audit the repository for documentation completeness:
  - `README.md` — current and accurate
  - `API_Contract.md` — all endpoints documented
  - `Data_Model.md` — reflects final schema
  - `CONTRIBUTING.md` — current
  - `docs/` folder — sprint artifacts, architecture docs, any design documents organized and present
- Flag any gaps to Serina before Apr 14
- Make final updates and commit
- Tag the release commit clearly

### Acceptance Criteria

- All documentation artifacts present and up to date in the repository
- No placeholder or stub content remaining in any doc
- Final commit made before Apr 17 code freeze
- Serina signs off before submission

---

# US4.8 Sprint 4 QA Execution

*"As a QA Lead, I want to track testing progress across all Sprint 4 items so that every feature — carry-overs and new admin work — is tested and verified before Sprint Review."*

---

## US4.8 — Sprint 4 QA Execution

### Description

Track and execute testing across all Sprint 4 deliverables.

### Tasks

- Create `Sprint4_Test_Cases.md`
- Create `Sprint4_Testing_Matrix.md`
- Validate end-to-end customer ordering flow (carry-overs) via UI navigation testing
- Validate admin features as they land
- Update testing matrix as each story is tested
- Flag and log any critical or high-severity defects
- Confirm all stories verified before Sprint Review

### Stories to Test

**Carry-Overs**

- [ ] US2.9 — Frontend Auth Components
- [ ] B3.7.2 — Modifier Retrieval API
- [ ] B3.3.2 — Finalize Order API
- [ ] B3.7.3/4 — Add/Update Item with Modifiers API
- [ ] B3.4.2 — Order Status API
- [ ] B3.5.2 — Order History API
- [ ] F3.1.1 — Product Browsing Page
- [ ] F3.2.1 — Shopping Cart Page
- [ ] F3.7.1 — Item Customization Page
- [ ] F3.7.5 — Cart Display of Customizations
- [ ] F3.3.1 — Checkout Page
- [ ] F3.4.1 — Order Confirmation Page
- [ ] F3.5.1 — Order History Page
- [ ] F3.6.1 — Profile Page

**New Sprint 4 Items**

- [ ]  US4.1 — Role-Based Access Control (B4.1.1 + F4.1.2)
- [ ]  US4.2 — Admin Dashboard Navigation (F4.2.1)
- [ ]  US4.3 — Product Management (B4.3 + UX4.3 + F4.3)
- [ ]  US4.4 — Inventory Management (B4.4 + UX4.4 + F4.4)
- [ ]  US4.6 — Sales Summary Dashboard (B4.6 + UX4.6 + F4.6) *(if capacity allows)*

### Acceptance Criteria

- Test cases and testing matrix referenced in card description
- All stories checked off as testing is completed
- No critical or high-severity defects remain open before stories move to Done
- QA execution completed before Sprint Review

> **QA support available:** Kim Mayo, Caleb Fowlkes, and Serina Rodriguez are available to run tests once Kenny has them written. Kenny to share his queue early so work can be distributed.

---

*Last updated: March 25, 2026 — Assumptions consolidated to single entry; UX cards introduced (UX4.3, UX4.4, UX4.6, UX4.7) with corresponding frontend integration cards (F4.3, F4.4, F4.6, F4.7); F4.1 and F4.2 unchanged; US4.8 stories to test updated to reflect new card structure; US4.5 cut; US4.7 cut; Low Stock Indicators deferred to Sprint 5; US4.6 active with capacity-based defer note; US4.8 stories to test updated* 
