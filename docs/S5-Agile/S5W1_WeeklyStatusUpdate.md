# Status Update: Sprint #5 - Week 1

**Project Name:** Orderly
**Date:** 04/06/26 - 04/12/26
**Team Number:** Group 7
**Team Lead/Scrum Master:** Serina Rodriguez

**Team Members:**

- Kim Mayo (Product Owner)
- Kenny Bacdayan (Testing Lead)
- Tristin Gatt (Software Architect)
- Rachel Mizer (Front-End Development Lead)
- Caleb Fowlkes (Technical Writer)

---

## Trello Board Capture:

![S5W1_SprintBacklog_WeeklyUpdate](../../images/Sprint%20Backlog%20Captures/S5/S5W1_SprintBacklog_WeeklyUpdate.png)

---

## Tasks Scheduled For This Week:

##### 🌊 Wave 1 -- Admin Navigation, Product Management and Inventory Management

**Target:** April 9 |  **Hard Deadline:** April 10

UX5.1 Admin Dashboard Navigation (UI) -- **Rachel M.**
F5.1 Admin Dashboard Navigation (Frontend Integration) -- **Kim M.**
B5.2 Product Management API (Backend) -- **Kim M.**
UX5.2 Product Management Page (UI) -- **Rachel M.**
F5.2 Product Management Page (Frontend Integration) -- **Kim M.**
B5.3 Inventory Management API (Backend) -- **Kim M.**
UX5.3 Inventory Management Page (UI) -- **Rachel M.**
F5.3 Inventory Management Page (Frontend Integration) -- **Kim M.**

**Ongoing — Wave 4 (Documentation, QA, PM):**
DC5.1 API Contract Updates -- **Tristin G.**
DC5.3 Sprint 5 Code Reviews -- **Caleb F.**
QA5.1 Sprint 5 QA Execution -- **Kenny B.**
PM5.1 Sprint 5 PM Tasks -- **Serina R.**

##### 🌊 Wave 2 — Sales Dashboard 
**Target:** April 13 | **Hard Deadline:** April 14

B5.4 Sales Summary API (Backend) -- **Tristin G.** 
UX5.4 Sales Summary Dashboard (UI) -- **Rachel M.** 
F5.4 Sales Summary Dashboard (Frontend Integration) -- **Tristin G.**

---

## Tasks Completed This Week by Team Members:

F4.1 Role-Based Access Control (Frontend) *(Done ✅)* -- **Kim M.** 
F5.1 Admin Dashboard Navigation (Frontend Integration) *(Done ✅)* -- **Kim M.**
B5.2 Product & Variant Management API (Backend) *(Done ✅)* -- **Kim M.**
F5.2 Product Management Page (Frontend Integration) *(Done ✅)* -- **Kim M.**
B5.3 Inventory Management API (Backend) *(Done ✅)* -- **Kim M.**
F5.3 Inventory Management Page (Frontend Integration) *(Done ✅)* -- **Kim M.**
PM4.1CI/CD Pipeline Maintenance & Stability *(Done ✅)* -- **Serina R./Kenny B.**
UX5.1 Admin Dashboard Navigation (UI) *(Done ✅)* -- **Rachel M.**
FE Image Support for Frontend *(Sidecar to UX5.1)* *(Done ✅)* -- **Rachel M.** 

#### In Progress:

US3.10 Sprint 3 QA Execution *(In Progress — carry-over)* -- **Kenny B.** 
UX5.3 Inventory Management Page (UI) *(In Progress)*-- **Rachel M.**
QA5.1 Sprint 5 QA Execution *(In Progress)* -- **Kenny B.**
DC5.1 API Contract Updates *(In Progress)* -- **Tristin G.**
DC5.3 Sprint 5 Code Reviews *(In Progress)* -- **Caleb F.**
PM5.1 Sprint 5 PM Tasks *(In Progress)* -- **Serina R.**

#### In Review:


UX5.2 Product Management Page (UI) *(In Review)* -- **Rachel M.**

#### In QA / Testing:

UX5.1 Admin Dashboard Navigation (UI) *(In Testing)* -- **Rachel M.**

#### Code Reviews Completed:

B5.2 Product & Variant Management API (Backend) -- **Caleb F.** 
FE Image Support for Frontend *(no user story assigned)* -- **Serina R.**
UX5.1 Admin Dashboard Navigation (UI) -- **Kim M.**

#### Testing Activities:

F4.1 Role-Based Access Control *(All tests passed — Done ✅)* -- **Kenny B.** 
F5.1 Admin Dashboard Navigation (All tests passed — Done ✅) -- **Kenny B.** 
UX5.1 Admin Dashboard Navigation (Majority tests passed — Done ✅)  -- **Kenny B.**
B5.2 Product & Variant Management API (All tests passed — Done ✅) -- **Kenny B.**
F5.2 Product Management Page (Frontend Integration) (All tests passed — Done ✅) -- **Kenny B.**
B5.3 Inventory Management API (Backend) (All tests passed — Done ✅)-- **Kim M.**
F5.3 Inventory Management Page (Frontend Integration) (All tests passed — Done ✅)-- **Kim M.**
PM4.1 CI/CD Pipeline Maintenance & Stability  (All tests passed — Done ✅)-- **Kenny B.**
Achieved over 95% testing coverage on Frontend/Backend -- **Kenny B.**

---

## Problems/Challenges/Roadblocks:

**Description:** A scope gap was identified in Sprint 5 planning: US5.2 Product Management did not originally include variant or modifier management, meaning an admin could create a product but had no interface to manage its variants or modifiers. Product Owner Kim Mayo raised the concern and confirmed that a complete product management flow requires variant support at minimum. A time estimate indicated that adding full modifier CRUD would nearly double the scope of US5.2, putting the Wave 1 deadline at risk.

**Status:** Resolved ✅ *(Scope decision made April 8. Variant management added to B5.2, UX5.2, and F5.2 — Kim had already implemented variant endpoints in B5.2 ahead of the decision. Modifier management deferred as a documented known gap. Modifier visibility was briefly considered but removed to keep Wave 1 scope clean. Sprint plan updated April 8.)*

**Description:** During UX5.1 review, a question arose about whether admin users are redirected to `/admin` after login. The admin interface is intentionally separate from the customer-facing side (accessed via `localhost:3000/admin`), which is by design. Rachel and Kim identified the gap and are actively collaborating to wire the redirect logic correctly. Rachel is taking the lead on the fix and will notify the team once resolved. 
**Status:** In Progress ⚠️ *(Rachel M. leading resolution; Kim M. supporting)*

**Description:** UX5.1 passed majority of testing but revealed a separation between Rachel's UI work and Kim's frontend integration. On the customer-facing branch, Kenny was able to pull up the admin dashboard on the customer portal with all navigation and functionality passing -- which is not the intended behavior. On the correct admin branch, the admin dashboard was accessible on the business portal as expected, but navigation links and functionality were not yet wired. The plan is to proceed with merging UX5.1 and allow F5.1/UX5.2 progress to resolve the frontend wiring on the admin side. 
**Status:** In Progress ⚠️ *(UX5.1 merging; frontend wiring to be resolved through F5.1 and UX5.2)*



---

*Last updated: April 10, 2026 — Serina Rodriguez, Scrum Master / PM*