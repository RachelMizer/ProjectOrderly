# Orderly | Sprint 4 Plan

## Finish Strong

**Sprint:** Sprint 4 – Close the Customer Flow + Admin Foundation 
**Dates:** March 21 – April 3, 2026 
**PM/Scrum Master:** Serina Rodriguez 
**Product Owner:** Kim Mayo 
**Date:** March 23, 2026

> **Note:** Sprint 4 carries the heaviest backlog of the project. The team is doing the work — we are finishing what we started and delivering a working customer ordering experience before touching anything new.

------

## Sprint Goal

Close every outstanding customer-facing carry-over from Sprint 3, stand up the admin access foundation, and have a fully functional end-to-end ordering flow in testing by April 3.

------

## Expected Outcomes

By the end of Sprint 4, the team will deliver:

- US2.9 Frontend Authentication — complete, stable, and merged (Kim)
- A fully wired customer ordering pipeline: product browsing → cart → item customization → checkout → order confirmation
- Shopping cart with modifier selections displayed per item
- Order submission wired to the submit endpoint, transitioning DRAFT → PENDING
- Order confirmation page displaying receipt details
- User profile page wired to the existing profile API
- Role-based access control in place — backend enforcement and frontend routing
- Admin dashboard navigation shell — routes established for all admin sections
- Product management UI built and wired — admin can create, edit, and delete products
- Inventory management UI built and wired — admin can view and update stock levels
- Sales summary dashboard built and wired, if capacity allows — otherwise deferred to Sprint 5
- Order Status API merged and available for confirmation page wiring
- API contract updated for all merged endpoints (running task)
- Developer setup README updated and committed

------

## Features this Sprint

1. Frontend Authentication (carry-over — restart)
2. Product Browsing UI (carry-over)
3. Shopping Cart UI (carry-over)
4. Item Customization UI (carry-over)
5. Cart Display of Customizations (carry-over)
6. Checkout UI (carry-over)
7. Order Confirmation UI (carry-over)
8. User Profile UI (carry-over)
9. Role-Based Access Control
10. Admin Dashboard Navigation
11. Product Management (UX + Integration)
12. Inventory Management (UX + Integration)
13. Backend: Modifier APIs, Submit Order, Order Status (carry-overs)
14. Documentation

------

## What We're Building

Sprint 4 runs in two phases driven by a single gate.

**The gate:** US2.9 Frontend Authentication must be Done by Wednesday March 26. Nothing in the ordering pipeline can be wired or tested without stable auth. This is non-negotiable.

| Phase   | Focus                                     | Hard Deadline               |
| ------- | ----------------------------------------- | --------------------------- |
| Phase 1 | Auth gate + backend carry-overs close     | Wednesday 3/26              |
| Phase 2 | Full frontend pipeline + RBAC + admin nav | Saturday 3/29 → Tuesday 4/1 |
| Close   | QA pass, documentation, sprint wrap       | Thursday 4/3                |

> ⚠️ **Critical path:** Kim's US2.9 rebuild is the gate for everything Rachel picks up Thursday. If auth does not clear testing by Wednesday night, the entire frontend timeline compresses. Flag immediately if there is any risk of slipping.

------

## Scope Cuts — Formally Removed

The following items are not in Sprint 4 and will not be worked. They are either deferred to Sprint 5 or cut from the project entirely.

| Item                               | Decision                                                     |
| ---------------------------------- | ------------------------------------------------------------ |
| US4.5 Supplier Management          | Cut — no customer impact, no demo value                      |
| US4.7 Admin Settings               | Cut — not required for a working demo                        |
| Low Stock Indicators (B4.4 + UX/F) | Deferred to Sprint 5                                         |
| US4.6 Sales Summary Dashboard      | Sprint 4 scope — may defer to Sprint 5 if capacity compresses |

------

## Sprint 4 Backlog

### Phase 1 — Auth Gate + Backend Close

