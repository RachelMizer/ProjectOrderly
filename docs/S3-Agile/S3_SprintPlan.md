# Orderly | Sprint 3 Plan

## Customer Ordering Experience

**Sprint:** Sprint 3 – Customer Ordering Experience
**Dates: ** March 2 – March 15, 2026
**PM/SCRUM Master:** Serina Rodriguez
**Product Owner:** Kim Mayo 
**Date:** March 3, 2026

> **Note:** When we say *customer*, we mean someone ordering items from a store's website.

------

## Sprint Goal

Deliver a functional end-to-end customer ordering experience: browsing products, customizing items, managing a cart, and submitting an order with confirmation — built on the foundation established in Sprint 2.

------

## What We're Building

Everything in this sprint flows through one pipeline: 
		**🍏 products → 🛒 cart → 🛍️ checkout** 
The sprint is organized into three waves based on what blocks what.

| Wave   | Focus                                          | Hard Deadline                                  |
| ------ | ---------------------------------------------- | ---------------------------------------------- |
| Wave 1 | Product API, Modifier API, Seed Data           | Saturday 3/7                                   |
| Wave 2 | Product page, cart, customization UI + backend | Wednesday 3/11                                 |
| Wave 3 | Checkout, confirmation, order history          | Code freeze Friday (LATEST Saturday 3/14) 3/13 |

> ⚠️ **Critical path:** 
> Tristin's Wave 1 backend work (B3.1.2) is the blocker for everything else. If it slips past Saturday 3/7, Wave 2 compresses and Wave 3 is at risk.

------

## User Stories & Assignments

### US3.1 — Product Browsing Interface

*As a customer, I want to view a list of products with names, prices, and availability so that I can select items to order.*

| Task                           | Owner      | Wave |
| ------------------------------ | ---------- | ---- |
| B3.1.2 — Product Browsing API  | Tristin G. | 1    |
| F3.1.1 — Product Browsing Page | Rachel M.  | 2    |

**Backend delivers:** 
`GET /api/v1/products` — returns products with variants (variantId, variantName, unitPrice, availability). Availability: `stock_quantity IS NULL` or `> 0` = available. 

**Frontend delivers:** 
Product list with name, variant name, price, availability, and "Add to Cart" per variant.

------

### US3.2 — Shopping Cart System

*As a customer, I want to add, remove, and update quantities in my cart and have it saved automatically so I can prepare my order without losing my selections.*

| Task                        | Owner      | Wave |
| --------------------------- | ---------- | ---- |
| B3.2.2 — Draft Order API    | Tristin G. | 2    |
| F3.2.1 — Shopping Cart Page | Rachel M.  | 2    |

**Backend delivers:** 
DRAFT order as cart. One active DRAFT per customer. Endpoints: `GET /api/v1/orders?status=DRAFT`, `POST /api/v1/orders/{orderId}/items`, `PATCH /api/v1/orders/{orderId}/items/{itemId}`, `DELETE /api/v1/orders/{orderId}/items/{itemId}`. Returns full order with items, modifiers, and totals. Adding/updating items does not affect inventory. 

**Frontend delivers:** Cart page with quantity controls, remove buttons, running total, persistent across refresh.

------

### US3.3 — Order Submission

*As a customer, I want to submit my order and see its current status so that I know when it is being prepared or completed.*

| Task                        | Owner      | Wave |
| --------------------------- | ---------- | ---- |
| B3.3.2 — Finalize Order API | Tristin G. | 3    |
| F3.3.1 — Checkout Page      | Rachel M.  | 3    |

**Backend delivers:** 
`POST /api/v1/orders/{orderId}/finalize` — validates order has items, validates availability, runs payment simulation (required fields present = pass), locks pricing, transitions DRAFT → PENDING. Failed finalize leaves order in DRAFT. 

**Frontend delivers:** Checkout page showing cart contents and total, submit button, cart clears on success.

------

### US3.4 — Order Confirmation with Receipt

*As a customer, I want to see a confirmation screen with my receipt after placing an order so that I have immediate proof of my purchase.*

| Task                             | Owner      | Wave |
| -------------------------------- | ---------- | ---- |
| B3.4.2 — Order Status API        | Tristin G. | 3    |
| F3.4.1 — Order Confirmation Page | Rachel M.  | 3    |

**Backend delivers:** 
`GET /api/v1/orders/{id}` — returns status, items, total, date. Users can only access their own orders. 

**Frontend delivers:** 
Confirmation page showing order number, items, total, date, and status.

------

### US3.5 — Order History

*As a customer, I want to view my previous orders so that I can reorder my favorites quickly.*

| Task                        | Owner      | Wave     |
| --------------------------- | ---------- | -------- |
| B3.5.2 — Order History API  | Tristin G. | Flexible |
| F3.5.1 — Order History Page | Rachel M.  | Flexible |

**Backend delivers:** 
`GET /api/v1/orders/history` — logged-in user's orders only, sorted newest first, DRAFT orders excluded. 

