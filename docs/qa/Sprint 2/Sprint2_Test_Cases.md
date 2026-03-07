# Sprint 2 Test Cases
Project: **Orderly**
Sprint: **Sprint 2 — Backend Foundations & Authentication**

---

## US2.1 — Database Schema

### Test Case ID:
TC-2.1-01

### Feature:
Database Schema

### User Story:
As a developer, I want a properly structured database so that all application data is stored securely and efficiently.

### Preconditions:
- MySQL server running locally  
- Clean database available  
- Django configured for MySQL  
- Sprint 2 migrations present for:
  - accounts  
  - catalog  
  - inventory  
  - suppliers  
  - orders  

### Test Steps:

#### Step A — Migration Integrity
1. Run `python manage.py makemigrations`  
2. Run `python manage.py migrate`  
3. Re-run `python manage.py migrate`  
4. Run `python manage.py showmigrations`  

**Expected Result**
- No migration errors  
- Second migrate shows no pending migrations  
- All Sprint 2 migrations marked applied  

#### Step B — Physical Schema Verification
1. Connect to MySQL  
2. Execute `SHOW TABLES;`  
3. Query foreign keys via `INFORMATION_SCHEMA.KEY_COLUMN_USAGE`  

**Expected Result**
- Core domain tables exist  
- Django system tables exist  
- Foreign key constraints enforced across apps  

#### Step C — Relational Usability (Happy Path)
1. Open Django shell  
2. Create linked records:

Supplier → Category → Product → ProductVariant →  
CustomerProfile → Order → OrderItem  

**Expected Result**
- Records save successfully  
- Foreign keys resolve correctly  
- Duplicate product constraint enforced  
- No ORM or database integrity errors  


### Actual Result:
All migrations applied successfully.  
MySQL verification confirmed table creation and enforced foreign keys.  
Linked relational records created successfully.  
Duplicate product constraint correctly enforced.  

### Evidence

**Figure 1 – Successful migration execution**  
![Migration Output](screenshots/tc04_migrate.jpg)

**Figure 2 – showmigrations confirmation**  
![Showmigrations](screenshots/tc04_showmigrations.jpg)

**Figure 3 – MySQL table creation**  
![SHOW TABLES](screenshots/tc04_show_tables.jpg)

**Figure 4 – Relational record creation in Django shell**  
![Shell Success](screenshots/tc04_shell_success.jpg)

### Status:
PASS

### Notes:
Confirms foundational database readiness required for all Sprint 2 features.

---

## US2.2 — Database Validation

### Test Case ID:
TC-2.2-01

### Feature:
Database Validation

### User Story:
As a developer, I want to validate database constraints and relationships so that data integrity is maintained throughout the application.

### Preconditions:

- Application is running locally.
- Database migrations have been successfully applied.
- Django Admin is accessible.
- A superuser account exists.
- Test users exist with different roles (e.g., CUSTOMER and BUSINESS).
- Backend API endpoints are accessible.

### Test Steps:

1. Log in to Django Admin as a superuser.

2. Navigate to Customer Profiles.

3. Attempt to create a CustomerProfile with missing required fields.

4. Attempt to create a CustomerProfile with an invalid state format.

5. Attempt to create a CustomerProfile with an invalid ZIP code format.

6. Attempt to create a CustomerProfile for a user whose role is BUSINESS.

7. Attempt to create multiple CustomerProfiles for the same user.

8. Attempt to register two users through the API using the same email address.

9. Verify relationships between User and CustomerProfile enforce referential integrity.

10. Attempt to save each invalid entry.

### Expected Result:
- Required field validation prevents incomplete records from being saved.

- Invalid state or ZIP code formats are rejected.

- Duplicate records violating unique constraints are rejected.

- Cross-field validation prevents CustomerProfiles from being created for non-CUSTOMER users.

- Referential integrity ensures CustomerProfiles must reference a valid User.

- API validation prevents duplicate user email registrations.

### Actual Result:
All validation rules executed correctly. Invalid data was rejected through both Django Admin and API endpoints. Required, unique, and format constraints were enforced. Cross-field validation prevented CustomerProfiles from being created for users without the CUSTOMER role. Referential integrity was maintained.

### Evidence:
**Figure 1 – User Required**  
![User Required](screenshots/2.2/User_required.jpg)

### Status:
PASS

### Notes:
During testing, BUSINESS users appeared in the Django Admin dropdown when selecting a user for CustomerProfile creation. However, model validation correctly prevented the record from being saved, so data integrity requirements for US2.2 were still satisfied.

---

## US2.4 — User Registration

### Test Case ID:
TC-2.4-01

### Feature:
User Registration

### User Story:


### Preconditions:


### Test Steps:


### Expected Result:


### Actual Result:


### Status:


### Notes:


---

## US2.5 — Email Verification

### Test Case ID:
TC-2.5-01

### Feature:
Email Verification

### User Story:


### Preconditions:


### Test Steps:


### Expected Result:


### Actual Result:


### Status:


### Notes:


---

## US2.6 — Backend User Login

### Test Case ID:
TC-2.6-01

### Feature:
Backend User Login

### User Story:


### Preconditions:


### Test Steps:


### Expected Result:


### Actual Result:


### Status:


### Notes:


---

## US2.7 — Backend Password Reset

### Test Case ID:
TC-2.7-01

### Feature:
Backend Password Reset

### User Story:


### Preconditions:


### Test Steps:


### Expected Result:


### Actual Result:


### Status:


### Notes:


---

## US2.8 — Backend API Endpoints for Authentication

### Test Case ID:
TC-2.8-01

### Feature:
Backend API Endpoints for Authentication

### User Story:


### Preconditions:


### Test Steps:


### Expected Result:


### Actual Result:


### Status:


### Notes:


---

## US2.9 — Frontend Authentication Components

### Test Case ID:
TC-2.9-01

### Feature:
Frontend Authentication Components

### User Story:


### Preconditions:


### Test Steps:


### Expected Result:


### Actual Result:


### Status:


### Notes:


---

## US2.10 — Sprint 2 Visual Compilation

### Test Case ID:
TC-2.10-01

### Feature:
Sprint 2 Visual Compilation

### User Story:


### Preconditions:


### Test Steps:


### Expected Result:


### Actual Result:


### Status:


### Notes:


---

## US2.11 — Comprehensive Seed Data Population

### Test Case ID:
TC-2.11-01

### Feature:
Comprehensive Seed Data Population

### User Story:


### Preconditions:


### Test Steps:


### Expected Result:


### Actual Result:


### Status:


### Notes:


---

## US2.12 — UI & Admin

### Test Case ID:
TC-2.12-01

### Feature:
UI & Admin

### User Story:


### Preconditions:


### Test Steps:


### Expected Result:


### Actual Result:


### Status:


### Notes:


---

## US2.13 — UI Design System & Component Library

### Test Case ID:
TC-2.13-01

### Feature:
UI Design System & Component Library

### User Story:


### Preconditions:


### Test Steps:


### Expected Result:


### Actual Result:


### Status:


### Notes:


---

## US2.14 — Core Design System & Component Library

### Test Case ID:
TC-2.14-01

### Feature:
Core Design System & Component Library

### User Story:


### Preconditions:


### Test Steps:


### Expected Result:


### Actual Result:


### Status:


### Notes:
