# Orderly — Sprint 5 Plan

**Team 7 | CSC 289.001** 
**Sprint Dates:** April 4–17, 2026 
**Code Freeze:** April 17, 2026
**Scrum Master / PM:** Serina Rodriguez 
**Product Owner:** Kim Mayo

------

## Sprint Goal

Complete all remaining admin functionality, stabilize the system, and prepare for final QA and delivery. Sprint 5 is the final development sprint. Code freeze is April 17. What ships in Sprint 5 is what gets demoed on April 30 at 1:25 PM.

------

## Assumptions

- Work is prioritized by dependency: Backend APIs first, then Frontend integration, then UX polish, then Reporting and enhancements, then Documentation and QA.
- UX cards (UX5.1, UX5.2, UX5.3, UX5.4) are static/mock only with no API wiring.
- US5.5 Low Stock Indicators is active Wave 3 scope — no greenlight required.
- US5.6 Admin Settings and US5.7 Supplier Management are stretch/capacity only and will only be picked up if Wave 1 and Wave 2 are fully landed ahead of deadline. These require greenlight from Serina before work begins.

------

## Sprint 5 Ownership

| Card  | Title                                 | Owner            | Wave              |
| ----- | ------------------------------------- | ---------------- | ----------------- |
| UX5.1 | Admin Dashboard Navigation (UX)       | Rachel Mizer     | Wave 1            |
| F5.1  | Admin Dashboard Navigation (Frontend) | Kim Mayo         | Wave 1            |
| B5.2  | Product Management API (Backend)      | Kim Mayo         | Wave 1            |
| UX5.2 | Product Management Page (UI)          | Rachel Mizer     | Wave 1            |
| F5.2  | Product Management Page (Frontend)    | Kim Mayo         | Wave 1            |
| B5.3  | Inventory Management API (Backend)    | Kim Mayo         | Wave 1            |
| UX5.3 | Inventory Management Page (UI)        | Rachel Mizer     | Wave 1            |
| F5.3  | Inventory Management Page (Frontend)  | Kim Mayo         | Wave 1            |
| B5.4  | Sales Summary API (Backend)           | Tristin Gatt     | Wave 2            |
| UX5.4 | Sales Summary Dashboard (UI)          | Rachel Mizer     | Wave 2            |
| F5.4  | Sales Summary Dashboard (Frontend)    | Tristin Gatt     | Wave 2            |
| B5.5  | Low Stock Indicators (Backend)        | Kim Mayo         | Wave 3            |
| F5.5  | Low Stock Indicators (Frontend)       | Rachel Mizer     | Wave 3            |
| US5.6 | Admin Settings                        | TBD              | Stretch only      |
| B5.6  | Settings API (Backend)                | TBD              | Stretch only      |
| UX5.6 | Settings Page (UI)                    | TBD              | Stretch only      |
| F5.6  | Settings Integration (Frontend)       | TBD              | Stretch only      |
| US5.7 | Supplier Management                   | TBD              | Stretch only      |
| B5.7  | Supplier Management API (Backend)     | TBD              | Stretch only      |
| UX5.7 | Supplier Management Page (UI)         | TBD              | Stretch only      |
| F5.7  | Supplier Management Page (Frontend)   | TBD              | Stretch only      |
| DC5.1 | API Contract Updates                  | Tristin Gatt     | Wave 4 — ongoing  |
| DC5.2 | Sprint 5 Demo Materials               | Caleb Fowlkes    | Wave 4            |
| DC5.3 | Sprint 5 Code Reviews                 | Caleb Fowlkes    | Wave 4 -- ongoing |
| QA5.1 | Sprint 5 QA Execution                 | Kenny Bacdayan   | Wave 4 — ongoing  |
| PM5.1 | Sprint 5 PM Tasks                     | Serina Rodriguez | Spans Sprint      |

------

## Wave Timeline

