# Orderly | Project Plan

**Version:** 2.0 — Project Close Revision
**Team:** Group 7 | CSC 289 | Wake Technical Community College
**Project Manager/Scrum Master:** Serina Rodriguez
**Instructor:** Professor Alex Tabbal
**Revised:** April 2026

---

> **Document Integrity Notice**
>
> All content under "As Originally Planned" subsections reflect the project inception and has not been altered retroactively. "**Actual Execution**" subsections document outcomes as they occurred during the project lifecycle. 
> This version (v2.0) was produced at project closing for academic and portfolio purposes.
>
> | Version | Date         | Description                                             |
> | ------- | ------------ | ------------------------------------------------------- |
> | v1.0    | January 2026 | Original project plan, produced at Sprint 1 kickoff     |
> | v2.0    | April 2026   | Project-close revision; Actual Execution sections added |

---

### Table of Contents

1. Team Member Details
2. Project Goal and Objectives
3. Project Scope
4. Project Assumptions and Constraints
5. Project Resources
6. Team Collaboration and Communication
7. Project Documentation
8. Project Management Plan and Methodology
9. Risk Summary
10. Project Close Statement

---

## 1. Team Member Details

### As Originally Planned

| Name           | Email                     | Role |
| -------------- | ------------------------- | ---- |
| Kenny Bacdayan | kbacdayan@my.waketech.edu | Testing Lead  |
| Caleb Fowlkes  | cjfowlkes@my.waketech.edu | Technical Writer  |
| Tristin Gatt   | tjgatt@my.waketech.edu    | Software Architect  |
| Kim Mayo       | kamayo@my.waketech.edu    | Product Owner  |
| Rachel Mizer   | ramizer@my.waketech.edu   | Front-End Development Lead |
| Tyler Royal    | taroyal@my.waketech.edu   | Presentation Lead |

### Actual Execution

> **Team Changes**
> The team experienced one personnel change and two role expansions during the project lifecycle.
>
> - **Tyler Royal** (Presentation Lead) withdrew from the course mid-project. His presentation and documentation responsibilities were redistributed to Caleb Fowlkes. 
> - **Caleb Fowlkes** expanded his role to include Code Review Lead and took ownership of our database seed data, seed data extensions, and database validation, replacing his original Technical Writer designation and earning the title of the Code Review Lead & Database Specialist.
> - **Kim Mayo** took on full stack development responsibilities across frontend, backend, and database work in addition to her Product Owner duties, earning the title of Product Owner & Full Stack Developer. 
> - **Rachel Mizer** presented her expertise in UI/UX design and frontend implementation, earning the title of Frontend & UI/UX Lead.

#### Final Team Roster (as of project close)

| Name             | Email                      | Role(s)                                |
| ---------------- | -------------------------- | -------------------------------------- |
| Kenny Bacdayan   | kbacdayan@my.waketech.edu  | Testing & Quality Assurance Lead       |
| Caleb Fowlkes    | cjfowlkes@my.waketech.edu  | Code Review Lead & Database Specialist |
| Tristin Gatt     | tjgatt@my.waketech.edu     | Software Architect & Backend Lead      |
| Kim Mayo         | kamayo@my.waketech.edu     | Product Owner & Full Stack Developer   |
| Rachel Mizer     | ramizer@my.waketech.edu    | Frontend & UI/UX Lead                  |
| Serina Rodriguez | srodriguez@my.waketech.edu | Project Manager / Scrum Master         |

## 2. Project Goal and Objectives

### As Originally Planned

**Project Goal:** Provide a lightweight, web-based ordering software with a customer facing ordering experience and business-owner facing dashboard that allows for menu customization, inventory control, sales data reports, and supplier management.

**Project Objectives:**

1. **Deliver a fully-functional application by April 24th, 2026** that includes a customer ordering interface, business management dashboard, and basic inventory tracking with demonstrated order processing capabilities. 
2. **Reduce order processing time by 50%** compared to traditional manual ordering methods by implementing an intuitive self-service interface which minimizes human error and wait times. 
3. **Achieve 90% user satisfaction rating** during prototype testing by providing a responsive design that works across multiple devices such as tablets, kiosks, and mobile devices with a user-friendly navigation system.

---

### Actual Execution

> **Outcome: All three project objectives were met.**
>
> - A fully functional application was delivered on **April 24th, 2026** — the exact date projected at project inception. The application includes a customer ordering interface, business management dashboard, product and variant management, order tracking, supplier management, and inventory visibility. 
> - The self-service ordering interface was implemented and demonstrated a streamlined flow with minimal steps from menu browser to order submission.
> -  Responsive design was validated across desktop, tablet, and mobile viewports. Sprint review feedback informed iterative UX improvements throughout the project. 

