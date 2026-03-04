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

---

------

## Expected Outcomes

By the end of Sprint 3, the team will deliver:

- A functional end-to-end customer ordering experience: 
  browsing → cart → checkout → confirmation
- Product browsing interface displaying products, variants, prices, and availability wired to a live backend API
- Persistent shopping cart backed by a DRAFT order, surviving page refresh
- Item customization flow with modifier groups, options, live price updates, and selections carried through to the cart
- Order submission with payment simulation transitioning orders from DRAFT → PENDING
- Order confirmation page displaying receipt details after successful submission
- Extended seed data with products, variants, and modifiers supporting Sprint 3 development and testing
- All Sprint 3 features tested and verified by Kenny before Sprint Review
- Carry-over items from Sprint 2 (2.2, 2.8, 2.9, 2.11) closed out early in the sprint

------

## Features this Sprint:

1. Product Browsing
2. Shopping Cart System
3. Order Submission & Confirmation
4. Order Item Customization
5. Order History
6. User Profile Management
7. Seed Data & Content
8. Demo & Documentation

------

## What We're Building

Everything in this sprint flows through one pipeline: 
		**🍏 products → 🛒 cart → 🛍️ checkout** 
The sprint is organized into three waves based on what blocks what.

| 🌊Wave  | Focus                                          | Hard Deadline                                  |
| ------ | ---------------------------------------------- | ---------------------------------------------- |
| Wave 1 | Product API, Modifier API, Seed Data           | Saturday 3/7                                   |
| Wave 2 | Product page, cart, customization UI + backend | Wednesday 3/11                                 |
| Wave 3 | Checkout, confirmation, order history          | Code freeze Friday (LATEST Saturday 3/14) 3/13 |

> ⚠️ **Critical path:** 
> Tristin's Wave 1 backend work (B3.1.2) is the blocker for everything else. If it slips past Saturday 3/7, Wave 2 compresses and Wave 3 is at risk.

------





## Sprint #3 Backlog

### 🌊 Wave 1 — Foundation

> Goal by Thursday 3/5 — hard deadline Saturday 3/7

#### B3.1.2 — Product Browsing API

**Owner:** Tristin G.
**US3.1:** As a customer, I want to view a list of products with names, prices, and availability so that I can select items to order. (1/2)

**Delivers:** 
`GET /api/v1/products` — returns products with variants (variantId, variantName, unitPrice, availability). 

Availability rule: `stock_quantity IS NULL` or `> 0` = available; otherwise unavailable.

------

#### B3.7.2 — Modifier Retrieval API

**Owner:** Tristin G.
**US3.7:** As a customer, I want to customize items (extras or options) so that my order matches my preferences. (1/5)

**Delivers:** 
`GET /api/v1/variants/{variantId}/modifiers` — returns modifier groups with options, required flag, and min/max selections. 

Returns empty list if variant has no modifiers.

> Depends on B3.1.2 — variants must exist first.

------

#### US3.8 — Extend Seed Data — Products, Variants & Modifiers

**Owner:** Caleb F. *(Kim M. on backup)*
**US3.8:** As a developer, I want extended seed data so the team can develop and test Sprint 3 features against realistic content.

**Delivers:** 

- Extend Rachel's existing Happydesk dataset to include products, variants, and modifiers. 

- Seed scripts load without errors and are reproducible locally by all team members.

> Wave 1 dependency — must be ready alongside B3.1.2 so Kenny can begin testing as soon as endpoints are live.



------

---

###  🌊 Wave 2 — Core Ordering Flow

> Goal by Monday 3/9 — hard deadline Tuesday 3/10 Frontend and backend can move in parallel once Wave 1 is testable.

#### F3.1.1 — Product Browsing Page

**Owner:** Rachel M.
**US3.1:** As a customer, I want to view a list of products with names, prices, and availability so that I can select items to order. (2/2)

**Delivers:** 
Product list displaying name, variant name, price, and availability with an "Add to Cart" button per variant. 

Wired to `GET /api/v1/products`.

> Depends on B3.1.2 (Wave 1).

------

#### B3.2.2 — Draft Order API

**Owner:** Tristin G.
**US3.2:** As a customer, I want to add, remove, and update quantities in my cart and have it saved automatically so I can prepare my order without losing my selections. (1/2)

**Delivers:** 

- DRAFT order as cart. One active DRAFT per customer. 
- Endpoints: 
  - `GET /api/v1/orders?status=DRAFT` 
  - `POST /api/v1/orders/{orderId}/items`
  - `PATCH /api/v1/orders/{orderId}/items/{itemId}`
  - `DELETE /api/v1/orders/{orderId}/items/{itemId}` 

Returns full order with items, modifiers, and totals. Adding or updating items does not affect inventory.

------

#### B3.7.3/4 — Add/Update Item with Modifiers API

**Owner:** Tristin G.
**US3.7:** As a customer, I want to customize items (extras or options) so that my order matches my preferences. (2/5)

**Delivers:** 
`POST /api/v1/orders/{orderId}/items` — supports modifier selections, validates required groups and min/max, creates OrderItemModifier records, recalculates totals. 

B3.7.3 and B3.7.4 rolled into one card per Tristin's notes.

> Depends on B3.2.2 — draft order must exist before items can be added. **Stretch goal:** The update-modifiers path on existing cart items can be deprioritized if time is tight — it does not break the core customer flow.

------

#### F3.7.1 — Item Customization Page

**Owner:** Rachel M.
**US3.7:** As a customer, I want to customize items (extras or options) so that my order matches my preferences. (3/5)

**Delivers:** 

- Customization page shown before add-to-cart: 
  - displays modifier groups and options, live price updates as options are selected, enforces required groups and min/max selections. 
  - Selected options are sent to the backend on add.

> Depends on B3.7.2 and B3.7.3/4.

------

#### F3.2.1 — Shopping Cart Page

**Owner:** Rachel M.
**US3.2:** As a customer, I want to add, remove, and update quantities in my cart and have it saved automatically so I can prepare my order without losing my selections. (2/2)

**Delivers:** 
Cart page with quantity controls, remove buttons, and running total. 
Persistent across page refresh.

> Depends on B3.2.2.

------

#### F3.7.5 — Cart Display of Customizations

**Owner:** Rachel M.
**US3.7:** As a customer, I want to customize items (extras or options) so that my order matches my preferences. (4/5)

**Delivers:** 
Modifier selections displayed under each cart item with correct pricing reflected in the item total.

> Depends on F3.2.1.



------

---

### 🌊 Wave 3 — Checkout & Confirmation

> Goal by Wednesday 3/11 — code freeze Saturday 3/14

#### B3.3.2 — Finalize Order API

**Owner:** Tristin G.
**US3.3:** As a customer, I want to submit my order and see its current status so that I know when it is being prepared or completed. (1/2)

**Delivers:** 
`POST /api/v1/orders/{orderId}/finalize` — validates order has at least one item, validates availability, runs payment simulation (required fields present = pass), locks pricing, transitions DRAFT → PENDING.

Failed finalize leaves order in DRAFT.

> Depends on B3.2.2.

------

#### F3.3.1 — Checkout Page

**Owner:** Rachel M.
**US3.3:** As a customer, I want to submit my order and see its current status so that I know when it is being prepared or completed. (2/2)

**Delivers:** 
Checkout page showing cart contents and order total, submit button. 
Cart clears on successful submission.

> Depends on B3.3.2.

------

#### B3.4.2 — Order Status API

**Owner:** Tristin G.
**US3.4:** As a customer, I want to see a confirmation screen with my receipt after placing an order so that I have immediate proof of my purchase. (1/2)

**Delivers:**
`GET /api/v1/orders/{id}` — returns status, items, total, and date. 
Users can only access their own orders.

> Depends on B3.3.2 — finalized orders must exist.

------

#### F3.4.1 — Order Confirmation Page

**Owner:** Rachel M.
**US3.4:** As a customer, I want to see a confirmation screen with my receipt after placing an order so that I have immediate proof of my purchase. (2/2)

**Delivers:** 
Confirmation page displaying order number, items, total, date, and status.

> Depends on B3.4.2.



---

---



### 🔄 Flexible — Slot In Anytime

#### B3.5.2 — Order History API

**Owner:** Tristin G.
**US3.5:** As a customer, I want to view my previous orders so that I can reorder my favorites quickly. (1/2)

**Delivers:** 
`GET /api/v1/orders/history` — returns logged-in user's orders only, sorted newest first, DRAFT orders excluded.

> Not blocking anything else — slot in late Wave 2 or Wave 3 as capacity allows.

------

#### F3.5.1 — Order History Page

**Owner:** Rachel M.
**US3.5:** As a customer, I want to view my previous orders so that I can reorder my favorites quickly. (2/2)

**Delivers:** 
Order list page. 
Customer can click an order to view its detail.

> Depends on B3.5.2.

------

#### B3.6.2 — Profile Management API

**Owner:** Kim M.
**US3.6:** As a customer, I want to update my profile information so that my contact details stay current. (1/2)

**Delivers:** 
`GET /profile`, `PUT /profile` — authenticated users can update name, address, email, and phone.

> Fully independent of the ordering pipeline. Kim can work this at any point without blocking or being blocked.

------

#### F3.6.1 — Profile Page

**Owner:** Kim M.
**US3.6:** As a customer, I want to update my profile information so that my contact details stay current. (2/2)

**Delivers:** 
Profile form with a save button. Updates submit successfully.

> Depends on B3.6.2.



---

---

### 📋 Process & Documentation

#### US3.10 — Sprint 3 QA Execution

**Owner:** Kenny B.
**US3.10:** As a QA Lead, I want to track my testing progress across all Sprint 3 user stories so that I can ensure every feature is tested and verified before the Sprint Review.

**Deliverables:**

- `Sprint3_Test_Cases.md`
- `Sprint3_Testing_Matrix.md`
- UI Navigation Validation — end-to-end customer ordering flow

**Stories to test:**

- [ ] US3.1 — Product Browsing (B3.1.2 + F3.1.1)
- [ ] US3.2 — Shopping Cart (B3.2.2 + F3.2.1)
- [ ] US3.3 — Order Submission (B3.3.2 + F3.3.1)
- [ ] US3.4 — Order Confirmation (B3.4.2 + F3.4.1)
- [ ] US3.5 — Order History (B3.5.2 + F3.5.1)
- [ ] US3.6 — User Profile Management (B3.6.2 + F3.6.1)
- [ ] US3.7 — Order Item Customization (B3.7.2 + B3.7.3/4 + F3.7.1 + F3.7.5)
- [ ] US3.8 — Seed Data

**QA Admin:**

- [ ] Link `Sprint3_Test_Cases.md` to card description
- [ ] Link `Sprint3_Testing_Matrix.md` to card description
- [ ] Update testing matrix as each story is tested
- [ ] Flag and log any critical or high-severity defects
- [ ] Confirm all stories verified before Sprint Review

**Acceptance Criteria:**

- Test cases and testing matrix are referenced in the card description
- All stories checked off as testing is completed
- No critical or high-severity defects remain open before stories move to Done
- QA execution completed before Sprint Review

> **QA support available:** Kim Mayo, Caleb Fowlkes, and Serina Rodriguez all have SQA backgrounds and are available to run tests once Kenny has them written. Kenny to share his queue early so work can be distributed.

------

#### US3.9 — Sprint 3 Demo Materials

**Owner:** Tyler R.
**US3.9:** As the Presentation Lead, I need to prepare a demo script and a structured visual summary for the Sprint 3 Review so that stakeholders can follow along clearly and the team has a professional, organized run of show.

**Deliverable 1 — Demo Script**

A step-by-step run of show for the Sprint Review. For each team member, write:

- Their name
- What they will show
- What order they go in

Share with Serina by Friday 3/14 for review.

------

**Deliverable 2 — Screenshots**

- Collect screenshots from each team member. Instruct them to properly name and label their own screenshots.
- Organize into labeled folders — one folder per person. 
- Upload to the repository with clear filenames.

------

**Deliverable 3 — Visual Summary Document**

A structured document presenting what the team built this sprint. Build it section by section, one section per team member:

1. **Header** — Team member's name and role
2. **Description** — 1–2 sentences about what they worked on this sprint
3. **Stories completed** — List each user story by ID and name *(example: US3.5 — Shopping Cart System)*
4. **Screenshots** — Place supporting screenshots directly under the story they belong to

**Example of one completed section:**

> **Rachel Mizer — Frontend Development Lead** Rachel built the customer-facing ordering interface this sprint, including the product browsing page, shopping cart, and item customization flow.
>
> *US3.4 — Product Browsing Page* [screenshot]
>
> *US3.5 — Shopping Cart System* [screenshot]

Repeat this format for every team member.

**Acceptance Criteria:**

- [ ] Visual summary follows the section structure above for every team member
- [ ] Demo script shared with Serina by Friday 3/14
- [ ] Screenshots uploaded and organized by team member before Sprint Review
- [ ] Visual summary committed to the repository before Sprint Review
- [ ] All materials ready by Saturday 3/14

------

## 



## Sprint Timeline

| Date                | Event                                 |
| ------------------- | ------------------------------------- |
| Mon 3/3             | Sprint Planning ✅                     |
| Wed 3/4 – Thu 3/5   | Wave 1 target                         |
| Thu 3/5             | Sprint Health Check (7:00 – 8:00 PM)  |
| Sat 3/7             | Wave 1 hard deadline                  |
| Fri 3/6 – Mon 3/9   | Wave 2 target                         |
| Mon 3/9             | Week 1 Status Update due (11:59 AM)   |
| Mon 3/9             | Sprint Health Check (7:00 – 8:00 PM)  |
| Tue 3/10            | Wave 2 hard deadline                  |
| Tue 3/10 – Wed 3/11 | Wave 3 target                         |
| Thu 3/12            | Sprint Health Check (7:00 – 7:30 PM)  |
| Thu 3/12            | Sprint Retrospective (7:30 – 8:00 PM) |
| Sat 3/14            | Code Freeze                           |
| Sat 3/14 – Sun 3/15 | Final QA pass                         |
| Sun 3/15            | Sprint Review (2:00 – 3:00 PM)        |
|                     |                                       |

------

## QA Support

Kenny leads testing this sprint. The following team members have SQA backgrounds and are available to run tests once Kenny has them written:

- **Caleb Fowlkes**
- **Serina Rodriguez**
- **Kim Mayo** -- *does not have specific SQA experience but is willing to support!*

> Kenny to share his test queue early so work can be distributed.

------

## Definition of Done

A task is done when:

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

*Last updated: March 4, 2026 — reorganized by task within wave structure; original user story numbers preserved; US3.8 (seed data), US3.9 (demo materials), US3.10 (QA execution) added; US3.7 tasks distributed across waves per dependency order*