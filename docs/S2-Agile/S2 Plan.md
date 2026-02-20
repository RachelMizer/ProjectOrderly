# Orderly | Sprint 2 Plan

## Core Features & Data Layer

------

## Sprint Overview

| Field             | Details                         |
| ----------------- | ------------------------------- |
| **Sprint Number** | Sprint 2                        |
| **Sprint Dates**  | February 14 - February 27, 2026 |
| **Scrum Master**  | Serina Rodriguez                |
| **Product Owner** | Kim Mayo                        |

------

## Sprint Goal

**Establish the foundational data layer and core infrastructure, user authentication system, and navigable application skeleton to enable feature development in subsequent sprints.  **

------

## Expected Outcome

By the end of Sprint 2, the team will deliver:

- A fully configured and validated database schema with proper relationships and constraints
- Comprehensive seed data for realistic testing and development
- Validated database with test data demonstrating role-based data access controls
- Functional user registration and login system with role-based access control(RBAC)
- Secure password reset functionality via email
- Complete application navigation structure with customer and business admin routing
- Navigable page shells for all major features (menu browsing, cart, dashboard, inventory management)
- Basic design system with reusable components and consistent styling
- Basic backend API endpoints and rough frontend structure for testing authentication flows

------

## Definition of Done

For Sprint 2, a feature or task is considered complete when:

### Code Quality

- [ ] Code is written, reviewed, and merged to the main branch following team branching strategy
- [ ] Code follows agreed-upon naming conventions and style guidelines
- [ ] No critical bugs or errors exist in the implemented functionality

### Testing

- [ ] All acceptance criteria defined in user stories are met
- [ ] Manual testing completed and documented
- [ ] Database validation tests pass (constraints, relationships, data integrity)

### Documentation

- [ ] API endpoints documented with request/response examples
- [ ] Database schema changes documented in project documentation
- [ ] Setup/configuration instructions updated if needed

### Collaboration

- [ ] Feature demonstrated to team during sprint review
- [ ] Trello cards updated to 'Done' status
- [ ] Any blockers or dependencies communicated to team

------

## Sprint 2 Acceptance Criteria

### 2.1 Database Schema Implementation

- Django models exist for all core entities
- Relationships correctly reflect business logic
- Migrations run cleanly from an empty database
- Models are accessible in Django admin

### 2.2 Database Validation

- Required, unique, and range constraints are enforced
- Invalid data cannot be saved through admin, forms, or APIs
- Cross-field validation rules execute on create/update
- Referential integrity prevents orphaned records

### 2.3 Backend API Endpoints for Business Features

- Roles (Customer, Staff/Admin) are defined
- Users can only read records they are authorized to view
- Unauthorized create/update/delete operations are blocked
- Access rules are enforced server-side and covered by tests

### 2.4 User Registration

- User registration endpoint implemented (view)
- New user record is created
- Prevents duplicate email registration
- The endpoint returns response formatted as JSON per the API specification
- Registration failures return clear, structured error message

### 2.5 Email Verification

- Verification email with secure token is sent after signup
- Valid token marks the user as verified
- Expired/invalid tokens are rejected safely
- Unverified users cannot log in
- Users can request a new verification email

### 2.6 Backend User Login

- Endpoint authenticates valid user credentials and returns tokens in JSON response
- Invalid credentials do not authenticate
- Tokens expire at the correct time
- Logout fully clears authentication
- Protected API endpoints require authentication

### 2.7 Backend Password Reset

- An endpoint accepts valid email and triggers a secure password reset token workflow
- A password reset confirmation endpoint verifies the token and allows the user to set a new validated password
- New password satisfies validation rules
- Old password no longer works
- Full reset flow tested end-to-end

### 2.8 Backend API Endpoints for Authentication

- API endpoints exist for registration, login, logout, and reset
- Endpoints return correct success/error responses
- Unauthorized access is rejected with proper status codes
- Endpoints integrate with authentication logic successfully

### 2.9 Frontend Authentication Components

- UI forms exist for registration, login, and reset
- Client-side validation displays helpful errors
- Forms connect to backend endpoints successfully
- Authentication state updates correctly in the UI

### 2.10 Sprint 2 Demo Materials Preparation

- Screenshot folders created for each team member
- All screenshots uploaded with clear filenames
- Demo order document created and committed
- Visual summary document created and committed
- Pull request created (NOT merged yet)
- Team notified that materials are ready
- Serina tagged for review

### 2.11 Comprehensive Seed Data Population

- Realistic sample data exists for core models
- Seed scripts/fixtures load without errors
- Team members can reproduce the same dataset locally