---

## 3. Project Scope

### As Originally Planned

**In-Scope:**

- Customer-facing interface for browsing, customizing, and submitting orders
- Business-facing interface for managing menus, inventory, and prices
- Basic reporting dashboard for sales summaries and popular items
- Responsive design compatible with tablets, kiosks, and mobile devices
- User authentication and role-based access control
- Simulated payment processing for prototype demonstration
- Prototype supplier order management system tracking orders from submission to fulfillment.

**Out of Scope:**

- Integration with live payment gateways (Stripe or PayPal)
- Integration with external POS systems
- Advanced analytics or AI-based recommendations
- Customer loyalty programs or promotional features
- Multi-language and multi-currency support
- Real supplier API integration
- AES-256 Encryption

---

### Actual Execution

> **Scope Changes and Outcomes**
>
> Core scope was delivered as planned. The following adjustments were documented during execution:
>
> - **Product variant management** (Sprint 5) was added to scope after initial planning; implemented and delivered as B5.2 / F5.2 / UX5.2.
> - **Modifier management** was evaluated and deferred as a documented, known gap. Modifier visibility (read-only) was also removed to keep Sprint 5 Wave 1 Clean.
> - **Low stock indicators** (US5.5) were added and delivered as an active Sprint 5 item. 
> - **Admin Settings** (US5.6) and **Supplier Management** (US5.7) were identified as stretch items requiring greenlight per sprint review outcomes. 
> - **Deployment via AWS** was achieved using a Dockerized build of the backend and frontend, containerized by Tristin Gatt. The production build was deployed to AWS after successful local container testing, fulfilling the originally planned cloud hosting target.

## 4. Project Assumptions and Constraints

### As Originally Planned

**Assumptions:**

1. All Team members have consistent internet access and functioning devices capable of running development and collaboration tools.
2. Each member has access to shared resources (Trello, Microsoft Teams, Outlook, Google Drive, GitHub).
3. Stakeholders and project mentor (TBD) will provide timely feedback during sprint reviews. 
4. The system will operate in a simulated environment during development (no real payment processing required)
5. Test data will be fictional to maintain privacy and comply with ethical standards. 
6. Broadband internet connectivity is available for real-time data synchronization.
7. Modern web browsers are available on all developing and testing devices. 

**Constraints:**

- **Time:** Fixed deadline of April 24th, 2026 for final project presentation and all deliverables; five sprint cycles with specific milestones and deliverables
- **Resource:** Limited to team of seven members; academic project budget with no funding for paid services or APIs; prototype-level development only, not production ready.
- **Technical**: Must use agreed-upon development stack; limited to 100 GB storage capacity; no access to real payment gateway APIs; dependency on external API availability for future enhancements.
- **Scope:** Cannot implement payment processing integration; cannot integrate with external POS systems in the current timeline.

### Actual Execution:

> **Notes on Assumptions and Constraints**
>
> - The **April 24th, 2026 deadline was met.** A fully functional application was delivered on the projected date. 
> - Team size effectively reduced to **six members** following a member's course withdrawal. All remaining members maintained access to required tools and resources throughout.
> - Deployment targeted **AWS** via a Dockerized build, fulfilling the originally planned cloud hosting target. 
> - No paid API access was required. The agreed-upon stack was used throughout, with **MySQL replacing SQLite** for better production parity and relational integrity. 
> - Connectivity and device availability were non-issues throughout the project.

---

## 5. Project Resources 

### As Originally Planned

 **Personnel**

- **Director of Product Development**: Professor Alex Tabbal
- **Project Manager**: Serina Rodriguez
- **Development Team**: Kenny Bacdayan, Caleb Fowlkes, Tristin Gatt, Kim Mayo, Rachel Mizer, Tyler Royal
- **Project Mentor**: To be determined..

**Technology Stack:**

- **Development**: React / Django / DRF / SimpleJWT / AWS / SQLite / Git
- **Project Management**: Trello for sprint tracking and task management
- **Communication**: Microsoft Teams, Outlook
- **Documentation**: Google Drive, Microsoft Teams
- **Database**: Django / SQLite

**Hardware / Infrastructure:**

- Team member laptops/desktops for development
- Testing devices: tablets, mobile devices for responsive design testing
- Server/cloud hosting: AWS or Azure for deployment

**Software:**

- Modern web browsers (Chrome, Edge, Safari) for testing
- AES-256 encryption for data security
- HTTPS/SSL for secure communication

---

### Actual Execution

