#  Software Release Report  
**Project Name:** Orderly  
**Version** 1.0.0  
**Team Number:** 7  
**Team Project Manager:** Serina Rodriguez  
**Team Members:** Kenny Bacdayan, Caleb James Fowlkes, Tristin Gatt, Kim Mayo, Rachel Mizer  

---

##  1. Overview

Orderly is a full-stack web application designed to streamline online ordering and inventory management for small businesses. The system enables customers to browse products, customize orders, and complete purchases, while business users manage products, inventory, and orders through an administrative interface.

Version 1.0.0 represents the first fully integrated release of Orderly, combining backend APIs, frontend functionality, and administrative tools into a cohesive system. This release delivers core functionality across authentication, product management, inventory tracking, and order processing.

---

##  2. Development Highlights

### Project Initiation 
The Project Kickoff Meeting was held January 26, 2026 at 7:00 pm, with team formation, discussion of project goals, scope and timeline.  

Roles were assigned as follows:

- **Scrum Master**: Serina Rodriguez
- **Product Owner**: Kim Mayo  
- **Software Architect**: Tristin Gatt  
- **QA Testing Lead**: Kenny Bacdayan  
- **Frontend Lead**: Rachel Mizer  
- **Technical Writer**: Caleb Fowlkes  

---

### Requirements Gathering 
The Orderly team gathered requirements through an iterative Agile process that combined stakeholder goals, user stories, and structured specification development. 

The team defined project objectives and scope to address the need for a flexible, user-friendly ordering system for small and mid-sized businesses, then translated these goals into detailed user stories and use cases representing both customer and business admin interactions (e.g., inventory management, order customization, and sales tracking). These were further refined into business, user, functional, and non-functional requirements using the MoSCoW prioritization method to ensure alignment with system priorities and constraints. 

Continuous collaboration using tools such as Trello, Microsoft Teams, and GitHub enabled the team to validate requirements, incorporate feedback, and maintain consistency throughout development.

---

### Design and Architecture 

Orderly uses a modular, domain-driven backend architecture with clearly defined responsibilities:

- `accounts` — authentication, roles, user profiles  
- `catalog` — products, categories, variants, modifiers  
- `inventory` — stock tracking and usage relationships  
- `orders` — order lifecycle and transactions  
- `suppliers` — vendor and restocking operations  
- `reporting` — analytics and administrative insights  
- `settings` — business user settings for customization

This separation of concerns improves scalability, reduces coupling, and supports team collaboration.

The system uses a relational data model supporting:
- Orders with multiple items and modifiers  
- Product variants linked to inventory usage  
- Hybrid inventory tracking (stock-based and ingredient-based)  

---

### Development Progress  

Key milestones included:

- Sprint 1 Epic: Foundation & Architecture 
- Sprint 2 Epic: Core Features & Data Layer  
- Sprint 3 Epic: Customer Experience  
- Sprint 4 Epic: Business Admin Tools  
- Sprint 5 Epic: Polish & Testing
- Final Phase: Documentation, Testing, & Release Preparation

---

### Testing and Quality Assurance  

Testing for Orderly Version 1.0.0 followed a layered, iterative QA approach aligned with Agile Scrum, with validation integrated throughout Sprints 1–5. Testing focused on functional correctness, system stability, security controls, regression protection, and end-to-end workflow reliability.

#### **Testing Methods**

  **Quality assurance included:**  

- Manual functional and exploratory testing
  * Automated backend testing using Pytest
  * Frontend component and integration testing using Jest / React Testing Library
  * End-to-end workflow automation using Robot Framework
  * Smoke and regression testing through CI workflows
  * API contract and RBAC validation using manual and automated testing

**Automated Testing Results**  

- Testing produced strong coverage across all layers:
  * Backend: 301 passing tests, 90%+ coverage
  * Frontend: 54 passing test suites, 626 passing tests, 90%+ statement coverage
  * End-to-End: 166 Robot tests, 100% pass rate

- Testing validated:
  * Customer ordering workflows
  * Authentication and role-based access control
  * Admin operations, inventory, reporting, and fulfillment
  * Regression stability across final integrations

#### **Sprint Testing Progression**