### 2.12 UI & Admin Page Shells

- Placeholder pages exist for menu, cart, and orders (customer side)
- Placeholder pages exist for dashboard, inventory, and orders (business admin side)
- Placeholder pages and UI elements for user authentication: login, register, password reset
- Pages render within the app layout
- Navigation between customer pages works

### 2.13 UI Design System & Component Library

- Base typography, colors, and layout styles are defined
- Reusable UI components exist (buttons, forms, containers, etc.)
- Components are used consistently across page shells
- Styling supports future feature development without redesign

### 2.14 Expand API Contract (Users & Orders)

- All user endpoints are fully defined
- All orders endpoints are fully defined
- Each endpoint includes authentication requirements, role, request body, validation rules, and all expected response cases
- Defined endpoints are consistent with the data model and Sprint 2 deliverables
- Previously defined endpoints are reviewed and updated if Sprint 2 development requires changes

### 2.15 Sprint 2 QA Execution

- Test cases and testing matrix are referenced in the card description via links to Sprint2_Test_Cases.md and Sprint2_Testing_Matrix.md
- All user stories are checked off as testing is completed
- No critical or high-severity defects remain open before stories move to Done
- QA execution is completed before Sprint Review

------

## Features & User Stories from Product Backlog

*Finalized during Sprint Planning on February 15, 2026*

### Feature 1: Database Foundation

[ 3 user stories: 2.1, 2.2, 2.3 ]

**User Story 2.1: Database Schema Implementation**

As a *developer*, I want a properly structured database so that all application data is stored securely and efficiently.

- **Size:** M (Medium)
- **Assigned to:** Kim Mayo

**User Story 2.2: Database Validation**

As a *developer*, I want to validate database constraints and relationships so that data integrity is maintained throughout the application.

- **Size:** S (Small)
- **Assigned to:** Caleb Fowlkes

**User Story 2.3: Backend API Endpoints for Business Features**

As a *system administrator*, I want to implement role-based data access controls so that users can only access data appropriate to their role.

- **Size:** S (Small)
- **Assigned to:** Kim Mayo (*pending refinement -- Kim, Tristin, and Serina to meet before work begins*)

------

### Feature 2: User Authentication System

[ 4 user stories: 2.4, 2.5, 2.6, 2.7 ]

**User Story 2.4: User Registration**

As a *new user*, I want to create an account with my email and password so that I can access the application.

- **Size:** S (Small)
- **Assigned to:** Kim Mayo & Tristin Gatt (Collaborative Pair/Paired programming)

**User Story 2.5: Email Verification**

As a *user*, I want the system to grant me access only to features appropriate for my role (customer or business admin) so that I have a secure and relevant experience.

- **Size:** M (Medium)
- **Assigned to:** Kim Mayo & Tristin Gatt (Collaborative Pair/Paired programming)

**User Story 2.6: Backend User Login**

As a *registered user*, I want to log in to my account so that I can access personalized features.

- **Size:** S (Small)
- **Assigned to:** Kim Mayo & Tristin Gatt (Collaborative Pair/Paired programming)

**User Story 2.7: Backend Password Reset**

As a *registered user*, I want to reset my password so that I can regain access if I forget my credentials.

- **Size:** S/M
- **Assigned to:** Kim Mayo & Tristin Gatt (Collaborative Pair/Paired programming)

------

### Feature 3: Backend & Frontend Authentication Structure

[ 2 user stories: 2.8, 2.9 ]

**User Story 2.8: Backend API Endpoints for Authentication**

As a *front-end developer*, I want backend API endpoints for authentication so that I can integrate user registration, login, and account management into the UI.

- **Size:** S (Small)
- **Assigned to:** Tristin Gatt

**User Story 2.9: Frontend Authentication Components**

As a *user*, I want user interface for registration and login so that I can create an account and access the application.

- **Size:** S (Small)
- **Assigned to:** Rachel Mizer

------

### Feature 4: Sprint Demo & Documentation

[ 1 user story: 2.10 ]

**User Story 2.10: Sprint 2 Demo Materials Preparation**

As the *Presentation Lead*, I need to prepare visual documentation and coordinate the demo order for Sprint 2 Review so that stakeholders can clearly see what was accomplished and team members know what to present.

- **Size:** S (Small)
- **Assigned to:** Tyler Royal

------

### Feature 5: Seed Data & Content

[ 1 user story: 2.11 ]

**User Story 2.11: Comprehensive Seed Data Population**

As a *developer*, I want realistic seed data populated in the database so that I can test features with representative content and teammates can develop against consistent data.