> **Actual Stack**
>
> | Category           | Planned                  | Actual                                                       |
> | ------------------ | ------------------------ | ------------------------------------------------------------ |
> | Backend            | Django / DRF / SimpleJWT | Django / DRF / SimpleJWT (as planned)                        |
> | Frontend           | React                    | React (as planned)                                           |
> | Database           | SQLite                   | MySQL 8.0                                                    |
> | Deployment         | AWS / Azure              | AWS (Dockerized build via Docker)                            |
> | CI/CD              | Not specified            | GitHub Actions (orderly-ci.yml)                              |
> | QA Automation      | Not specified            | Robot Framework / SeleniumLibrary                            |
> | Version Control    | Git / GitHub             | Git / GitHub with defined branching strategy and PR review process |
> | Project Management | Trello                   | Trello — Agile Scrum Kanban + Sprint Planning boards         |

## 6. Team Collaboration and Communication

### As Originally Planned

**Tools/Platforms:**

- **Microsoft Teams**: Primary platform for daily communication, virtual meetings, chat discussions, and file sharing.
- **Outlook**: Email communication, scheduling, deadline management, and meeting invitations
- **Trello**: Sprint planning, task coordination, and progress updates

**Usage:**

- **Daily/Weekly Check-ins via Teams:** Monitor sprint progress, address blockers, coordinate tasks
- **Sprint Planning Meetings**: Team collaborates to select and assign tasks from product backlog
- **Sprint Reviews:** Present completed features and gather feedback from stakeholders
- **Sprint Retrospectives:** Discuss what worked well, challenges encountered, and process improvements
- **Real-Time Chat:** Teams chat for quick questions and immediate collaboration needs

---

### Actual Execution

> **Communication in Practice**
>
> - Microsoft Teams remained the primary communication channel throughout all five sprints for check-ins, blocker escalation, and asynchronous updates(daily stand-ups). 
> - Sprint Planning, Sprint Review, and Sprint Retrospective ceremonies were held each sprint cycle as planned.
> - Trello cards were linked to GitHub branches and Pull Requests; the `Done 🎉` column served as the definitive completion tracker.
> - **Wave-based sprint planning** was introduced during the beginning of Sprint 3 to manage dependency chains and provide clearer intermediate deadlines within each sprint. 
> - A **greenlight system** was established for stretch scope items to prevent scope creep while preserving optionality.
> - **Dependency chain documentation** was formalized after a Sprint 3 cascade to ensure blockers were surfaced earlier in future sprints.

---

## 7. Project Documentation

### As Originally Planned

**Tools and Platforms:**

- **Trello**: Technical documentation of user stories, acceptance criteria, and task details.
- **GitHub:** Central repository for all project documents, code documentation, README files, and version control.

**Usage:**

- **SCRUM Artifacts**: Stored in MSTeams, GitHub with consistent formatting and name conventions.
- **Design Documents**: Architectural diagrams, ERDs, wireframes, and class diagrams maintained in GitHub.
- **Meeting Notes**: Meeting summaries, Sprint Review, and Retrospective notes documented and shared via MS Teams and GitHub.
- **Presentation Files**: Final presentation materials organized in Github repository
-  **Version Control**: All documents follow naming conventions to track revisions and maintain professional standards
- **Code Documentation**: Developed code, inline comments and README files maintained in GitHub repository

### Actual Execution

> **Documentation Delivered**
>
> - Sprint Plans (S1-S5) and wave-based delivery documents maintained in GitHub for all five sprints.
> - Weekly Status Updates (S1W1 through S5W2) submitted each sprint.
> - API Contract (`API_Contract.md`) maintained by the Software Architect; used as the authoritative interface reference and source of truth. 
> - `CONTRIBUTING.md` and `branching-strategy.md` established development workflow standards adopted by all team members.
> - `code_review_standards.md` established code review standards and practices; PR checklist enforced by Code Review Lead.
> - CI/CD pipeline documented with GitHub Actions; no `continue-on-error` flags remain.
> - Phase 4 Documentation Guide produced to align final deliverable standards
> - Product Backlog maintained throughout; mapped to epics and sprint tasks

---

## 8. Project Management Plan and Methodologies

### As Originally Planned

**Methodology:**

The Orderly development team has adopted Agile SCRUM as project management methodology based on its proven strengths in iterative development, team communication, flexibility, and integration of customer and/or stakeholder feedback. The approach is well-suited to the academic timeline and need to demonstrate incremental progress throughout the semester.

The Agile SCRUM approach ensures iterative delivery, maintains transparency, and allows the team to adapt quickly while meeting the April 24th deadline.

**Tools:**

Trello serves as the primary project management tool, providing capabilities for backlog organization, sprint tracking, and Kanban board visualization. These features give the team real-time visibility into progress and help identify potential issues before they become critical blockers. 

**Process:**