| Wave   | Focus                                   | Target   | Hard Deadline |
| ------ | --------------------------------------- | -------- | ------------- |
| Wave 1 | Admin Nav, Product Mgmt, Inventory Mgmt | April 9  | April 10      |
| Wave 2 | Sales Dashboard + Best Sellers          | April 13 | April 14      |
| Wave 3 | Low Stock Indicators                    | April 15 | April 16      |
| Wave 4 | Documentation & QA                      | Ongoing  | April 17      |

------

## 🌊 Wave 1 — Core System (BLOCKERS)

**Target: April 9 | Hard Deadline: April 10**

Wave 1 is the blocker for everything else. US5.5 Low Stock Indicators (Wave 3) may begin once Wave 1 is in Testing or Done. Stretch items US5.6 and US5.7 require Wave 1 AND Wave 2 to be fully in Done before assignment.

------

### US5.1 — Admin Navigation (Foundation)

------

*"As a business admin, I want a persistent admin navigation menu with routes to all admin sections and a clear admin interface so I can move between tools quickly."*

#### UX5.1 — Admin Dashboard Navigation (UI)

**Owner:** Rachel Mizer

**Tasks**

- UX5.1.1 Admin navigation menu layout and design
- UX5.1.2 Nav link states — default, active, hover
- UX5.1.3 Consistent admin page layout wrapper across all admin pages
- UX5.1.4 Placeholder/disabled state for deferred routes
- UX5.1.5 Responsive behavior for admin nav
- UX5.1.6 Components styled and consistent with branding (colors, typography, component library)

**Acceptance Criteria**

- Navigation visually complete with all active routes represented
- Link states (default, active, hover) implemented
- Admin page layout wrapper consistent across all admin pages
- Deferred routes visually present but clearly inactive
- Static/mock only — no API wiring required
- Components styled and consistent with branding (colors, typography, component library)

------

#### F5.1 — Admin Dashboard Navigation (Frontend Integration)

Wire the admin navigation UI components (UX4.2) to React Router and the auth context. Handles role-based visibility and redirect logic.

**Owner:** Kim Mayo

**Tasks**

- F5.1.1 Connect nav links to React Router routes
- F5.1.2 Wire role check from auth context — admin nav visible to business role only
- F5.1.3 Apply admin layout wrapper across all admin pages
- F5.1.4 Redirect unauthorized users away from admin routes
- F5.1.5 Handle 403 responses without breaking nav or layout

**Acceptance Criteria**

- Navigation routes correctly to all active admin sections
- Admin nav not visible to customers
- Unauthorized users redirected correctly
- 403 responses handled gracefully
- Layout wrapper consistent across all admin pages

------

### US5.2 — Product Management (Core CRUD)

------

*"As a business admin, I want to create, edit, and delete products and variants through an admin interface so that the product catalog reflects current offerings."*

#### B5.2 — Product Management API (Backend)

**Owner:** Kim Mayo

**Tasks**

- B5.2.1 Implement GET /api/v1/products (admin view — all products regardless of availability)
- B5.2.2 Implement POST /api/v1/products
- B5.2.3 Implement PATCH /api/v1/products/{id}
- B5.2.4 Implement DELETE /api/v1/products/{id}
- B5.2.5 Add validation: name required, price >= 0
- B5.2.6 Implement GET /api/v1/admin/products/{productId}/variants
- B5.2.7 Implement POST /api/v1/admin/products/{productId}/variants
- B5.2.8 Implement PATCH /api/v1/admin/products/{productId}/variants/{variantId}
- B5.2.9 Implement DELETE /api/v1/admin/products/{productId}/variants/{variantId}
- B5.2.10 Add validation: name is required, unit_price >= 0, variant must belong to specified product
- B5.2.11 Restrict all endpoints to business users (IsBusinessUser)
- B5.2.12 Ensure unauthorized users receive the INVALID_ROLE error format

**Acceptance Criteria**