> US2.9 in Testing by Tuesday 3/25. Done by Wednesday 3/26. B3.7.2 and B3.3.2 closed by Wednesday 3/26. B3.7.3/4 closed by Friday 3/28.

------

#### US2.9 — Frontend Authentication Components

**Owner:** Kim Mayo **Deadline:** In Testing Tuesday 3/25 — Done Wednesday 3/26

**Delivers:** Complete login and registration UI rebuilt from scratch. Kim reviews Rachel's prior branch for anything reusable and rebuilds the rest. Wired to existing backend auth endpoints.

> This is the gate. Nothing else starts until this is Done.

------

#### B3.7.2 — Modifier Retrieval API

**Owner:** Tristin Gatt **Deadline:** Close QA by Wednesday 3/26

**Delivers:** `GET /api/v1/products/{productId}/variants/{variantId}/modifiers` — in QA at Sprint 3 close. Close it.

------

#### B3.3.2 — Submit Order API

**Owner:** Tristin Gatt **Deadline:** Close review and merge by Wednesday 3/26

**Delivers:** `PATCH /api/v1/orders/{orderId}/submit` — in Review at Sprint 3 close.

------

#### B3.7.3/4 — Add/Update Item with Modifiers API

**Owner:** Tristin Gatt **Deadline:** Complete and merge by Friday 3/28

**Delivers:**

- `POST /api/v1/orders/items` — add item with modifier selections
- `PATCH /api/v1/orders/items/{orderItemId}` — update item modifiers
- `POST /api/v1/orders/items/{orderItemId}/modifiers` — add modifier to order item

> Depends on B3.7.2 being closed first.

------

#### B3.4.2 — Order Status API

**Owner:** Tristin Gatt **Deadline:** Merged by Saturday 3/29

**Delivers:**

- `GET /api/v1/orders/{orderId}` — full order details
- `GET /api/v1/orders/{orderId}/status` — status only

> Needed before F3.4.1 can be fully wired.

------

### Phase 2 — Frontend Pipeline

> All frontend items start Thursday 3/27. Complete and in Review by Saturday 3/29. Testing Sunday 3/29 – Monday 3/30. Done by Tuesday 4/1.

------

#### F3.1.1 — Product Browsing Page

**Owner:** Kim Mayo **Deadline:** In Review Saturday 3/29

**Delivers:** Product list displaying name, variant name, price, and availability with an "Add to Cart" button per variant. Wired to `GET /api/v1/products`.

> Depends on US2.9 (Done) and B3.1.2 (Done in Sprint 3).

------

#### F3.2.1 — Shopping Cart Page

**Owner:** Rachel Mizer **Deadline:** In Review Saturday 3/29

**Delivers:** Cart page with quantity controls, remove buttons, and running total. Persistent across page refresh. Wired to Draft Order API.

> Depends on US2.9 (Done) and B3.2.2 (Done in Sprint 3).

------

#### F3.7.1 — Item Customization Page

**Owner:** Rachel Mizer **Deadline:** In Review Saturday 3/29

**Delivers:** Customization page shown before add-to-cart: modifier groups and options, live price updates, required group enforcement, min/max selections enforced. Selected options sent to backend on add.

> Depends on B3.7.2 and B3.7.3/4. Sequential after F3.2.1.

------

#### F3.7.5 — Cart Display of Customizations

**Owner:** Rachel Mizer **Deadline:** In Review Monday 3/30

**Delivers:** Modifier selections displayed under each cart item with correct pricing reflected.

> Depends on F3.2.1.

------

#### F3.3.1 — Checkout Page

**Owner:** Rachel Mizer **Deadline:** In Review Wednesday 4/1

**Delivers:** Checkout UI with simulated payment fields (name, address, city, state, zip, phone, payment type). Cannot submit empty cart. Wired to submit order endpoint.

> Depends on B3.3.2 and F3.2.1.

------

#### F3.4.1 — Order Confirmation Page