**Sprint Structure (5 sprints, 2 weeks each):**

1. **Sprint 1 (01/31-02/13)**: high level design, UX concept, application architecture, stable development environment
	
2. **Sprint 2 (02/14-02/27)**: Database setup and validation with seed data, user accounts and authentication, application shell and navigation
	
3. **Sprint 3 (02/28-03/13)**: Deploy to cloud environment, JWT auth, customer and business UI

> COLLEGE CLOSED -- Break (03/16-03/20)

4. **Sprint 4 (03/21-04/03)**: Security, remaining user and business features, finalize UI
	
5. **Sprint 5 (04/04-04/17)**: Test and iterate UX for desktop and mobile, determine and solve critical bugs
	
6. **Phase 4 (04/18-04/24)**: Finalize application, project documentation release, final retrospective, presentation (**April 30th, 2026 at 6:05pm**), and evaluation

**Progress Tracking:**

- Visual Management through Kanban Boards
- Sprint Burndown Charts to monitor progress
- Weekly Check-ins to identify blockers early in MS Teams by all team members

**Review Cycle:**

- **Sprint Review:** Demonstrate completed features, gather stakeholder feedback
- **Sprint Retrospective**: Evaluate process, identify improvements for next iteration
- **Continuous Adaptation**: Adjust approach based on feedback and lessons learned

---

### Actual Execution

> **Methodology — As Executed**
>
> Agile SCRUM was maintained with full integrity throughout the project lifecycle. The five-sprint structure, ceremony cadence, and April 24th delivery target were upheld as planned. What evolved was not the process, but how the team adapted scope, capacity, and delivery focus within it. 
>
> Wave-based planning was introduced to create clearer intermediate deadlines within sprints and surface dependency chains before they became blockers. A greenlight system was established for stretch items to protect sprint stability. As team capacity shifted across the semester, task ownership was redistributed without disrupting the overall schedule.
>
> Each sprint had a natural thematic focus that emerged from the work:
>
> - **Sprint 1** laid the foundation -- architecture, design, development environment, and team standards
> - **Sprint 2** established the core data layer and application infrastructure -- authentication, database, and application shell
> - **Sprint 3** built the API layer and engineering backbone -- the ordering and profile APIs, CI/CD pipeline, seed data, and contributing standards.
> - **Sprint 4** brought the complete customer experience to life -- the ordering pipeline, customer UI, and role-based access control.
> - **Sprint 5** delivered the full admin platform-- including a dashboard, product/inventory management, sales analytics, and order management.
> - **Phase 4** (the final working phase) finished the admin feature set and was dedicated to application polish, final testing, documentation, deployment, and presentation preparation
>
> The result was a fully functional application delivered on the projected date with a process that stayed true to Agile SCRUM while responding honestly to the realities of the team.

---

## 9. Risk Summary (Added at Project Close)

*This section was not part of the original v1.0 plan. It is included in v2.0 to document risks encountered during execution and the mitigations applied.*

| Risk Identified                                     | Mitigation Applied                                           |
| --------------------------------------------------- | ------------------------------------------------------------ |
| Team member withdrawal (Tyler Royal)                | Responsibilities redistributed to Caleb Fowlkes; no delivery gap resulted |
| Reduced availability of backend lead (Tristin Gatt) | Backend tasks redistributed to Kim Mayo; Tristin retained architecture and API contract ownership |
| Dependency cascade (Sprint 3 -- B3.1.2)             | Blocked customer ordering pipeline; resolved by isolating the dependency chain and re-sequencing tasks |
| Delivery gaps (frontend/UX)                         | Wave deadlines and explicit greenlight criteria added; visibility improved through structured check-ins |
| CI/CD false-green checks                            | Identified `continue-on-error` flags masking real failures; documented and flagged for Sprint 5 resolution |
| Scope creep risk (modifier management)              | Deferred with documentation as a known gap; prevented sprint destabilization |

---

## 10. Project Close Statement

The Orderly application was delivered with a hard code freeze of our `Main` branch on **April 24th, 2026** -- the exact date projected at project inception in January 2026. Over five sprints, Team 7 built and delivered a fully functional web-based ordering and business management platform using Django, React, and MySQL, deployed via Docker and AWS with a CI/CD pipeline backed by GitHub Actions and Robot Framework.

Across the project lifecycle, the team navigated personnel changes, dependency cascades, scope adjustments, heavy life events, and shifting availability -- and adapted without missing the final delivery target. The plan-versus-actual record in this document reflects both the quality of the original plan and the team's ability to still execute within it.

---

*Project Development Plan v2.0 — Last updated: 4/25/26 (Serina Rodriguez, SCRUM Master/PM)*