- Admin can create, edit, and delete products
- Data persists correctly
- Validation enforced on create and update
- Unauthorized users receive 403
- New endpoints documented in API contract before card moves to Done
- Admin can create, edit, and delete variants for a product
- Product and variant data persist correctly
- Variants are correctly associated with their parent product
- Unauthorized users receive 403 with correct error format

------

#### UX5.2 — Product Management Page (UI)

**Owner:** Rachel Mizer

**Tasks**

- UX5.2.1 Product list page layout
- UX5.2.2 Create product form — fields: name, price, availability
- UX5.2.3 Edit product form — pre-populated fields, inline validation feedback
- UX5.2.4 View product display
- UX5.2.5 Delete confirmation dialog
- UX5.2.6 Empty state for product list
- UX5.2.7 Validation error states: required field missing, price invalid
- UX5.2.8 Components styled and consistent with branding (colors, typography, component library)
- UX5.2.9 Variant list within product view — show all variants associated with a product
- UX5.2.10 Add variant form — fields: name, price
- UX5.2.11 Edit variant form — pre-populated fields, inline validation feedback
- UX5.2.12 Delete variant confirmation dialog
- UX5.2.13 Modifier group and option list — read-only display under each variant (name, options)
- UX5.2.14 Empty state for variant list and modifier list

**Acceptance Criteria**

- All form layouts and states implemented and visually complete
- Validation feedback displays correctly for error states
- Delete confirmation dialog renders correctly
- Static/mock only — components ready for API wiring
- Components styled and consistent with branding (colors, typography, component library)
- Variant list displays correctly within a product
- Add and edit variant forms implemented with validation states
- Modifier groups and options visible in read-only display per variant

------

#### F5.2 — Product Management Page (Frontend Integration)

Wire the product management UI components (UX5.2) to the backend API (B5.2). Handles all API calls, response handling, and state updates.

**Owner:** Kim Mayo

**Tasks**

- F5.2.1 Fetch and display product list from GET /api/v1/products
- F5.2.2 Submit create product form to POST /api/v1/products
- F5.2.3 Submit edit product form to PATCH /api/v1/products/{id}
- F5.2.4 Handle delete action against DELETE /api/v1/products/{id}
- F5.2.5 Handle 400 and 403 error responses
- F5.2.6 Reflect changes in product list without page reload
- F5.2.7 Fetch and display variant list from `GET /api/v1/admin/products/{productId}/variants`
- F5.2.8 Submit create variant form to `POST /api/v1/admin/products/{productId}/variants`
- F5.2.9 Submit edit variant form to `PATCH /api/v1/admin/products/{productId}/variants/{variantId}`
- F5.2.10 Handle delete variant action against `DELETE /api/v1/admin/products/{productId}/variants/{variantId}`
- F5.2.11 Fetch and display modifier groups and options from `GET /api/v1/variants/{variantId}/modifiers` — read-only display only

**Acceptance Criteria**

- Admin can create, view, edit, and delete products through the UI
- Product list updates immediately after any change
- Validation errors from backend surface correctly in UI
- Unauthorized users cannot access the page
- Admin can create, edit, and delete variants within a product
- Variant list updates immediately after any change
- Modifier groups and options display correctly under each variant
- Empty modifier list handled gracefully

------

### US5.3 — Inventory Management (HIGH PRIORITY)

------

*"As a business admin, I want to view and manage inventory items through an admin interface so that stock levels and item details stay accurate and up to date."*

#### B5.3 — Inventory Management API (Backend)

Expose endpoints for viewing and adjusting inventory levels.

**Owner:** Kim Mayo

**Tasks**

- B5.3.1 Implement inventory view endpoint (stock levels per variant)
- B5.3.2 Implement inventory update endpoint
- B5.3.3 Enforce stock >= 0 constraint
- B5.3.4 Sync inventory updates with product availability
- B5.3.5 Restrict all endpoints to business role (IsBusinessUser)
- B5.3.6 Ensure unauthorized users receive `{"error": "INVALID_ROLE", "message": "user does not have this permission"}`
- B5.3.7 Return 400 with descriptive error message when stock update would result in value below 0
- B5.3.8 Confirm endpoint returns variant name alongside stock level in response

