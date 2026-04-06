# Status Update: Sprint #4 - Week 2

**Project Name:** Orderly
**Date:** 03/30/26 - 04/05/26
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

![S4W2_SprintBacklog_WeeklyUpdate](../../images/Sprint%20Backlog%20Captures/S4/S4W2_SprintBacklog_WeeklyUpdate.png)

---

## Tasks Scheduled For This Week:

**Carry-Overs from Sprint 3 (close push):**
F3.1.1 Product Browsing Page -- **Rachel M.**
F3.2.1 Shopping Cart Page & F3.7.5 Cart Display of Customizations -- **Rachel M.**
F3.3.1 Checkout Page -- **Rachel M.**
F3.4.1 Order Confirmation Page -- **Tristin G.**
F3.5.1 Order History Page -- **Tristin G.**
F3.7.1 Item Customization Page -- **Rachel M.**
US3.10 Sprint 3 QA Execution -- **Kenny B.**

**Sprint 4 Items:**
B4.1 Role-Based Access Control (Backend) -- **Kim M.**
F4.1 Role-Based Access Control (Frontend) -- **Kim M.**
F4.2 Admin Dashboard Navigation (Frontend Integration) -- **Kim M.**
F4.3 Product Management Page (Frontend Integration) -- **Kim M.**
F4.4 Inventory Management Page (Frontend Integration) -- **Kim M.**
B4.3 Product Management API (Backend) -- **Tristin G.**
PM4.1 CI/CD Pipeline Maintenance & Stability -- **Serina R.**
US4.7 Sprint 4 Visual Summary for Review Demo -- **Caleb F.**

---

## Tasks Completed This Week by Team Members:

F3.1.1 Product Browsing Page *(Done ✅)* -- **Rachel M.**
F3.2.1 Shopping Cart Page & F3.7.5 Cart Display of Customizations *(Done ✅)* -- **Rachel M.**
F3.3.1 Checkout Page *(Done ✅)* -- **Rachel M.**
F3.4.1 Order Confirmation Page *(Done ✅)* -- **Tristin G.**
F3.5.1 Order History Page *(Done ✅)* -- **Tristin G.**
F3.7.1 Item Customization Page *(Done ✅)* -- **Rachel M.**
B4.1 Role-Based Access Control (Backend) *(Done ✅)* -- **Kim M.**
PM3.1 Sprint 3 PM Tasks *(Done ✅)* -- **Serina R.**
US4.7 Sprint 4 Visual Summary for Review Demo *(Done ✅)* -- **Caleb F.**

#### In Progress:

B4.3 Product Management API (Backend) *(In Progress)* -- **Tristin G.**
F4.4 Inventory Management Page (Frontend Integration) *(In Progress)* -- **Kim M.**
US3.10 Sprint 3 QA Execution *(In Progress)* -- **Kenny B.**

#### In Review:

F4.3 Product Management Page (Frontend Integration) *(In Review)* -- **Kim M.**
PM4.1 CI/CD Pipeline Maintenance & Stability *(In Review)* -- **Serina R.**
FE Image Support for Frontend *(In Review)* -- **Rachel M.**

#### In QA / Testing:

F4.1 Role-Based Access Control (Frontend) *(In Testing)* -- **Kim M.**
F4.2 Admin Dashboard Navigation (Frontend Integration) *(In Testing)* -- **Kim M.**

#### Testing Activites:

F3.1.1 Product Browsing Page *(All tests passed — Done ✅)* -- **Kenny B.**
F3.2.1 Shopping Cart Page & F3.7.5 Cart Display of Customizations *(All tests passed — Done ✅)* -- **Kenny B.**
F3.3.1 Checkout Page *(All tests passed — Done ✅)* -- **Kenny B.**
F3.4.1 Order Confirmation Page *(All tests passed — Done ✅)* -- **Kenny B.**
F3.5.1 Order History Page *(All tests passed — Done ✅)* -- **Kenny B.**
F3.7.1 Item Customization Page *(All tests passed — Done ✅)* -- **Kenny B.**
B4.1 Role-Based Access Control (Backend) *(All tests passed — Done ✅)* -- **Kenny B.**

#### Code Reviews Completed:

B4.1 Role-Based Access Control (Backend) -- **Caleb F.**
F4.1 Role-Based Access Control (Frontend) -- **Caleb F.**
F4.2 Admin Dashboard Navigation (Frontend Integration) -- **Caleb F.**
F3.4.1 Order Confirmation Page -- **Caleb F.**
F3.5.1 Order History Page -- **Caleb F.**
F3.7.1 Item Customization Page -- **Caleb F.**
F3.1.1 Product Browsing Page -- **Kim M.**
F3.2.1 Shopping Cart Page -- **Kim M.**
F3.7.1 Item Customization Page -- **Kim M.**

---

## Problems/Challenges/Roadblocks:

**Description:** A team member officially dropped the course mid-sprint, leaving US4.7 Sprint 4 Visual Summary for Review Demo unassigned.
**Status:** Resolved ✅ *(US4.7 was reassigned to Caleb Fowlkes. Caleb absorbed the task on top of his existing responsibilities and delivered a draft for review before the Sprint 4 close.)*

**Description:** F3.1.1 Product Browsing Page required a fix for a missing product description field prior to QA sign-off. The fix was completed and communicated but was not reflected in the pull request, creating a miscommunication between the developer and QA Lead before the issue was resolved.
**Status:** Resolved ✅ *(Issue tracked in GitHub Issue #33. Rachel addressed the fix and pushed the update; Kenny re-ran Robot Framework tests after the push. Card moved to Done.)*

**Description:** Frontend authentication token storage mismatch caused 401 Unauthorized errors on Add to Cart. The login page was storing the access token under the key "access" while the rest of the frontend expected "accessToken," blocking cart functionality from being tested end-to-end.
**Status:** Resolved ✅ *(Root cause identified as localStorage key mismatch. Kim corrected the token key alignment on the login page. Cart and downstream pages were unblocked for testing.)*

**Description:** Frontend state management required additional clarification mid-sprint. To address gaps in how frontend states were defined and communicated across the team, Rachel created a frontend state checklist and submitted it to the repository as a reference document. 
**Status:** Resolved ✅ *(Checklist submitted to the repo and available for team reference going forward.)*

**Description:** Splitting frontend tasks across team members proved challenging due to unclear boundaries between integration work and UI/UX work. Assigning frontend cards without a clear separation of concerns led to overlap and ambiguity in ownership. 
**Status:** Resolved ✅ *(The team established a UX/F card split — UX cards cover component and interaction design, F cards cover API wiring and integration. This pattern has been formalized and carried forward into Sprint 5 Epic 4 planning.)*

**Description:** Branch conflict between F3.1.1 and Tristin's F3.4.1/F3.5.1 branches created a dependency bottleneck near sprint close. Both branches had modified app.js, and Kenny's final QA pass on F3.1.1 was gated on Rachel's description fix merging first so the conflict could be resolved cleanly before Tristin's branches were affected.
**Status:** Resolved ✅ *(Rachel's fix was pushed and the branch conflict was addressed. Kenny completed the Robot Framework test pass and F3.1.1 was moved to Done. Tristin's branches merged cleanly.)*

**Description:** Sprint 4 QA Execution (US4.6) scope has been split. All testing activity completed to date is captured above under Testing Activities. Remaining Sprint 4 QA execution scope carries forward into Sprint 5.
**Status:** In Progress ⚠️ *(Items tested this sprint are documented above. Remaining QA scope for Sprint 4 features not yet in Done will be executed in Sprint 5 as those cards complete.)*

**Description:** Code review and pull request practices surfaced as an area for improvement this sprint. Some pull requests combined multiple features without sufficient documentation of implementation decisions, which added unplanned complexity to QA execution. Broader concerns were identified around PR scope and size, and the thoroughness of code reviews in catching these gaps before reaching QA. 
**Status:** In Progress ⚠️ *(Discussed with the team during the Sprint 4 Thursday check-in. Being monitored going forward as a process improvement area.)*