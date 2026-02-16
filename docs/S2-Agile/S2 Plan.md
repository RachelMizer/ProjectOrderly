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

### Database Setup & Validation

- Database schema includes all required tables: Users, Roles, Menu Items, Orders, Order Items, Inventory, Suppliers
- Foreign key relationships properly established and tested
- Database constraints enforce data integrity (e.g., email uniqueness, non-null requirements)
- Test data populated for at least 2 users per role (customer, business owner)

### User Registration & Login

- Users can successfully register with email, password, and role selection
- Passwords are hashed and stored securely (never stored in plain text)
- Users receive verification email after registration
- Email verification link activates user account
- Login system authenticates users and returns appropriate session/token

### Role-Based Access Control

- Customer role has access only to customer-facing data and features
- Business owner role has access to admin dashboard data and features
- API endpoints enforce role-based permissions (reject unauthorized access)
- Unauthorized access attempts return appropriate error messages

### Password Reset

- Users can request password reset via email
- Reset link is time-limited and single-use
- Users can successfully set new password using reset link
- System prevents reuse of old passwords

### Backend & Frontend Structure

- Backend API endpoints created for authentication operations
- Basic frontend components exist for registration, login, and password reset
- Frontend successfully connects to backend API
- Error handling implemented for common scenarios (invalid credentials, network errors)

