# Status Update: Sprint #3 - Week 2

**Project Name:**  Orderly 
**Date:** 03/09/26 - 03/15/26 
**Team Number:**  Group 7 
**Team Lead/Scrum Master:**  Serina Rodriguez

**Team Members:**

- Kim Mayo (Product Owner)
- Kenny Bacdayan (Testing Lead)
- Tristin Gatt (Software Architect)
- Rachel Mizer (Front-End Development Lead)
- Caleb Fowlkes (Technical Writer)
- Tyler Royal (Presentation Lead)

------

## Trello Board Capture:

![S3W2_SprintBacklog_WeeklyUpdate](/Users/anires/GitHub/ProjectOrderly/images/Sprint Backlog Captures/S3/S3W2_SprintBacklog_WeeklyUpdate.png) 

------

## Tasks Scheduled For This Week:

B3.1.2 Product Browsing API -- **Tristin G.** *(Wave 1 | 2nd review cycle)* 
B3.2.2 Draft Order API -- **Kim M.** *(Wave 2)* 
B3.3.2 Finalize Order API -- **Kim M.** *(Wave 2)* 
B3.6.2 Profile Management API -- **Kim M.** *(Wave 2)* 
B3.7.2 Modifier Retrieval API -- **Tristin G.** *(Wave 1 | 2nd review cycle)* 
2.9 Frontend Authentication Components -- **Rachel M.** *(Carry-over from S2)* 
2.15 Sprint 2 QA Execution -- **Kenny B.** *(Carry-over from S2)* 
US3.9 Sprint 3 Demo Materials -- **Tyler R.** *(Spans Sprint)* 
US3.10 Sprint 3 QA Execution -- **Kenny B.** 
PM3.1 Sprint 3 PM Tasks -- **Serina R.** 
PM3.2 CI/CD Pipeline & Contributing Documentation -- **Serina R.**

------

## Tasks Completed This Week By Team Members:

2.2 Database Validation *(Done)* -- **Caleb F.** 
2.11 Comprehensive Seed Data Population *(Done)* -- **Caleb F.**
2.14 Expand API Contract (Users & Orders) *(Done)* -- **Tristin G.**
B3.2.2 Draft Order API *(In Review)* -- **Kim M.** 
B3.3.2 Finalize Order API *(In Review)* -- **Kim M.** 
B3.6.2 Profile Management API *(In Review)* -- **Kim M.** 
2.15 Sprint 2 QA Execution *(In Review)* -- **Kenny B.** 
US3.9 Sprint 3 Demo Materials *(Done)* -- **Tyler R.** 
PM3.2 CI/CD Pipeline & Contributing Documentation *(Done)* -- **Serina R.**

#### In Progress:

2.9 Frontend Authentication Components *(In Review)* -- **Rachel M.** 
B3.1.2 Product Browsing API *(In QA Testing)* -- **Tristin G.** 
B3.7.2 Modifier Retrieval API *(In QA Testing)* -- **Tristin G.** 
US3.10 Sprint 3 QA Execution *(In Progress)* -- **Kenny B.** 
PM3.1 Sprint 3 PM Tasks *(In Progress)* -- **Serina R.**

#### Testing Activities:

B3.6.2 Profile Management API *(Tested | Defect logged and resolved | Moved to Done)* -- **Kenny B.** 
B3.2.2 Draft Order API *(Tested | Moved to Done)* -- **Kenny B.** 
PM3.2 CI/CD Pipeline & Contributing Documentation *(Reviewed | Moved to Done)* -- **Kenny B.** 
B3.1.2 Product Browsing API *(Code review comment submitted)* -- **Kenny B.** 
2.15 Sprint 2 QA Execution *(In Progress)* -- **Kenny B.** 
US3.10 Sprint 3 QA Execution *(In Progress)* -- **Kenny B.**

#### Miscellaneous:

Stepped up to lead code review and card management during Scrum Master absence -- **Kim M.**, **Kenny B.**, **Caleb F.** 
Identified API contract misalignment with Trello board and corrected affected cards -- **Kim M.** 
Added new endpoint to API contract for get-or-create cart pattern to support frontend retrieval -- **Tristin G.** 
Identified process gap in Trello → GitHub PR workflow and corrected team documentation -- **Serina R.** 
Built and deployed GitHub Actions CI/CD pipeline for automated backend and frontend checks -- **Serina R.** 
Authored `CONTRIBUTING.md` consolidating workflow, PR, and CI standards into a single reference -- **Serina R.**

------

## Problems/Challenges/Roadblocks:

**Description:** Scrum Master was ill and out of availability for two days during Week 2. Kim Mayo stepped up to lead card management and code review coordination in her absence. Kenny Bacdayan and Caleb Fowlkes also provided additional review coverage to keep cards moving through the board. 
**Status:** Resolved ✅ *(Scrum Master returned to full availability; no sprint deliverables were impacted due to team's proactive coverage)*

**Description:** No DevOps lead was assigned for the project, leaving the team without a CI/CD pipeline or automated quality checks on pull requests. This gap became increasingly relevant as the team moved into active feature development with multiple concurrent branches. 
**Status:** Resolved ✅ *(Scrum Master filled the gap by building and deploying a GitHub Actions CI/CD pipeline. The pipeline spins up a MySQL service, runs Django migrations, and executes the full pytest suite on every pull request to main. Temporary workarounds are in place while pending team action items are resolved — see PM3.2 for full details)*

**Description:** Pull requests were not being consistently tracked on Trello cards, creating a disconnect between GitHub activity and board visibility. Code review was being conducted in Trello comments rather than through GitHub's PR review interface, resulting in reviews that were not formally tied to the codebase. **Status:** Resolved ✅ *(Process gap identified and corrected. CONTRIBUTING.md now explicitly documents the correct Review → Testing flow, the PR link requirement on Trello cards, and the distinction between Trello comments (coordination) and GitHub PR reviews (code review). Team communication sent.)*

**Description:** API contract was not in alignment with the current Trello board state, creating potential confusion between documented endpoints and active sprint tasks. 
**Status:** Resolved ✅ *(Kim Mayo identified the misalignment and corrected the affected cards.)*

**Description:** B3.1.2 Product Browsing API and B3.7.2 Modifier Retrieval API required new endpoints beyond the original scope to support the frontend ordering flow. Tristin identified the gap during development and extended both APIs accordingly. 
**Status:** Resolved ✅ *(New endpoints written and submitted for review; 2nd review cycle in progress)*

**Description:** Rachel encountered a cookie-sending and authorization issue during frontend authentication component development that is blocking completion of 2.9. 
**Status:** In Progress ⚠️ *(Rachel is actively working on a resolution; status to be updated at Sprint Review)*

**Description:** Unpublished branches limit the team's ability to monitor work progression, identify scope drift early, and provide timely feedback before pull request submission. This creates risk for the sprint and for the codebase. 
**Status:** Not Resolved ❌ *(To be addressed in Sprint 4 planning)*

------

*Sprint Review: Sunday, March 15, 2026 at 2:00 PM* *Sprint 3 closes: March 15, 2026*