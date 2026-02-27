# Sprint 2 — PM Analysis Report

**Project:** Group 7 Capstone — Orderly
**Sprint Duration:** February 15 – February 26, 2026 (11 days)
**Report Prepared For:** Serina Rodriguez, Project Manager / Scrum Master
**Lists Tracked:** Sprint 2 Backlog · In Progress · Review · Testing · Done 🎉

> **Note:** Sub-task cards (e.g., 2.1.1–2.1.8) are consolidated under their parent card (e.g., 2.1). Activity and cycle times reflect the full parent + sub-task journey.

---

## 📊 Table of Contents

1. [Sprint Velocity & Throughput](#1-sprint-velocity--throughput)
2. [Card Cycle Times](#2-card-cycle-times)
3. [Bottleneck Analysis — Time in Each List](#3-bottleneck-analysis--time-in-each-list)
4. [Bounced Cards — Rework & Rejections](#4-bounced-cards--rework--rejections)
5. [Testing & Review Timing Patterns](#5-testing--review-timing-patterns)
6. [Sprint Flow Timeline](#6-sprint-flow-timeline)
7. [Carry-Over / Unfinished Work](#7-carry-over--unfinished-work)
8. [Per-Member Activity Summary](#8-per-member-activity-summary)
9. [Key Findings & Recommendations for Sprint 3](#9-key-findings--recommendations-for-sprint-3)

---

## 1. Sprint Velocity & Throughput

| Metric | Value |
|:---|:---|
| Total Sprint 2 cards | 18 |
| Cards completed (Done 🎉) | 2 |
| Cards carry-over (not Done) | 16 |
| Completion rate | 11% |
| Cards with rework/bounces | 6 |
| Team members active | 6 |
| Sprint length | 11 days |

### Completed Cards

- **2.1 Database Schema Implementation** — Cycle time: 3.9d (94h) — Workers: Kim Mayo, Kenneth Bacdayan
- **2.4 User Registration** — Cycle time: 4.3d (103h) — Workers: Kim Mayo, Kenneth Bacdayan

### ⚠️ Velocity Observation

**2 of 18 cards** (11%) reached Done by sprint close. The majority of work stalled in Testing or was carried in from the backlog without being picked up. 
The QA pipeline and late-sprint additions created a bottleneck at the finish line. For Sprint 3, reducing WIP and enforcing earlier testing entry will be critical.

---

## 2. Card Cycle Times

> Cycle time = first move into **In Progress** → arrival in **Done 🎉**. 
> Cards still in flight show elapsed time since entering In Progress.

| Card | Status | Cycle Time | Workers |
|:---|:---|:---|:---|
| 2.1 Database Schema Implementation | Done 🎉 | ✅ 3.9d (94h) | Kim Mayo, Kenneth Bacdayan |
| 2.2 Database Validation | Testing | ⏳ 5.9d (142h) (in flight) | Caleb Fowlkes |
| 2.3 Backend API Endpoint for Business Features | Other | ⏳ 1.1d (26h) (in flight) | Kim Mayo |
| 2.4 User Registration | Done 🎉 | ✅ 4.3d (103h) | Kim Mayo, Kenneth Bacdayan |
| 2.5 Email Verification | Testing | ⏳ 6.2d (149h) (in flight) | Kim Mayo, Tristin Gatt |
| 2.6 Backend User Login | Testing | ⏳ 8.2d (196h) (in flight) | Kim Mayo, Tristin Gatt |
| 2.7 Backend Password Reset | Testing | ⏳ 6.2d (149h) (in flight) | Kim Mayo, Tristin Gatt |
| 2.8 Backend API Endpoints for Authentication | Review | ⏳ 1.1d (27h) (in flight) | Tristin Gatt |
| 2.9 Frontend Authentication Components | Sprint 2 Backlog | — (not started) | 7Rachel Mizer |
| 2.10 Sprint 2 Demo Materials Preparation | Review | ⏳ 18.1h (in flight) | Tyler Royal |
| 2.11 Comprehensive Seed Data Population | Testing | ⏳ 1.3d (32h) (in flight) | Caleb Fowlkes |
| 2.12 UI & Admin Page Shells | In Progress | ⏳ 7.8d (186h) (in flight) | Rachel Mizer |
| 2.13 UI Design System & Component Library | In Progress | ⏳ 7.8d (186h) (in flight) | Rachel Mizer |
| 2.14 Expand API Contract (Users & Orders) | Sprint 2 Backlog | — (not started) | Tristin Gatt |
| 2.15 Sprint 2 QA Execution | In Progress | ⏳ 6.1d (146h) (in flight) | Kenneth Bacdayan |

---

## 3. Bottleneck Analysis — Time in Each List

> Hours each card spent in each list. Long **Backlog** times = late start or no assignee. Long **Testing** times = QA bottleneck.

| Card | Backlog (h) | In Progress (h) | Review (h) | Testing (h) | Done (h) |
|:---|:---:|:---:|:---:|:---:|:---:|
| 2.1 Database Schema Implementation | 24 | 27 | 43 | 24 | 128 |
| 2.2 Database Validation | 122 | 53 | — | 70 | — |
| 2.3 Backend API Endpoint for Business Features | 236 | 0 | — | — | — |
| 2.4 User Registration | 90 | 2 | — | 100 | 48 |
| 2.5 Email Verification | 92 | 114 | 0 | 35 | — |
| 2.6 Backend User Login | 72 | 19 | 2 | 132 | 15 |
| 2.7 Backend Password Reset | 92 | 66 | — | 83 | — |
| 2.8 Backend API Endpoints for Authentication | 214 | 3 | 24 | — | — |
| 2.9 Frontend Authentication Components | 240 | — | — | — | — |
| 2.10 Sprint 2 Demo Materials Preparation | 169 | 18 | 1 | — | — |
| 2.11 Comprehensive Seed Data Population | 208 | 2 | — | 30 | — |
| 2.12 UI & Admin Page Shells | 53 | 186 | — | — | — |
| 2.13 Business Admin Page Shells | 240 | — | — | — | — |
| 2.14 Expand API Contract (Users & Orders) | 192 | — | — | — | — |
| 2.15 Sprint 2 QA Execution | 2 | 146 | — | — | — |

### 🔍 Bottleneck Observations

**Sprint 2 Backlog wait times** were high for many cards — several sat for 90–220+ hours before being picked up, pointing to cards being added without assignees or the sprint being over-committed relative to capacity.

**Testing** remained the primary bottleneck. Multiple cards spent 50–130+ hours in Testing. The QA Execution card (2.15) reflects ongoing QA work through sprint close, with formal testing still incomplete on several stories.

---

## 4. Bounced Cards — Rework & Rejections

> A "bounce" is any backward movement in the workflow (e.g., Testing → In Progress). Each bounce represents rework, a missed acceptance criterion, or a process violation.

### 2.1 Database Schema Implementation
- **Testing → Review** — Feb 19 at 02:17 UTC — by Kenneth Bacdayan

### 2.2 Database Validation
- **In Progress → Sprint 2 Backlog** — Feb 21 at 00:23 UTC — by Caleb Fowlkes

### 2.3 Backend API Endpoint for Business Features
- **In Progress → Sprint 2 Backlog** — Feb 25 at 20:54 UTC — by Kim Mayo

### 2.5 Email Verification
- **Testing → In Progress** — Feb 21 at 03:55 UTC — by Tristin Gatt

### 2.6 Backend User Login
- **Done 🎉 → Review** — Feb 18 at 17:59 UTC — by Tristin Gatt
- **Review → In Progress** — Feb 18 at 18:55 UTC — by Unknown
- **Review → Sprint 2 Backlog** — Feb 18 at 23:20 UTC — by Serina Rodriguez
- **Testing → In Progress** — Feb 21 at 03:55 UTC — by Tristin Gatt

### 2.7 Backend Password Reset
- **Testing → In Progress** — Feb 21 at 03:55 UTC — by Tristin Gatt

## 4. Bounced Cards — Rework & Rejections

> A "bounce" is any backward movement in the workflow (e.g., Testing → In Progress). Each bounce represents rework, a missed acceptance criterion, or a process violation.

### 🔍 Bounce Observations

**2.6 Backend User Login** had the most turbulent journey — it was prematurely moved to Done 🎉 without review or testing, then bounced back through multiple lists. This card was reassigned mid-sprint. Serina logged a comment on Feb 18:

> *"Committed directly to `main` · Files are in wrong location · No testing or review performed before adding to Done (Both are required for this item) · No pull request..."*

This is the clearest process violation of the sprint. 
For Sprint 3, **no card moves to Done** *without*: 
(a) PR opened, (b) peer review complete, (c) testing passed.

**2.1 Database Schema Implementation** also experienced bounces, with sub-tasks moving back from Testing → In Progress multiple times as defects were caught and addressed — ultimately making it to Done 🎉 before sprint close, a sign the QA process worked as intended.

**2.2 Database Validation** did not bounce between lists frequently, but saw significant rework activity within Testing — two formal defects were filed (BUG-S2-01, BUG-S2-02) and the card remained in Testing at sprint close. This is a carry-over priority for Sprint 3.

---

## 5. Testing & Review Timing Patterns

### When did cards enter Testing?

| Card | Entered Testing | Time in Testing | Outcome |
|:---|:---|:---|:---|
| 2.1 Database Schema Implementation | Feb 19 | 23.6h | ✅ Done |
| 2.2 Database Validation | Feb 24 | 2.9d (70h) | ⏳ Still in Testing |
| 2.4 User Registration | Feb 20 | 4.2d (100h) | ✅ Done |
| 2.5 Email Verification | Feb 20 | 1.4d (35h) | ⏳ Still in Testing |
| 2.6 Backend User Login | Feb 20 | 5.5d (132h) | ⏳ Still in Testing |
| 2.7 Backend Password Reset | Feb 20 | 3.4d (83h) | ⏳ Still in Testing |
| 2.11 Comprehensive Seed Data Population | Feb 25 | 1.3d (30h) | ⏳ Still in Testing |

### 🔍 Testing Observations

- The Testing list was added mid-sprint (~Feb 19), meaning early cards skipped it or went back to add it retroactively.
- **Kenneth Bacdayan** served as the primary QA executor. His defect reports (BUG-S2-01, BUG-S2-02) are well-documented and show exactly the rigor the team needs going forward.
- QA Execution (2.15) is only 14% complete at sprint close — most stories have not been formally tested.
- Cards entered Testing in the **final 2–3 days** of the sprint, creating a last-minute crunch. For Sprint 3, target Testing entry by **Day 7** at the latest.
- Review was largely skipped for backend work — most cards moved directly from In Progress to Testing. For Sprint 3, peer code review before Testing should be enforced.

---

## 6. Sprint Flow Timeline

> Card-level movements only, grouped by day. All times UTC.

### Monday, February 16, 2026
```
17:31  (added to sprint)      → Sprint 2 Backlog        [2.1 Database Schema Implementation]  (Serina Rodriguez)
17:36  (added to sprint)      → Sprint 2 Backlog        [2.2 Database Validation]  (Serina Rodriguez)
21:44  (added to sprint)      → Sprint 2 Backlog        [2.3 Backend API Endpoint for Business Feature]  (Kim Mayo)
21:46  (added to sprint)      → Sprint 2 Backlog        [2.4 User Registration]  (Kim Mayo)
21:48  (added to sprint)      → Sprint 2 Backlog        [2.5 Email Verification]  (Kim Mayo)
21:49  (added to sprint)      → Sprint 2 Backlog        [2.6 Backend User Login]  (Kim Mayo)
21:50  (added to sprint)      → Sprint 2 Backlog        [2.7 Backend Password Reset]  (Kim Mayo)
21:52  (added to sprint)      → Sprint 2 Backlog        [2.8 Backend API Endpoints for Authentication]  (Kim Mayo)
22:38  (added to sprint)      → Sprint 2 Backlog        [2.9 Frontend Authentication Components]  (Kim Mayo)
22:40  (added to sprint)      → Sprint 2 Backlog        [2.10 Application UI Navigation Structure]  (Kim Mayo)
22:42  (added to sprint)      → Sprint 2 Backlog        [2.11 Comprehensive Seed Data Population]  (Kim Mayo)
22:44  (added to sprint)      → Sprint 2 Backlog        [2.12 UI & Admin Page Shells]  (Kim Mayo)
22:46  (added to sprint)      → Sprint 2 Backlog        [2.13 Business Admin Page Shells]  (Kim Mayo)
22:48  (added to sprint)      → Sprint 2 Backlog        [2.13 UI Design System & Component Library]  (Kim Mayo)
```

### Tuesday, February 17, 2026
```
17:12  Sprint 2 Backlog       → In Progress             [2.1 Database Schema Implementation]  (Kim Mayo)
```

### Wednesday, February 18, 2026
```
03:18  Sprint 2 Backlog       → Done 🎉                  [2.6 Backend User Login]  (Unknown)
17:59  Done 🎉                 → Review                  [2.6 Backend User Login]  (Tristin Gatt)
18:55  Review                 → In Progress             [2.6 Backend User Login]  (Unknown)
20:38  In Progress            → Review                  [2.1 Database Schema Implementation]  (Kim Mayo)
22:18  In Progress            → Review                  [2.6 Backend User Login]  (Unknown)
22:21  (added to sprint)      → Sprint 2 Backlog        [2.14 Expand API Contract (Users & Orders)]  (Serina Rodriguez)
23:20  Review                 → Sprint 2 Backlog        [2.6 Backend User Login]  (Serina Rodriguez)
```

### Thursday, February 19, 2026
```
01:32  Review                 → Testing                 [2.1 Database Schema Implementation]  (Kenneth Bacdayan)
02:17  Testing                → Review                  [2.1 Database Schema Implementation]  (Kenneth Bacdayan)
03:18  (added to sprint)      → Sprint 2 Backlog        [2.10 Sprint 2 Demo Materials Preparation]  (Serina Rodriguez)
04:13  Sprint 2 Backlog       → In Progress             [2.12 UI & Admin Page Shells]  (Rachel Mizer)
04:14  Sprint 2 Backlog       → In Progress             [2.13 UI Design System & Component Library]  (Rachel Mizer)
```

### Friday, February 20, 2026
```
15:52  Review                 → Testing                 [2.1 Database Schema Implementation]  (Kim Mayo)
15:57  Sprint 2 Backlog       → In Progress             [2.4 User Registration]  (Kim Mayo)
17:34  Sprint 2 Backlog       → In Progress             [2.5 Email Verification]  (Kim Mayo)
17:34  Sprint 2 Backlog       → In Progress             [2.6 Backend User Login]  (Kim Mayo)
17:34  Sprint 2 Backlog       → In Progress             [2.7 Backend Password Reset]  (Kim Mayo)
18:24  Sprint 2 Backlog       → In Progress             [Sprint 2 : PM Tasks]  (Serina Rodriguez)
18:26  In Progress            → Testing                 [2.4 User Registration]  (Kim Mayo)
18:26  In Progress            → Testing                 [2.5 Email Verification]  (Kim Mayo)
18:26  In Progress            → Testing                 [2.6 Backend User Login]  (Kim Mayo)
18:26  In Progress            → Testing                 [2.7 Backend Password Reset]  (Kim Mayo)
18:27  (added to sprint)      → Sprint 2 Backlog        [2.15 Sprint 2 QA Execution]  (Serina Rodriguez)
20:21  Sprint 2 Backlog       → In Progress             [2.15 Sprint 2 QA Execution]  (Kenneth Bacdayan)
```

### Saturday, February 21, 2026
```
00:23  Sprint 2 Backlog       → In Progress             [2.2 Database Validation]  (Caleb Fowlkes)
00:23  In Progress            → Sprint 2 Backlog        [2.2 Database Validation]  (Caleb Fowlkes)
03:55  Testing                → In Progress             [2.5 Email Verification]  (Tristin Gatt)
03:55  Testing                → In Progress             [2.6 Backend User Login]  (Tristin Gatt)
03:55  Testing                → In Progress             [2.7 Backend Password Reset]  (Tristin Gatt)
14:46  Testing                → Done 🎉                  [2.1 Database Schema Implementation]  (Kenneth Bacdayan)
19:00  In Progress            → Testing                 [2.6 Backend User Login]  (Tristin Gatt)
19:32  Sprint 2 Backlog       → In Progress             [2.2 Database Validation]  (Caleb Fowlkes)
19:49  (added to sprint)      → Testing                 [2.6 Backend User Login]  (Tristin Gatt)
```

### Monday, February 23, 2026
```
21:29  In Progress            → Testing                 [2.7 Backend Password Reset]  (Kim Mayo)
```

### Tuesday, February 24, 2026
```
00:42  In Progress            → Testing                 [2.2 Database Validation]  (Caleb Fowlkes)
22:35  Testing                → Done 🎉                  [2.4 User Registration]  (Kenneth Bacdayan)
```

### Wednesday, February 25, 2026
```
14:29  Sprint 2 Backlog       → In Progress             [2.11 Comprehensive Seed Data Population]  (Caleb Fowlkes)
16:28  In Progress            → Testing                 [2.11 Comprehensive Seed Data Population]  (Caleb Fowlkes)
19:45  Sprint 2 Backlog       → In Progress             [2.8 Backend API Endpoints for Authentication]  (Tristin Gatt)
20:34  Sprint 2 Backlog       → In Progress             [2.3 Backend API Endpoint for Business Feature]  (Kim Mayo)
20:54  In Progress            → Sprint 2 Backlog        [2.3 Backend API Endpoint for Business Feature]  (Kim Mayo)
21:19  In Progress            → Review                  [2.5 Email Verification]  (Tristin Gatt)
21:36  Review                 → Testing                 [2.5 Email Verification]  (Kim Mayo)
22:21  In Progress            → Review                  [2.8 Backend API Endpoints for Authentication]  (Tristin Gatt)
```

### Thursday, February 26, 2026
```
04:32  Sprint 2 Backlog       → In Progress             [2.10 Sprint 2 Demo Materials Preparation]  (Unknown)
17:55  Sprint 2 Backlog       → Sprint 3 Backlog        [2.3 Backend API Endpoint for Business Feature]  (Kim Mayo)
22:04  In Progress            → Review                  [2.10 Sprint 2 Demo Materials Preparation]  (Unknown)
```

---

## 7. Carry-Over / Unfinished Work

16 cards did not reach Done 🎉 by sprint close.

| Card | Current Status | Time in Status | Workers | Flag |
|:---|:---|:---|:---|:---|
| 2.2 Database Validation | Testing | 2.9d (70h) | Caleb Fowlkes | ⚠️ Stuck in Testing |
| 2.3 Backend API Endpoint for Business Feature | Other | 0.0h | Kim Mayo | Moved to Sprint 3 |
| 2.5 Email Verification | Testing | 1.4d (35h) | Kim Mayo, Tristin Gatt |  |
| 2.6 Backend User Login | Testing | 5.5d (132h) | Kim Mayo, Tristin Gatt | ⚠️ Stuck in Testing |
| 2.7 Backend Password Reset | Testing | 3.4d (83h) | Kim Mayo, Tristin Gatt | ⚠️ Stuck in Testing |
| 2.8 Backend API Endpoints for Authentication | Review | 1.0d (24h) | Tristin Gatt | 👀 Awaiting Review |
| 2.9 Frontend Authentication Components | Sprint 2 Backlog | 10.0d (240h) | Rachel Mizer | ⚠️ Never started |
| 2.10 Sprint 2 Demo Materials Preparation | Review | 0.6h | Tyler Royal | 👀 Awaiting Review |
| 2.11 Comprehensive Seed Data Population | Testing | 1.3d (30h) | Caleb Fowlkes |  |
| 2.12 UI & Admin Page Shells | In Progress | 7.8d (186h) | Rachel Mizer | 🔄 Active |
| 2.13 UI Design System & Component Library | In Progress | 7.8d (186h) | Rachel Mizer | 🔄 Active |
| 2.14 Expand API Contract (Users & Orders) | Sprint 2 Backlog | 8.0d (192h) | Tristin Gatt | ⚠️ Never started |
| 2.15 Sprint 2 QA Execution | In Progress | 6.1d (146h) | Kenneth Bacdayan | 🔄 Active |
| Sprint 2 : PM Tasks | In Progress | 6.2d (148h) | Serina Rodriguez | 🔄 Active |

### Recommended Sprint 3 Carry-Over Approach

1. **Do not auto-carry all cards** — re-evaluate each one at sprint planning
2. Cards in **Testing** are closest to Done — resolve these first
3. Cards in **Sprint 2 Backlog** that were never started need re-estimation and re-commitment
4. Consider breaking large carry-over cards into smaller stories if they consistently overrun

---

## 8. Per-Member Activity Summary

> Full per-member 1:1 breakdowns are in separate files.

| Member | Total Actions | Active Days | Cards Touched | Primary Role This Sprint |
|:---|:---:|:---:|:---:|:---|
| Serina Rodriguez | 101 | 8 | 30 | PM / Scrum Master |
| Kim Mayo | 99 | 7 | 22 | Backend / Board Architecture |
| Tristin Gatt | 32 | 6 | 8 | Backend Development |
| Kenneth Bacdayan | 21 | 5 | 5 | QA Lead |
| Caleb Fowlkes | 14 | 3 | 2 | Backend Development |
| Rachel Mizer | 10 | 3 | 5 | UI / Frontend Design |

---

## 9. Key Findings & Recommendations for Sprint 3

### 🔴 Critical Issues

**1. Process Violation — Direct Commit to Main & Premature Done**
2.6 Backend User Login was moved to Done without a PR, review, or testing. For Sprint 3: no card moves to Done without (a) PR opened, (b) peer review complete, (c) testing passed.

**2. QA Bottleneck — Testing Introduced Too Late**
The Testing list was added mid-sprint; QA remained incomplete at close. For Sprint 3: define QA entry criteria at planning, assign QA owner on Day 1, and target Testing entry by Day 7.

**3. Low Completion Rate (11%)**
Reduce sprint commitment for Sprint 3. Enforce WIP limits (max 2 cards per person In Progress) and focus on finishing over starting.

### 🟡 Process Improvements

**4. Cards Added Mid-Sprint Without Full Setup**
Cards were created during the sprint without user stories, acceptance criteria, or assignees. For Sprint 3: cards must have US#, acceptance criteria, and an owner before entering the sprint backlog.

**5. Review Is Underutilized**
Most backend cards skipped Review or passed through in under 2 hours. For Sprint 3: require peer code review for all backend cards before Testing, and assign a specific reviewer at time of move.

**6. Long Backlog Wait Times**
Several cards sat in Sprint 2 Backlog for 90–220+ hours without being picked up. For Sprint 3: every sprint backlog card must have an assignee at planning — if no one owns it, it doesn't go in the sprint.

### 🟢 What Went Well — Keep Doing This

- **Kenneth's QA rigor** — formal defect reports with structured documentation (BUG-S2-01, BUG-S2-02)
- **Kim's & Serina's board stewardship** — well-structured cards with acceptance criteria, checklists, and member assignments
- **Serina's PM visibility** — detailed PM Tasks card covering planning, operations, documentation, and deliverables
- **Rachel's design execution** — systematic, checklist-driven approach to UI work
- **Tristin's consistency** — active across multiple days, reliable contributor to backend work

---

*Report generated from Trello board export · All timestamps in UTC · Data as of February 26, 2026*