- **Size:** M (Medium)
- **Assigned to:** Caleb Fowlkes *(Rachel Mizer has already produced a dataset of 175 inventory items, a dummy store, and sample customer orders; to be uploaded to `/documents/data/`)*

------

### Feature 6: Page Shells

[ 1 user story: 2.12 ]

**User Story 2.12: UI & Admin Page Shells**

As a *developer*, I want a complete routing structure, navigation system, and placeholder page shells so that users can navigate the application and Sprint 3 developers can build features within an established UI structure.

- **Size:** S (Small)
- **Assigned to:** Rachel Mizer *(combines customer and admin shell tasks; Rachel will create a detailed implementation checklist)*

------

### Feature 7: Design System Basics

[ 1 user story: 2.13 ]

**User Story 2.13: UI Design System & Component Library**

As a *developer*, I want a design system with reusable components so that the application has consistent styling and teammates can build features faster.

- **Size:** S (Small)
- **Assigned to:** Rachel Mizer *(mockups already completed; first step is coding the global layout)*

------

### Feature 8: API Contract Expansion

[ 1 user story: 2.14 ]

**User Story 2.14: Expand API Contract (Users & Orders)**

As a *developer*, I want the API contract to define the Users and Orders endpoints so that frontend and backend development can proceed in Sprint 2 without ambiguity about requests, responses, and error handling.

- **Size:** S (Small)
- **Assigned to:** Tristin Gatt

---

### Feature 9: Sprint 2 QA Execution

[ 1 user story: 2.15 ]

**User Story 2.15: Sprint 2 QA Execution**

As a *Testing Lead*, I want a single QA tracking card on the Trello board so that I can execute and track testing across all Sprint 2 user stories without duplicating existing documentation.

- **Size:** S (Small)
- **Assigned to:** Kenny Bacdayan



------

## Task Breakdown & Team Assignments