**Acceptance Criteria**

- Inventory levels viewable per variant
- Stock can be updated
- Stock cannot be set below 0
- Changes reflected in product availability immediately
- Unauthorized users receive 403 with correct error format
- 400 returned with descriptive message when stock < 0 attempted
- Response includes variant name for each inventory item

------

#### UX5.3 — Inventory Management Page (UI)

Design and build the UI components for the inventory management page. No live API wiring — static or mock data is acceptable.

**Owner:** Rachel Mizer

**Tasks**

- UX5.3.1 Inventory list layout — variant name, current stock per row
- UX5.3.2 Inline edit interaction for stock values
- UX5.3.3 Save confirmation feedback — success/error state
- UX5.3.4 Invalid input state: stock below 0
- UX5.3.5 Components styled and consistent with branding (colors, typography, component library)

**Acceptance Criteria**

- Inventory list layout complete with inline edit interaction
- Save feedback states implemented
- Invalid input (below 0) visually handled
- Static/mock only — components ready for API wiring
- Components styled and consistent with branding (colors, typography, component library)

------

#### F5.3 — Inventory Management Page (Frontend Integration)

**Owner:** Kim Mayo

**Tasks**

- F5.3.1 Fetch and display inventory levels from view endpoint
- F5.3.2 Submit stock updates to adjust inventory endpoint
- F5.3.3 Handle 400 response for stock below 0
- F5.3.4 Reflect updated stock in UI immediately after save

**Acceptance Criteria**

- Inventory levels load correctly from backend
- Admin can update stock inline and save successfully
- Stock cannot be set below 0 — error surfaces correctly
- UI reflects changes immediately after save

------

## 🌊 Wave 2 — Business Features

**Target: April 13 | Hard Deadline: April 14**

Wave 2 begins once Wave 1 items are in Testing or Done. Backend and UX can run in parallel.

------

### US5.4 — Sales Dashboard (incl. Best Sellers)

------

*"As a business admin, I want a sales summary dashboard that shows total revenue, order count, and top-selling products so that I can track store performance at a glance."*

#### B5.4 — Sales Summary API (Backend)

**Owner:** Tristin Gatt

**Tasks**

- B5.4.1 Create sales summary endpoint
- B5.4.2 Aggregate order data: total revenue, order count
- B5.4.3 Add best-sellers calculation — rank products by quantity sold
- B5.4.4 Restrict all endpoints to business role (IsBusinessUser)
- B5.4.5 Ensure unauthorized users receive `{"error": "INVALID_ROLE", "message": "user does not have this permission"}`

**Acceptance Criteria**

- Dashboard data endpoint returns total revenue and order count
- Best-selling products returned and ranked correctly by quantity sold
- Data matches underlying order records
- Unauthorized users receive 403 with correct error format

------

#### UX5.4 — Sales Summary Dashboard (UI)

**Owner:** Rachel Mizer

**Tasks**

- UX5.4.1 Dashboard page layout
- UX5.4.2 Total revenue display component
- UX5.4.3 Order count display component
- UX5.4.4 Top-selling products list layout
- UX5.4.5 Loading/empty states for dashboard data
- UX5.4.6 Components styled and consistent with branding (colors, typography, component library)

**Acceptance Criteria**

- Dashboard layout visually complete with all data display components
- Loading and empty states implemented
- Static/mock only — components ready for API wiring
- Components styled and consistent with branding (colors, typography, component library)

------

#### F5.4 — Sales Summary Dashboard (Frontend Integration)

**Owner:** Tristin Gatt

**Tasks**

- F5.4.1 Fetch sales summary data from reporting endpoint
- F5.4.2 Populate total revenue, order count, and top-selling products
- F5.4.3 Handle loading and empty states
- F5.4.4 Enforce admin-only access

**Acceptance Criteria**

- Dashboard loads and displays live data (revenue, order count, top sellers)
- Data matches underlying order records
- Loading and empty states handled correctly
- Admin-only access enforced

------

## 🌊 Wave 3 — Enhancements & Polish

**Target: April 15 | Hard Deadline: April 16**

------

### US5.5 — Inventory Enhancements (Low Stock Indicators)

------

*"As a business admin, I want low-stock items visually flagged in the inventory list so that I can identify and act on restocking needs before items run out."*

#### B5.5 — Low Stock Indicators (Backend)

**Owner:** Kim Mayo

**Tasks**

- B5.5.1 Create low-stock report endpoint
- B5.5.2 Add threshold logic: flag items at or below reorder level
- B5.5.3 Restrict endpoint to business role (IsBusinessUser)
- B5.5.4 Ensure unauthorized users receive `{"error": "INVALID_ROLE", "message": "user does not have this permission"}`
- B5.5.5 Return variant name and current stock level alongside low-stock flag in response
- B5.5.6 Return empty list (not 404) when no items are below threshold

**Acceptance Criteria**

- Endpoint returns items at or below reorder threshold
- Threshold logic applied consistently
- Unauthorized users receive 403 with correct error format
- Response includes variant name and stock level for each flagged item
- Empty list returned gracefully when no low-stock items exist

------

#### F5.5 — Low Stock Indicators (Frontend)

**Owner:** Rachel Mizer

**Tasks**

- F5.5.1 Highlight low-stock items in the inventory list
- F5.5.2 Add "Low Stock" filter
- F5.5.3 Visual indicator (color or tag) on low-stock rows

**Acceptance Criteria**

- Low-stock items clearly visible in inventory list
- Filter works correctly
- Visual indicator consistent with design

------

### US5.6 — Admin Settings *(Stretch Only)*

> ✅ **Stretch Greenlight Condition**
>
> US5.6 and US5.7 may not be assigned or started until Wave 1 AND Wave 2 are fully in Done. Once confirmed, Serina will post a greenlight message in Teams and assign owners at that time.

> Stretch/capacity only. Pick up only if Wave 1 and Wave 2 are fully landed ahead of deadline. Owner TBD at that time.

------

*"As a business admin, I want to view and update store settings such as tax rate and contact information so that the application reflects my business configuration."*

#### B5.6 — Settings API (Backend)

**Owner:** TBD

**Tasks**

- B5.6.1 Create settings model
- B5.6.2 Implement GET /api/v1/settings
- B5.6.3 Implement PATCH /api/v1/settings

**Acceptance Criteria**

- Settings can be retrieved and updated
- Changes persist after save
- Restricted to business role

------

#### UX5.6 — Settings Page (UI)

**Owner:** TBD

**Tasks**

- UX5.6.1 Settings page layout with editable form
- UX5.6.2 Fields: tax rate, contact info
- UX5.6.3 Save button with success/error feedback states
- UX5.6.4 Unsaved changes indicator (optional if time allows)
- UX5.6.5 Components styled and consistent with branding (colors, typography, component library)

**Acceptance Criteria**

- Form layout complete with all fields
- Save feedback states implemented
- Ready for API wiring — no hardcoded logic
- Components styled and consistent with branding (colors, typography, component library)

------

#### F5.6 — Settings Integration (Frontend)

**Owner:** TBD

**Tasks**

- F5.6.1 Fetch current settings from GET /api/v1/settings on page load
- F5.6.2 Submit updates to PATCH /api/v1/settings
- F5.6.3 Handle success and error responses
- F5.6.4 Confirm data persists after page refresh

**Acceptance Criteria**

- Settings load correctly on page load
- Admin can update and save successfully
- Data persists after refresh

------

### US5.7 — Supplier Management *(Stretch Only)*

> Removed from active sprint scope due to time and team capacity. Keeping cards in backlog labeled stretch/capacity only. Open for discussion if capacity allows after Wave 2 lands. Owner TBD at that time.

------

*"As a business admin, I want to add, edit, and link suppliers to products so that sourcing information is tracked alongside the catalog."*

#### B5.7 — Supplier Management API (Backend)

**Owner:** TBD

**Tasks**

- B5.7.1 Create supplier endpoints: GET, POST, PATCH /api/v1/suppliers
- B5.7.2 Add validation: name required
- B5.7.3 Link supplier to products

**Acceptance Criteria**

- Suppliers can be created and edited via API
- Products can reference a supplier
- Name validation enforced; returns 400 if missing
- Restricted to business role

------

#### UX5.7 — Supplier Management Page (UI)

**Owner:** TBD

**Tasks**

- UX5.7.1 Supplier list page layout
- UX5.7.2 Add supplier form
- UX5.7.3 Edit supplier form
- UX5.7.4 Link supplier to product — visible from product edit form
- UX5.7.5 Components styled and consistent with branding (colors, typography, component library)

**Acceptance Criteria**

- Supplier list layout complete
- Add and edit forms implemented
- Static/mock only — components ready for API wiring
- Components styled and consistent with branding (colors, typography, component library)

------

#### F5.7 — Supplier Management Page (Frontend)

**Owner:** TBD

**Tasks**

- F5.7.1 Supplier list page
- F5.7.2 Add supplier form
- F5.7.3 Edit supplier form
- F5.7.4 Link suppliers to products from product edit form

**Acceptance Criteria**

- Admin can view the full supplier list
- Admin can add a new supplier through the form
- Admin can edit an existing supplier's details
- Supplier can be linked to a product from the product edit form
- Supplier list reflects changes immediately without page reload
- Unauthorized users cannot access the page

------

## 🌊 Wave 4 — Documentation & QA (CRITICAL)

Documentation is a running task throughout the sprint. QA begins as soon as Wave 1 features stabilize — do not wait for code freeze.

------

### US5.8 — Documentation

------

#### DC5.1 — API Contract Updates

**Owner:** Tristin Gatt **Type:** Running task — spans full sprint

*"As a developer, I want the API contract to stay current as each endpoint is built so that frontend and backend development remain in sync and the final contract reflects the complete system."*

**Tasks**

- DC5.1.1 Document B5.2 product management endpoints as each is merged (GET, POST, PATCH, DELETE /api/v1/products)
- DC5.1.2 Document B5.3 inventory management endpoints as each is merged (view and update)
- DC5.1.3 Document B5.4 sales summary and best sellers endpoint as merged
- DC5.1.4 Document B5.5 low-stock report endpoint if Wave 3 is greenlighted
- DC5.1.5 Review all stub sections remaining from Sprint 4 and confirm they are filled or explicitly marked out of scope
- DC5.1.6 Submit final API contract PR before code freeze on April 17

**Acceptance Criteria**

- All Sprint 5 endpoints fully documented in the API contract before their corresponding backend card moves to Done
- Each endpoint entry includes: authentication requirement, role, request body, validation rules, and all expected response cases including error codes
- No stub sections remain blank at code freeze
- Final API contract PR submitted and merged before April 17
- Contract is consistent with the data model and actual implemented endpoints

> **Note:** Documentation happens alongside development — not at the end of the sprint. The API contract is the source of truth for frontend implementation. If an endpoint is built and not documented, the card is not Done.

------

#### DC5.2 — Sprint 5 Demo Materials

*"As a Technical Writer, I want to collect and organize sprint deliverable screenshots into a visual summary so that the team has complete demo materials ready for Sprint Review."*

**Owner:** Caleb Fowlkes **Depends on:** Wave 1 items stabilizing — screenshots can't be collected until features are visually complete

**Tasks**

- DC5.2.1 Collect screenshots from each team member as their cards reach Done
- DC5.2.2 Organize screenshots with clear filenames and upload to shared repo folder
- DC5.2.3 Build visual summary document covering Sprint 5 deliverables
- DC5.2.4 Submit final visual summary to Serina for review at least 2 hours prior to Sprint Review
- DC5.2.5 Notify team that materials are ready for review

**Acceptance Criteria**

- Screenshots collected from all team members for completed cards in Done list
- Visual summary document complete and committed to the repo
- Visual summary covers all Sprint 5 features in presentation order
- Pull request submitted and tagged for Serina's review
- Materials ready no later than April 16

> **Note for Caleb:** Don't wait until end of sprint to collect screenshots. Reach out as each card hits Done — chasing them all at once on the last day is much harder.

------

### DC5.3 — Sprint 5 Code Reviews

**Owner:** Caleb Fowlkes **Type:** Running task — spans full sprint

*"As a Code Review Lead, I want to review all Sprint 5 pull requests against our standards so that merged code is clean, consistent, and ready for final delivery."*

**Tasks**

- DC5.3.1 Review all Sprint 5 PRs per CONTRIBUTING.md standards
- DC5.3.2 Leave structured feedback on GitHub PR — approve or request changes
- DC5.3.3 Verify PR is linked to corresponding Trello card before approving
- DC5.3.4 Flag any architectural concerns or bugs found, ensure they are resolved before moving to testing
- DC5.3.5 Complete reviews within 24 hours of PR submission
- DC5.3.6 Leave comment on Trello card notifying that the review is complete
- DC5.3.7 Update Trello card labels accordingly
- DC5.3.8 Move card to QA/Testing list if review passes

**PRs to Review**

- UX5.1 — Admin Dashboard Navigation (UI)
- F5.1 — Admin Dashboard Navigation (Frontend Integration)
- B5.2 — Product Management API (Backend)
- UX5.2 — Product Management Page (UI)
- F5.2 — Product Management Page (Frontend Integration)
- B5.3 — Inventory Management API (Backend)
- UX5.3 — Inventory Management Page (UI)
- F5.3 — Inventory Management Page (Frontend Integration)
- B5.4 — Sales Summary API (Backend)
- UX5.4 — Sales Summary Dashboard (UI)
- F5.4 — Sales Summary Dashboard (Frontend Integration)
- B5.5 — Low Stock Indicators (Backend)
- F5.5 — Low Stock Indicators (Frontend)
- US5.6 — Admin Settings — *if Wave 3 greenlighted*
- US5.7 — Supplier Management — *if Wave 3 greenlighted*
- DC5.1 — API Contract Updates

**Acceptance Criteria**

- All Sprint 5 PRs reviewed and approved through GitHub before merging
- No PRs merged to main without a completed code review
- Review feedback documented in GitHub PR comments, not Trello
- Reviews completed within 24 hours of submission throughout the sprint

------

### US5.9 — QA Execution

------

#### QA5.1 — Sprint 5 QA Execution

**Owner:** Kenny Bacdayan

*"As a QA Lead, I want to track testing progress across all Sprint 5 items so that every feature is tested and verified before Sprint Review."*

Write test cases now, before Wave 1 lands. Begin testing Wave 1 items as they enter Testing from April 10 onward. Do not wait for code freeze to start.

**Tasks**

- QA5.1.1 Create `Sprint5_Test_Cases.md`
- QA5.1.2 Create `Sprint5_Testing_Matrix.md`
- QA5.1.3 Validate end-to-end admin flow via UI navigation testing as features land
- QA5.1.4 Validate admin features as they land — do not batch at end of sprint
- QA5.1.5 Update testing matrix as each story is tested
- QA5.1.6 Flag and log any critical or high-severity defects
- QA5.1.7 Confirm all stories verified before Sprint Review

**Stories to Test**

- [ ] US5.1 — Admin Navigation (UX5.1 + F5.1)
- [ ] US5.2 — Product Management (B5.2 + UX5.2 + F5.2)
- [ ] US5.3 — Inventory Management (B5.3 + UX5.3 + F5.3)
- [ ] US5.4 — Sales Dashboard + Best Sellers (B5.4 + UX5.4 + F5.4)
- [ ] US5.5 — Low Stock Indicators (B5.5 + F5.5)
- [ ] US5.6 — Admin Settings (B5.6 + UX5.6 + F5.6) — *if Wave 3 greenlighted*
- [ ] US5.7 — Supplier Management (B5.7 + UX5.7 + F5.7) — *if Wave 3 greenlighted*