### Application Shell & Navigation
- Landing page exists with clear entry points for customers and business users
- Customer-side navigation includes: Menu, Cart, Orders, Account links
- Business-side navigation includes: Dashboard, Menu Management, Inventory, Orders links
- Route protection enforces role-based access (customers can't access /admin/*, business users redirected appropriately)
- All navigation links work and route to correct pages
- Browser back/forward buttons function correctly
- Current page is highlighted in navigation

### Seed Data & Content

- Database contains at least 10 menu items with realistic names, descriptions, prices, and categories
- 3-5 product categories exist (Appetizers, Entrees, Desserts, etc.)
- 5+ inventory items linked to menu items with stock quantities
- 2-3 suppliers with contact information
- 2+ test users for each role (customer, business admin)
- 3-5 sample orders with varied statuses (Pending, In Progress, Completed)
- Seed data script is documented and reusable

### Page Shells (Customer Side)

- Menu browsing page displays seed menu items in grid/list format
- Shopping cart page shows empty state or placeholder structure
- Order history page displays user's orders from seed data
- Account/profile page shows user information
- All pages use consistent navigation and styling
- All pages are responsive (mobile and desktop)

### Page Shells (Business Admin)

- Admin dashboard shows welcome message and placeholder widgets
- Menu management page displays seed menu items in table format
- Inventory page shows seed inventory data with stock level indicators
- Orders management page displays seed orders with status filtering
- All admin pages enforce business role access
- All admin pages use consistent sidebar navigation

### Design System Basics

- Color palette defined and applied consistently (primary, secondary, success, error, neutrals)
- Typography system established (font families, sizes, weights)
- Reusable components exist: Button, Form Input, Card, Navigation, Alert
- Spacing system used consistently across all pages
- Responsive breakpoints defined and implemented
- Application works on mobile (320px+), tablet (768px+), and desktop (1024px+)

------

## Features & User Stories from Product Backlog

*The following items will be pulled from the Product Backlog and worked on during Sprint 2. Final selections and task assignments will be confirmed during the Sprint Planning meeting on February 15, 2026.*

### Feature 1: Database Foundation
[ 3 user stories: 2.1, 2.2, 2.3 ]

**User Story 2.1: Database Schema Implementation**

As a *developer*, I want a properly structured database so that all application data is stored securely and efficiently.

- **Size:** L (Large)
- **Assigned to:** TBD

**User Story 2.2: Database Validation**

As a *developer*, I want to validate database constraints and relationships so that data integrity is maintained throughout the application.

- **Size:** M (Medium)
- **Assigned to:** TBD

**User Story 2.3: Role-Based Data Access Controls**

As a *system administrator*, I want to implement role-based data access controls so that users can only access data appropriate to their role.

- **Size:** M (Medium)
- **Assigned to:** TBD

---

### Feature 2: User Authentication System
[ 3 user stories: 2.4, 2.5, 2.6 ]

**User Story 2.4: User Registration**

As a *new user*, I want to create an account with my email and password so that I can access the application.

- **Size:** M (Medium)
- **Assigned to:** TBD

**User Story 2.5: User Login**

As a *registered user*, I want to log in to my account so that I can access my personalized features.

- **Size:** M (Medium)
- **Assigned to:** TBD

**User Story 2.6: Role-Based Access Control**

As a *user*, I want the system to grant me access only to features appropriate for my role (customer or business admin) so that I have a secure and relevant experience.

- **Size:** M (Medium)
- **Assigned to:** TBD

---

### Feature 3: Backend & Frontend Authentication Structure
[ 2 user stories: 2.7, 2.8 ]

**User Story 2.7: Backend API Endpoints for Authentication**

As a *frontend developer*, I want backend API endpoints for authentication so that I can integrate user registration, login, and account management into the UI.

- **Size:** L (Large)
- **Assigned to:** TBD

**User Story 2.8: Frontend Authentication Components**

As a *user*, I want a user interface for registration and login so that I can create an account and access the application.

- **Size:** L (Large)
- **Assigned to:** TBD

---

### Feature 4: Application Shell & Navigation
[ 1 user story: 2.9 ]

**User Story 2.9: Application Routing & Navigation Structure**

As a *developer*, I want a complete routing structure with navigation components so that users can navigate between all major pages and role-based access is enforced.

- **Size:** L (Large)
- **Assigned to:** TBD

---

### Feature 5: Seed Data & Content
[ 1 user story: 2.10 ]

**User Story 2.10: Comprehensive Seed Data Population**

As a *developer*, I want realistic seed data populated in the database so that I can test features with representative content and teammates can develop against consistent data.

- **Size:** M (Medium)
- **Assigned to:** TBD

---

### Feature 6: Page Shells
[ 2 user stories: 2.11, 2.12 ]

**User Story 2.11: Customer-Side Page Shells**

As a *developer*, I want placeholder pages for customer-facing features so that Sprint 3 developers can immediately build functionality into existing page structures.

- **Size:** L (Large)
- **Assigned to:** TBD

**User Story 2.12: Business Admin Page Shells**

As a *developer*, I want placeholder pages for business admin features so that Sprint 4 developers can immediately build functionality into existing page structures.

- **Size:** L (Large)
- **Assigned to:** TBD

---

### Feature 7: Design System Basics
[ 1 user story: 2.13 ] 

**User Story 2.13: Core Design System & Component Library**

As a *developer*, I want a design system with reusable components so that the application has consistent styling and teammates can build features faster.

- **Size:** L (Large)
- **Assigned to:** TBD

------

## Task Breakdown & Team Assignments

*Detailed task assignments will be finalized during Sprint Planning using Planning Poker. Below is the preliminary task structure.*

| ID    | Task Description                                | User Story | Assigned To | Size | Status |
| ----- | ----------------------------------------------- | ---------- | ----------- | ---- | ------ |
| 2.1.1 | Design database schema (ERD)                    | 2.1        | TBD         | M    | To Do  |
| 2.1.2 | Implement database models in Django             | 2.1        | TBD         | L    | To Do  |
| 2.1.3 | Create database migration scripts               | 2.1        | TBD         | M    | To Do  |
| 2.2.1 | Write database constraint tests                 | 2.2        | TBD         | M    | To Do  |
| 2.2.2 | Validate foreign key relationships              | 2.2        | TBD         | S    | To Do  |
| 2.2.3 | Test data integrity enforcement                 | 2.2        | TBD         | S    | To Do  |
| 2.3.1 | Implement role-based query filters             | 2.3        | TBD         | M    | To Do  |
| 2.3.2 | Add role checks to API endpoints                | 2.3        | TBD         | M    | To Do  |
| 2.4.1 | Build user registration backend endpoint        | 2.4        | TBD         | M    | To Do  |
| 2.4.2 | Implement password hashing                      | 2.4        | TBD         | S    | To Do  |
| 2.4.3 | Create registration form UI                     | 2.4        | TBD         | M    | To Do  |
| 2.5.1 | Build user login backend endpoint               | 2.5        | TBD         | M    | To Do  |
| 2.5.2 | Implement JWT token generation                  | 2.5        | TBD         | M    | To Do  |
| 2.5.3 | Create login form UI                            | 2.5        | TBD         | M    | To Do  |
| 2.6.1 | Create role middleware for route protection     | 2.6        | TBD         | M    | To Do  |
| 2.6.2 | Add role checks to frontend routing             | 2.6        | TBD         | S    | To Do  |
| 2.7.1 | Design API endpoint structure                   | 2.7        | TBD         | S    | To Do  |
| 2.7.2 | Implement all auth API endpoints                | 2.7        | TBD         | L    | To Do  |
| 2.7.3 | Document API with request/response examples     | 2.7        | TBD         | S    | To Do  |
| 2.8.1 | Set up React Router                             | 2.8        | TBD         | M    | To Do  |
| 2.8.2 | Create base authentication components           | 2.8        | TBD         | L    | To Do  |
| 2.8.3 | Connect frontend to backend API                 | 2.8        | TBD         | M    | To Do  |
| 2.8.4 | Implement error handling in UI                  | 2.8        | TBD         | S    | To Do  |
| 2.9.1 | Create landing page component                   | 2.9        | TBD         | S    | To Do  |
| 2.9.2 | Build customer navigation bar                   | 2.9        | TBD         | M    | To Do  |
| 2.9.3 | Build business admin sidebar                    | 2.9        | TBD         | M    | To Do  |
| 2.9.4 | Configure routing with role-based guards        | 2.9        | TBD         | M    | To Do  |
| 2.10.1| Write seed data script                          | 2.10       | TBD         | M    | To Do  |
| 2.10.2| Create menu items seed data                     | 2.10       | TBD         | S    | To Do  |
| 2.10.3| Create users and orders seed data               | 2.10       | TBD         | S    | To Do  |
| 2.11.1| Create menu browsing page shell                 | 2.11       | TBD         | M    | To Do  |
| 2.11.2| Create shopping cart page shell                 | 2.11       | TBD         | S    | To Do  |
| 2.11.3| Create order history page shell                 | 2.11       | TBD         | S    | To Do  |
| 2.11.4| Create account/profile page shell               | 2.11       | TBD         | S    | To Do  |
| 2.12.1| Create admin dashboard page shell               | 2.12       | TBD         | M    | To Do  |
| 2.12.2| Create menu management page shell               | 2.12       | TBD         | M    | To Do  |
| 2.12.3| Create inventory management page shell          | 2.12       | TBD         | M    | To Do  |
| 2.12.4| Create orders management page shell             | 2.12       | TBD         | S    | To Do  |
| 2.13.1| Define color palette and typography             | 2.13       | TBD         | S    | To Do  |
| 2.13.2| Create reusable Button component                | 2.13       | TBD         | S    | To Do  |
| 2.13.3| Create reusable Form Input component            | 2.13       | TBD         | S    | To Do  |
| 2.13.4| Create Card and Alert components                | 2.13       | TBD         | S    | To Do  |
| 2.13.5| Implement responsive layout system              | 2.13       | TBD         | M    | To Do  |
| 2.14  | Update Sprint 2 Status Reports                  | N/A        | Serina R.   | S    | To Do  |

**Total Tasks:** 42 tasks
- 6 Large (L)
- 22 Medium (M)
- 14 Small (S)
------

## Timing Expectations & Milestones

### Week 1 (Feb 14 - Feb 20)

- Complete database schema design and migration scripts
- Begin backend API development for registration and login
- Start frontend component creation
- **Team check-in:** Thursday, Feb 19 (MS Teams)
- **Submit Sprint 2 Week 1 Status Update:** Friday, Feb 20

### Week 2 (Feb 21 - Feb 27)

- Complete all authentication features (registration, login, email verification, password reset)
- Integrate frontend with backend API
- Conduct manual testing and bug fixes
- Complete API documentation
- **Sprint Review:** Thursday, Feb 26 (MS Teams)
- **Sprint Retrospective:** Thursday, Feb 26 (MS Teams)
- **Submit Sprint 2 Week 2 Status Update:** Friday, Feb 27

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

- **Sprint Planning:** Monday, Feb 15 (7:00 PM - 8:30 PM)
- **Mid-Sprint Check-in:** Thursday, Feb 19 (7:00 PM - 8:00 PM)
- **Final-Sprint Check-in:** Monday, Feb 23 (7:00 PM - 8:30 PM)
- **Sprint Review:** Thursday, Feb 26 (7:00 PM TO 7:50 PM)
- **Sprint Retrospective:** Thursday, Feb 26 (8:00 PM TO 8:30 PM)

------

*This plan will be updated following Sprint Planning on February 15, 2026.*