| ID     | Task Description                                | User Story | Assigned To        | Size | Status      |
| ------ | ----------------------------------------------- | ---------- | ------------------ | ---- | ----------- |
| 2.1.1  | Design database schema (ERD)                    | 2.1        | Kim M.             | M    | Done        |
| 2.1.2  | Implement database models in Django             | 2.1        | Kim M.             | M    | Done        |
| 2.1.3  | Create database migration scripts               | 2.1        | Kim M.             | S    | Done        |
| 2.2.1  | Write database constraint tests                 | 2.2        | Caleb F.           | S    | To Do       |
| 2.2.2  | Validate foreign key relationships              | 2.2        | Caleb F.           | S    | To Do       |
| 2.2.3  | Test data integrity enforcement                 | 2.2        | Caleb F.           | S    | To Do       |
| 2.3.1  | Implement role-based query filters              | 2.3        | Kim M.             | M    | To Do       |
| 2.3.2  | Add role checks to API endpoints                | 2.3        | Kim M.             | M    | To Do       |
| 2.4.1  | Build user registration backend endpoint        | 2.4        | Kim M., Tristin G. | S    | To Do       |
| 2.4.2  | Implement password hashing                      | 2.4        | Kim M., Tristin G. | S    | To Do       |
| 2.4.3  | Create registration form UI                     | 2.4        | Kim M., Tristin G. | S    | To Do       |
| 2.5.1  | Build email verification token generation       | 2.5        | Kim M., Tristin G. | M    | To Do       |
| 2.5.2  | Create email verification send endpoint         | 2.5        | Kim M., Tristin G. | M    | To Do       |
| 2.5.3  | Create email verification confirmation endpoint | 2.5        | Kim M., Tristin G. | S    | To Do       |
| 2.5.4  | Design email verification template              | 2.5        | Kim M., Tristin G. | S    | To Do       |
| 2.6.1  | Build login backend endpoint                    | 2.6        | Kim M., Tristin G. | S    | To Do       |
| 2.6.2  | Implement JWT token issuance and expiry         | 2.6        | Kim M., Tristin G. | S    | To Do       |
| 2.6.3  | Create login form UI                            | 2.6        | Kim M., Tristin G. | S    | To Do       |
| 2.7.1  | Build password reset request endpoint           | 2.7        | Kim M., Tristin G. | S    | To Do       |
| 2.7.2  | Implement time-limited reset token generation   | 2.7        | Kim M., Tristin G. | S    | To Do       |
| 2.7.3  | Build password reset confirmation endpoint      | 2.7        | Kim M., Tristin G. | S    | To Do       |
| 2.8.1  | Design API endpoint structure                   | 2.8        | Tristin G.         | S    | To Do       |
| 2.8.2  | Implement all auth API endpoints                | 2.8        | Tristin G.         | M    | To Do       |
| 2.8.3  | Document API with request/response examples     | 2.8        | Tristin G.         | S    | To Do       |
| 2.9.1  | Create landing page component                   | 2.9        | Rachel M.          | S    | To Do       |
| 2.9.2  | Build customer navigation bar                   | 2.9        | Rachel M.          | S    | To Do       |
| 2.9.3  | Build business admin sidebar                    | 2.9        | Rachel M.          | S    | To Do       |
| 2.9.4  | Configure routing with role-based guards        | 2.9        | Rachel M.          | S    | To Do       |
| 2.10.1 | Create screenshot folders for each team member  | 2.10       | Tyler R.           | S    | To Do       |
| 2.10.2 | Collect and upload screenshots with filenames   | 2.10       | Tyler R.           | S    | To Do       |
| 2.10.3 | Create and commit demo order document           | 2.10       | Tyler R.           | S    | To Do       |
| 2.10.4 | Create and commit visual summary document       | 2.10       | Tyler R.           | S    | To Do       |
| 2.11.1 | Write seed data script                          | 2.11       | Caleb F.           | M    | To Do       |
| 2.11.2 | Create menu items seed data                     | 2.11       | Caleb F.           | S    | To Do       |
| 2.11.3 | Create users and orders seed data               | 2.11       | Caleb F.           | S    | To Do       |
| 2.12.1 | Create menu browsing page shell                 | 2.12       | Rachel M.          | M    | In Progress |
| 2.12.2 | Create shopping cart page shell                 | 2.12       | Rachel M.          | S    | In Progress |
| 2.12.3 | Create order history page shell                 | 2.12       | Rachel M.          | S    | In Progress |
| 2.12.4 | Create account/profile page shell               | 2.12       | Rachel M.          | S    | In Progress |
| 2.12.5 | Create admin dashboard page shell               | 2.12       | Rachel M.          | M    | In Progress |
| 2.12.6 | Create menu management page shell               | 2.12       | Rachel M.          | M    | In Progress |
| 2.12.7 | Create inventory management page shell          | 2.12       | Rachel M.          | M    | In Progress |
| 2.12.8 | Create orders management page shell             | 2.12       | Rachel M.          | S    | In Progress |
| 2.13.1 | Define color palette and typography             | 2.13       | Rachel M.          | S    | In Progress |
| 2.13.2 | Create reusable Button component                | 2.13       | Rachel M.          | S    | In Progress |
| 2.13.3 | Create reusable Form Input component            | 2.13       | Rachel M.          | S    | In Progress |
| 2.13.4 | Create Card and Alert components                | 2.13       | Rachel M.          | S    | In Progress |
| 2.13.5 | Implement responsive layout system              | 2.13       | Rachel M.          | M    | In Progress |
| 2.14.1 | Define all Users endpoints                      | 2.14       | Tristin G.         | S    | To Do       |
| 2.14.2 | Define all Orders endpoints                     | 2.14       | Tristin G.         | S    | To Do       |
| 2.14.3 | Review and update previously defined endpoints  | 2.14       | Tristin G.         | S    | To Do       |
| 2.15   | Sprint 2 QA Execution                           | 2.15       | Kenny b.           | S    | In Progress |

## **Total Tasks:** 53 — 13 Medium (M), 40 Small (S)

## Timing Expectations & Milestones

### Week 1: Foundation & Infrastructure (Feb 16 - Feb 20)

**Focus:** Database, Authentication Backend, Navigation Structure, Design System

**Key Deliverables:**

- Complete database schema design, implementation, and migration scripts
- Complete seed data creation and population
- Build backend API endpoints for authentication (registration, login, JWT tokens)
- Create frontend authentication components (registration form, login form)
- Set up application routing and navigation structure (customer & business sides)
- Define design system basics (colors, typography, reusable components)
- Connect frontend to backend API

**Milestones:**

- **Thursday 2/19 (7:00 PM):** Mid-Sprint Check-In - Demo progress, identify blockers
- **Friday 2/20:** Submit Sprint 2 Week 1 Status Update

**Week 1 Success Criteria:**

- ✅ Database schema implemented with seed data
- ✅ Users can register and login (full stack working)
- ✅ Navigation structure exists (customer & business sides)
- ✅ Design system basics defined (colors, typography, core components)
- ✅ API endpoints documented

------

### Week 2: Page Shells, Polish & Testing (Feb 21 - Feb 25)

**Focus:** Build all page shells, implement role-based access, test everything

**Key Deliverables:**