**QA Admin**

- [ ] Link `Sprint5_Test_Cases.md` to card description
- [ ] Link `Sprint5_Testing_Matrix.md` to card description
- [ ] Update testing matrix as each story is tested
- [ ] Flag and log any critical or high-severity defects
- [ ] Confirm all stories verified before Sprint Review

**Acceptance Criteria**

- Test cases and testing matrix created and referenced in the card description
- All stories checked off as testing is completed
- No critical or high-severity defects remain open before stories move to Done
- QA execution completed before Sprint Review

> **QA support available:** Kim Mayo and Serina Rodriguez are available to run tests once Kenny has them written. Kenny to share his queue early so work can be distributed if needed.

------

## 📋 Sprint Management

------

#### PM5.1 — Sprint 5 PM Tasks

**Owner:** Serina Rodriguez **Spans:** Full sprint

*"As a Scrum Master, I want to actively manage and communicate sprint progress so that my team stays aligned, blockers are resolved quickly, and deliverables are completed on time."*

**Tasks**

- PM5.1.1 Facilitate Sprint 5 planning meeting and confirm all assignments
- PM5.1.2 Conduct Sprint 5 mid-sprint check-in (target April 10–11)
- PM5.1.3 Conduct daily async standups via Teams throughout sprint
- PM5.1.4 Monitor Trello board daily — flag any cards stalled in In Progress or Review for more than 48 hours
- PM5.1.5 Confirm Wave 1 greenlight and post Teams message when Wave 1 is fully in Done
- PM5.1.6 Assign Wave 3 owners at greenlight
- PM5.1.7 Submit Sprint 5 Week 1 Status Update (due Friday April 11)
- PM5.1.8 Facilitate Sprint 5 Review
- PM5.1.9 Facilitate Sprint 5 Retrospective
- PM5.1.10 Submit Sprint 5 Week 2 Status Update
- PM5.1.11 Prepare and submit Sprint 5 Review document to Professor Tabbal
- PM5.1.12 Conduct 1:1 check-ins with team members as needed

**Acceptance Criteria**

- Sprint 5 planning meeting facilitated and assignments confirmed
- Mid-sprint check-in held and documented
- Both weekly status updates submitted on time
- Wave 1 greenlight issued and Wave 3 owners confirmed
- Sprint Review and Retrospective facilitated
- Sprint 5 Review document submitted to Professor Tabbal

------

## Definition of Done

A card is Done when all of the following are true:

- [ ] Code reviewed and merged to main per branching strategy (CONTRIBUTING.md)
- [ ] All acceptance criteria met and verified
- [ ] API endpoints tested (Postman or Robot Framework)
- [ ] New endpoints documented in API contract (DC5.1) before card moves to Done
- [ ] Trello card updated to Done with final comment
- [ ] No critical defects remain open

------

## Key Dates

| Date        | Milestone                                      |
| ----------- | ---------------------------------------------- |
| April 4     | Sprint 5 begins                                |
| April 7     | Sprint 5 Planning Meeting                      |
| April 9     | Wave 1 target                                  |
| April 10    | Wave 1 hard deadline — Wave 3 greenlight check |
| April 10–11 | Mid-sprint check-in                            |
| April 11    | Sprint 5 Week 1 Status Update due              |
| April 13    | Wave 2 target                                  |
| April 14    | Wave 2 hard deadline                           |
| April 15    | Wave 3 target                                  |
| April 16    | Wave 3 / Demo Materials deadline               |
| April 17    | Code freeze — all development complete         |
| April 18–24 | Sprint 6 — polish and stabilization            |
| April 30    | Final presentation — 1:25 PM                   |

------

*Last updated: April 7, 2026 — Serina Rodriguez, Scrum Master / PM*