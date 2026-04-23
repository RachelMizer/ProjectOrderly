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

- Scrum Master: Serina Rodriguez
- Product Owner: Kim Mayo  
- Software Architect: Tristin Gatt  
- QA Testing Lead: Kenny Bacdayan  
- Frontend Lead: Rachel Mizer  
- Technical Writer: Caleb Fowlkes  
 
---

### Requirements Gathering 
The Orderly team gathered requirements through an iterative Agile process that combined stakeholder goals, user stories, and structured specification development. The team defined project objectives and scope to address the need for a flexible, user-friendly ordering system for small and mid-sized businesses, then translated these goals into detailed user stories and use cases representing both customer and business admin interactions (e.g., inventory management, order customization, and sales tracking). These were further refined into business, user, functional, and non-functional requirements using the MoSCoW prioritization method to ensure alignment with system priorities and constraints. Continuous collaboration using tools such as Trello, Microsoft Teams, and GitHub enabled the team to validate requirements, incorporate feedback, and maintain consistency throughout development.

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

Testing for Orderly followed a structured, iterative approach aligned with Agile Scrum, ensuring continuous validation of system functionality, security, and user workflows throughout development.

Testing Strategy:

- Incremental testing performed across all sprints
- Focus on validating Must/Should requirements and core workflows  
- Test cases and scenarios developed alongside user stories
- Entry/exit criteria ensured features were complete, stable, and demo-ready

Testing Methods:
- Manual Functional Testing: Primary method for validating user-facing features  
- Smoke Testing: Verified system stability after builds  
- Regression Testing: Ensured existing features remained functional after changes 
- API Testing: Validated endpoints (status codes, JSON structure, authentication) using Postman/PowerShell
- Exploratory Testing: Identified edge cases during sprint reviews
- UI Validation: Checked navigation, responsiveness, and role-based access using structured checklists

Sprint-Based Testing Progression:

Sprint 1 – Foundation
- Environment and application startup validation
- Initial test scenarios for authentication, RBAC, and system stability

Sprint 2 – Core System Validation
- Formal test cases for:
    * Database schema and relational integrity
    * Authentication (registration, login, password reset)
    * Role-based access control
- All critical tests passed with validated constraints and secure endpoints
- Testing matrices used to track coverage, risks, and execution status

Sprint 3 – End-to-End Workflows
- Full validation of customer experience:
    * Product browsing
    * Cart (draft orders)
    * Order submission and confirmation
    * Order history and profile management
- All user stories tested against acceptance criteria with passing results

Automated Testing:
- Backend (Pytest): 400+ tests, ~96% coverage
- Frontend (Jest): 68 tests, all passing
- End-to-End (Robot Framework): 57 tests covering full user workflows
- Overall Result: 100% pass rate across all automated test suites

Defect Management:
- Defects tracked using Trello
- Issues resolved by developers and retested by QA
- Validation ensured no critical defects remained before completion

Overall Assessment:
- Strong backend test coverage and reliability
- Full validation of critical user workflows
- Secure authentication and role enforcement confirmed

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
- SQLite or relational database  

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