- Testing evolved incrementally across all sprints:

  **Sprint 1 – 2:** 

  - Environment
  - Authentication
  - Data integrity
  - RBAC foundation

  **Sprint 3-4:**

  - Full customer ordering workflows 
  - Admin foundation

  **Sprint 5:**

  - Admin operations
  - Reporting
  - Inventory controls
  - Final regression validation

- Sprint test cases, testing matrices, acceptance coverage reports, and automated test reports were used to track execution and coverage throughout development.

**Defect Management:**

- Defects tracked using Trello
- Issues resolved collaboratively, and retested by QA verification
- Validation at release confirmed no critical unresolved defects remained

**Overall Quality Assessment:**

- Testing demonstrated:
  * Strong backend and frontend reliability
  * Comprehensive end-to-end workflow coverage
  * Secure authentication and access control enforcement
  * Stable regression behavior through CI automation

**Release Quality Result:**
- Orderly Version 1.0.0 met quality expectations for release readiness through layered manual, automated, and end-to-end testing.

---

### Bug Fixes and Improvements (QA)  

- Duplicate email login issue  
  * Confirmed and resolved through API validation testing  

- Authentication and RBAC enforcement improvements  
  * Validated handling of 401 (unauthenticated) and 403 (unauthorized) responses  
  * Confirmed protection of restricted endpoints  

- Order and cart validation fixes  
  * Prevented submission of empty orders  
  * Prevented resubmission of non-draft orders  
  * Improved handling of invalid inputs and unauthorized access  

- Data integrity and validation improvements  
  * Enforced database constraints and relational integrity  
  * Rejected invalid and duplicate data inputs  
---

##  3. Deployment


---

##  4. Release Notes

###  New Features

As this is the initial release (Version 1.0.0), all core system functionality is considered new and included for the first time.

#### Core System
- JWT authentication (login, register, logout, password reset)  
- Role-based access control (Customer vs Business) 
- Customer profile management (view and update account information) 
- Standardized REST API  

#### Ordering System
- Draft order creation and updates  
- Item customization with modifiers  
- Order submission and status tracking  
- Order history retrieval  

#### Product & Inventory
- Product and variant management  
- Inventory tracking with reorder levels  
- Hybrid inventory system  

#### Admin Features
- Admin product endpoints  
- Profile management  
- Protected admin routes  

---

### Bug Fixes
- Fixed duplicate email login issue  
- Improved authentication and access control behavior  
- Resolved order submission and validation errors  
- Improved API error handling and data validation  

---

### Known Issues
- Modifier Management (Admin UI)  
  - Administrators are unable to create, edit, or delete product modifiers through the admin interface  
  - This functionality was formally deferred due to scope constraints  
  - Impact: Modifier data may exist but cannot be managed through the UI 

---

### Deferred Features
- Modifier management (CRUD): scope risk to Wave 1 deadline, S5 W1
- Email verification (tasks 2.5): deferred to later sprint during S2 planning, complete
- Password reset (task 2.7): deferred to later sprint during S2 planning, complete
- Supplier management (B5.7, UX5.7, F5.7): out of scope for this version

---

## 5. Upgrade Guide

### Introduction  
This release introduces the first fully integrated version of Orderly.

---

### Requirements
- Python 3.10+  
- Node.js 16+  
- Django + DRF  
- MySQL 8.0 or relational database  

---

### Backend Setup


git pull origin main
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

### Frontend Setup

cd frontend
npm install
npm start

### Authentication Notes
- JWT required for protected endpoints  
- Tokens may need to be refreshed after upgrade  

---

### API Changes
- All endpoints use `/api/v1/`  
- Standard JSON response format  

---

### Breaking Changes
- JWT authentication required  
- Updated API structure  
- Database migrations required  

---

### Verification Checklist
- Backend runs without errors  
- Frontend loads correctly  
- Login/register works  
- Admin routes restricted properly  
- Orders and inventory function correctly  

---

### Troubleshooting

#### Backend Issues
- Ensure dependencies are installed  
- Verify virtual environment is active  

#### Authentication Issues
- Clear browser storage  
- Log out and log back in  

#### Frontend Issues
- Verify backend is running  
- Check API URL configuration  

---

## 6. Conclusion

Orderly Version 1.0.0 delivers a fully functional ordering and inventory management system with integrated frontend and backend components. The system demonstrates modular design, scalability, and adherence to modern development practices.

Future work will focus on deployment, reporting, and continued UI/UX improvements.

---