**Deadline:** In Review Saturday 3/29

**Delivers:** Confirmation page displaying order number, items, total, date, and status after successful order submission.

> Depends on B3.4.2. Caleb can build the page structure and UI independently — wiring to B3.4.2 completes once that API is merged.

------

#### F3.6.1 — Profile Page

**Owner:** Kim Mayo **Deadline:** In Review Saturday 3/29

**Delivers:** Profile form with save button. Fields: name, email, phone, address. Updates submit successfully.

> Depends on B3.6.2 (Done in Sprint 3). Fully independent — no ordering pipeline dependency.

------

### Phase 2 — Admin Foundation

> RBAC and Admin Nav in Review by Tuesday 4/1. Done by Thursday 4/3.

------

#### UX4.3 — Product Management Page (UX)

**Deadline:** In Review Tuesday 4/1

**Delivers:** UI components for the product management page — product list layout, create/edit/view forms, delete confirmation dialog, empty state, and validation error states. No live API wiring — static or mock data acceptable. F4.3 depends on this card.

> Can begin once admin nav shell is underway.

------

#### F4.3 — Product Management Page (Frontend Integration)

**Deadline:** In Review Thursday 4/3

**Delivers:** Product management UI (UX4.3) wired to B4.3 endpoints — fetch product list, create, edit, delete, error handling.

> Depends on UX4.3 and B4.3.

------

#### UX4.4 — Inventory Management Page (UX)

**Deadline:** In Review Tuesday 4/1

**Delivers:** UI components for the inventory management page — inventory list layout, inline edit interaction, save feedback states, invalid input state (stock below 0). No live API wiring — static or mock data acceptable. F4.4 depends on this card.

> Can begin once admin nav shell is underway.

------

#### F4.4 — Inventory Management Page (Frontend Integration)

**Deadline:** In Review Thursday 4/3

**Delivers:** Inventory management UI (UX4.4) wired to B4.4 endpoints — fetch inventory levels, submit stock updates, error handling.

> Depends on UX4.4 and B4.4.

------

#### B4.1 + F4.1 — Role-Based Access Control

**Owner:** Tristin Gatt (Backend) + Kim Mayo (Frontend) 
**Deadline:** In Review Tuesday 4/1

**Delivers:**

- Backend: all admin endpoints restricted to `business` role, `403` returned for unauthorized access
- Frontend: admin UI hidden from customers, unauthorized users redirected, `403` responses handled gracefully

> Gate for all Sprint 5 admin features.

------

#### F4.2 — Admin Dashboard Navigation

**Owner:** TBD 
**Deadline:** In Review Thursday 4/3

**Delivers:** Admin navigation shell with routes to Products, Inventory, Suppliers, Reports, and Settings. Consistent layout across all admin pages. Not visible to customers.

> Depends on RBAC being in Review or Done.

------

### Process + Documentation

------

#### DC4.1 — API Contract Completion

**Deadline:** Running task — document each endpoint as it merges, committed before Sprint 4 Review

**Delivers:** All merged Sprint 4 endpoints documented in `API_Contract.md`. No blank stubs for shipped endpoints.

------

#### DC4.2 — Developer Setup README

**Owner:** Caleb Fowlkes
**Deadline:** Committed to repo by Tuesday 4/1

**Delivers:** Updated `README.md` reflecting current stack: MySQL 8.0, Django + DRF, React, migrations, seed scripts, CI/CD overview, branching strategy.

------

#### US4.8 — Sprint 4 QA Execution

**Owner:** Kenny Bacdayan 
**Deadline:** Running task — QA items as they land, final pass by Thursday 4/3

**Delivers:**

- `Sprint4_Test_Cases.md`
- `Sprint4_Testing_Matrix.md`
- Testing all carry-over and Sprint 4 items as they reach the Testing column
- No item moves to Done with open critical or high-severity defects

**Stories to test:**