**Frontend delivers:** 
Order list; click to view detail.

> Not blocking anything else — slot in late Wave 2 or Wave 3 as capacity allows.

------

### US3.6 — User Profile Management

*As a customer, I want to update my profile information so that my contact details stay current.*

| Task                  | Owner  | Wave     |
| --------------------- | ------ | -------- |
| B3.6.2 — Profile API  | Kim M. | Flexible |
| F3.6.1 — Profile Page | Kim M. | Flexible |

**Backend delivers:**
 `GET /profile`, `PUT /profile` — authenticated users can update name, address, email, phone. 

**Frontend delivers:** 
Profile form with save button.

> Fully independent of the ordering pipeline. Kim owns this end-to-end and can work it at any point without blocking or being blocked.

------

### US3.7 — Order Item Customization

*As a customer, I want to customize items (extras or options) so that my order matches my preferences.*

| Task                                          | Owner      | Wave |
| --------------------------------------------- | ---------- | ---- |
| B3.7.2 — Modifier Retrieval API               | Tristin G. | 1    |
| B3.7.3/4 — Add/Update Item with Modifiers API | Tristin G. | 2    |
| F3.7.1 — Item Customization Page              | Rachel M.  | 2    |
| F3.7.5 — Cart Display of Customizations       | Rachel M.  | 2    |

**Backend delivers:** 
`GET /api/v1/variants/{variantId}/modifiers` — returns modifier groups with options, required flag, min/max. `POST /api/v1/orders/{orderId}/items` — supports modifier selections, validates required groups and min/max, creates OrderItemModifier records, recalculates totals. B3.7.3 and B3.7.4 rolled into one card per Tristin's notes. 

**Frontend delivers:** 
Customization page before add-to-cart showing modifier groups, live price updates, required group enforcement. Cart displays modifier selections under each item.

> **Stretch goal:** The update-modifiers path on existing cart items can be deprioritized if time is tight — it does not break the core customer flow.

------

### Seed Data

*As a developer, I want extended seed data so the team can develop and test Sprint 3 features against realistic content.*

| Task                                             | Owner                         | Wave |
| ------------------------------------------------ | ----------------------------- | ---- |
| Extend seed data — products, variants, modifiers | Caleb F. *(Kim M. on backup)* | 1    |

Extend Rachel's existing Happydesk dataset to include variants and modifiers. Wave 1 dependency — must be ready alongside B3.1.2 so Kenny can begin testing as soon as endpoints are live.

------

### Sprint 3 Demo Materials

| Task                            | Owner    |
| ------------------------------- | -------- |
| Prepare Sprint 3 demo materials | Tyler R. |

------

## Sprint Timeline

| Date                | Event                                 |
| ------------------- | ------------------------------------- |
| Mon 3/3             | Sprint Planning ✅                     |
| Wed 3/4 – Thu 3/5   | Wave 1 target                         |
| Sat 3/7             | Wave 1 hard deadline                  |
| Fri 3/6 – Mon 3/9   | Wave 2 target                         |
| Mon 3/9             | Week 1 Status Update due (11:59 AM)   |
| Tue 3/10            | Wave 2 hard deadline                  |
| Tue 3/10 – Wed 3/11 | Wave 3 target                         |
| Thu 3/12            | Sprint Health Check (7:00 – 8:00 PM)  |
| Sat 3/14            | Code Freeze                           |
| Sat 3/14 – Sun 3/15 | Final QA pass                         |
| Sun 3/15            | Sprint Review (2:00 – 3:00 PM)        |
| Sun 3/15            | Sprint Retrospective (3:00 – 3:30 PM) |

------

## QA Support

Kenny leads testing this sprint. The following team members have SQA backgrounds and are available to run tests once Kenny has them written:

- **Kim Mayo**
- **Caleb Fowlkes**
- **Serina Rodriguez**

> Kenny to share his test queue early so work can be distributed.

------

## Definition of Done

A story is done when:

- [ ] Code reviewed and merged to main per branching strategy
- [ ] All acceptance criteria met
- [ ] API endpoints tested with Postman
- [ ] New endpoints documented in API contract
- [ ] Trello card updated to Done

------

## Open Questions

1. **Description field** — `description` does not exist on the product model. Tristin to confirm how this is being handled before B3.1.2 begins.
2. **Rachel's tasks** — Rachel missed the 3/3 refinement. Serina to connect before Trello cards go live to confirm no blockers on F3.1.1–F3.7.1.
3. **Sprint Review date** — Sunday 3/15 at 2 PM proposed. Awaiting full team confirmation.
4. **Kenny's test queue** — Kenny to share Sprint 3 test matrix so QA support can be coordinated.
5. **Order status values** — Full set of valid statuses (DRAFT, PENDING, IN_PROGRESS, READY, COMPLETED) should be confirmed and added to the API contract before Wave 3 begins.

------

*Last updated: March 4, 2026 — initial draft*