- Create all customer page shells (menu browsing, cart, order history, account)
- Create all business admin page shells (dashboard, menu management, inventory, orders)
- Implement role-based access control (query filters, API protection, route guards)
- Apply responsive layout system across all pages
- Complete database validation tests
- Conduct comprehensive manual testing (desktop, tablet, mobile)
- Update all documentation (README, API docs, setup instructions)
- Prepare Sprint Review demo

**Milestones:**

- **Monday 2/23 (7:00 PM):** Final Sprint Check-In - Demo customer pages and role-based access
- **Wednesday 2/25 (EOD):** Code freeze - all features complete, tested, and documented
- **Thursday 2/26 (7:00 PM):** Sprint Review
- **Thursday 2/26 (8:00 PM):** Sprint Retrospective
- **Friday 2/27:** Submit Sprint 2 Week 2 Status Update

**Week 2 Success Criteria:**

- ✅ Can navigate entire customer flow
- ✅ Can navigate entire business admin flow
- ✅ All pages display seed data correctly
- ✅ Role-based access prevents unauthorized access
- ✅ Works on mobile and desktop
- ✅ Everything is documented and ready to demo

------

## Sprint 2 Submission Requirements

*The following deliverables are expected at the end of Sprint 2. Detailed requirements will be posted on Blackboard.*

### Required Deliverables

- [ ] **Sprint 2 Status Update**s (due Friday, Feb 20 & Friday, Feb 27)
  - Tasks completed by team members
  - Problems/challenges/roadblocks encountered
  - Trello board capture
- [ ] **Working Code Repository** (GitHub)
  - Database migration scripts
  - Seed data scripts with documentation
  - Backend API code with authentication endpoints
  - Frontend authentication components
  - Application routing and navigation components
  - Customer-side page shell components
  - Business admin page shell components
  - Design system components and style guide
  - README with setup instructions
- [ ] **API Documentation**
  - Endpoint descriptions
  - Request/response examples
  - Error codes and handling
- [ ] **Database Schema Documentation**
  - ERD (Entity Relationship Diagram)
  - Table definitions and relationships
- [ ] **Test Results & Documentation**
  - Manual test cases executed
  - Test results summary
  - Known issues log
- [ ] **Sprint Review & Retrospective Notes**
  - Sprint review summary
  - Retrospective findings and action items

------

## Risk Management

### Potential Risks

**Database complexity:** First-time database design may require iteration

- *Mitigation:* Start with core tables first, iterate based on testing feedback

**Email service configuration:** Setting up email verification may have technical challenges

- *Mitigation:* Use test email services, document configuration steps clearly

**Team member availability:** Mid-February academic schedule may impact availability

- *Mitigation:* Communicate early about conflicts, redistribute tasks if needed

**Integration challenges:** Connecting frontend to backend may reveal unexpected issues

- *Mitigation:* Test integration early and often, maintain clear API contracts

**Scope expansion:** Adding application shell work increases Sprint 2 workload significantly

- *Mitigation:* Prioritize core navigation and basic page shells; defer email verification and password reset to Sprint 3 if needed; use Planning Poker to ensure realistic commitments

------

## Team Collaboration & Communication

### Communication Channels

- **Microsoft Teams:** Daily check-ins, quick questions, file sharing
- **Trello:** Task tracking, progress updates, sprint backlog management
- **GitHub:** Code collaboration, pull requests, code reviews
- **Outlook:** Formal communication, meeting invitations

### Scheduled Meetings

- **Sprint Planning:** Monday, Feb 16 (7:00 PM - 8:30 PM)
- **Mid-Sprint Check-in:** Thursday, Feb 19 (7:00 PM - 8:00 PM)
- **Final-Sprint Check-in:** Monday, Feb 23 (7:00 PM - 8:30 PM)
- **Sprint Review:** Thursday, Feb 26 (7:00 PM TO 7:50 PM)
- **Sprint Retrospective:** Thursday, Feb 26 (8:00 PM TO 8:30 PM)

------

*Last updated: February 19, 2026 -- reflects updated user stories and acceptance criteria from S2_Task_US_AC. Key changes: 2.3 renamed to Backend API Endpoints for Business Features; 2.5 user story updated to role-based access; 2.6 renamed to Backend User Login; 2.10 changed to Sprint 2 Demo Materials Preparation (Tyler R.); 2.12 consolidated into UI & Admin Page Shells; 2.14 added as new story for API Contract expansion (Tristin G.); 2.9 assigned to Rachel Mizer (S); 2.15 added as new story for Sprint 2 QA Execution (Kenny B.) — single Trello card tracking all QA progress with links to existing test documentation.*