- [ ] US2.9 — Frontend Auth
- [ ] B3.7.2 — Modifier Retrieval API
- [ ] B3.3.2 — Submit Order API
- [ ] B3.7.3/4 — Add/Update Item with Modifiers
- [ ] B3.4.2 — Order Status API
- [ ] F3.1.1 — Product Browsing Page
- [ ] F3.2.1 — Shopping Cart Page
- [ ] F3.7.1 — Item Customization Page
- [ ] F3.7.5 — Cart Display of Customizations
- [ ] F3.3.1 — Checkout Page
- [ ] F3.4.1 — Order Confirmation Page
- [ ] F3.6.1 — Profile Page
- [ ] B4.1 + F4.1 — Role-Based Access Control
- [ ] F4.2 — Admin Dashboard Navigation
- [ ] US4.3 — Product Management (B4.3 + UX4.3 + F4.3)
- [ ] US4.4 — Inventory Management (B4.4 + UX4.4 + F4.4)
- [ ] US4.6 — Sales Summary Dashboard (B4.6 + UX4.6 + F4.6) *(if capacity allows)*

> **QA support available:** Kim Mayo, Caleb Fowlkes, and Serina Rodriguez are available to run tests once Kenny has them written. Kenny to share his queue early so work can be distributed.

------

#### US4.9 — Sprint 4 Demo Materials

**Owner:** Tyler Royal 
**Deadline:** Sprint 4 Review (April 3–4)

**Delivers:**

- Demo script for Sprint 4 Review — step-by-step run of show
- Screenshots collected from team members as cards hit Done
- Visual summary document following Sprint 3 structure (one section per team member)

------

## Sprint Timeline

| Date     | Event                                                        |
| -------- | ------------------------------------------------------------ |
| Sun 3/23 | Sprint 4 Kickoff — 7:00 PM                                   |
| Tue 3/25 | US2.9 in Testing (hard deadline)                             |
| Wed 3/26 | US2.9 Done · B3.7.2 Done · B3.3.2 Done                       |
| Wed 3/26 | Async standup due 8:00 PM                                    |
| Thu 3/27 | Frontend pipeline begins — all Phase 2 frontend items start  |
| Fri 3/28 | B3.7.3/4 merged                                              |
| Sat 3/29 | F3.1.1, F3.2.1, F3.7.1, F3.6.1, F3.4.1 — in Review           |
| Sun 3/29 | QA window — testing carry-over items                         |
| Mon 3/30 | F3.7.5 in Review · QA continues                              |
| Tue 4/1  | Async standup due 8:00 PM · RBAC in Review · DC4.2 committed |
| Wed 4/2  | Async standup due 8:00 PM · F3.3.1 in Review                 |
| Thu 4/3  | Sprint 4 close — all items Done or triaged · Health Check 7:00 PM |
| Fri 4/4  | Sprint 4 Review                                              |
| Sat 4/5  | Sprint 4 Retrospective                                       |

------

## Definition of Done

A task is done when:

- [ ] Code reviewed and merged to main per branching strategy
- [ ] All acceptance criteria met
- [ ] API endpoints tested with Postman
- [ ] New endpoints documented in API contract
- [ ] Trello card updated to Done

------

## QA Support

Kenny leads testing this sprint. The following team members are available to run tests once Kenny has them written:

- **Kim Mayo**
- **Caleb Fowlkes**
- **Serina Rodriguez**

> Kenny to share his test queue early so work can be distributed.

------

## Open Issues

1. Group to confirm platform choice (Railway or Render) before Sprint 5 begins so there are no surprises on Day 1 of Sprint 5.

------

*Last updated: March 25, 2026 — UX4.3, F4.3, UX4.4, F4.4 added to Phase 2 admin backlog; US4.6 reinstated as Sprint 4 scope with capacity-based defer note; US4.7 confirmed cut; Low Stock Indicators updated to deferred Sprint 5; scope cuts table, expected outcomes, features list, and QA stories updated*