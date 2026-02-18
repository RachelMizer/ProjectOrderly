# Sprint 2 Test Cases – Orderly
(Sprint 2: Database, Authentication & Application Shell)

---

## Overview

Sprint 2 delivers foundational system components including:

- Database schema implementation and validation
- User authentication (registration, login, password reset)
- Role-based access control (RBAC)
- Basic backend/frontend authentication integration
- Application shell and navigation structure

This document includes formal test skeletons for high-risk features.
Execution will occur after feature implementation and code freeze.

---

# Formal Test Cases (Level 1 – Core & Security Features)

---

## TC-05 – User Registration (Valid Input)

### Test Case ID:
TC-05

### Feature:
User Registration

### User Story:
As a new user, I want to create an account with my email and password so that I can access the application.

### Preconditions:
- Application running
- Registration endpoint available
- No existing account with test email

### Test Steps:
1. Navigate to registration page.
2. Enter valid email address.
3. Enter valid password.
4. Submit registration form.

### Expected Result:
- User account is successfully created.
- Password is securely hashed in the database.
- Verification email is triggered (if enabled).
- Success confirmation is displayed.

### Actual Result:

### Status:
Not Executed – Awaiting Implementation

### Notes:
Verify password is not stored in plain text.

---

## TC-06 – User Registration (Duplicate Email)

### Test Case ID:
TC-06

### Feature:
User Registration Validation

### Preconditions:
- User already exists with test email

### Test Steps:
1. Attempt to register with an existing email.
2. Submit form.

### Expected Result:
- Registration is blocked.
- Clear error message displayed.
- No duplicate user created.

### Actual Result:

### Status:
Not Executed – Awaiting Implementation

---

## TC-07 – User Login (Valid Credentials)

### Test Case ID:
TC-07

### Feature:
User Login

### User Story:
As a registered user, I want to log in so that I can access my personalized features.

### Preconditions:
- Verified user account exists

### Test Steps:
1. Navigate to login page.
2. Enter valid email.
3. Enter correct password.
4. Submit form.

### Expected Result:
- User authenticated successfully.
- Redirected to appropriate dashboard based on role.
- Session or token is created.

### Actual Result:

### Status:
Not Executed – Awaiting Implementation

---

## TC-08 – User Login (Invalid Password)

### Test Case ID:
TC-08

### Feature:
User Login Validation

### Preconditions:
- Registered user exists

### Test Steps:
1. Enter valid email.
2. Enter incorrect password.
3. Submit form.

### Expected Result:
- Login fails.
- Appropriate error message displayed.
- No session or token created.

### Actual Result:

### Status:
Not Executed – Awaiting Implementation

---

## TC-09 – Role-Based Access Control

### Test Case ID:
TC-09

### Feature:
Role-Based Access Enforcement

### User Story:
As a system administrator, I want to restrict access based on user roles so that users can only access features relevant to them.

### Preconditions:
- Customer account exists
- Business admin account exists

### Test Steps:
1. Log in as customer.
2. Attempt to access admin-only route.
3. Observe behavior.
4. Log in as business admin.
5. Access admin route.

### Expected Result:
- Customer is denied access to admin routes.
- Business admin is granted access.
- Unauthorized API requests return appropriate error (403 Forbidden).

### Actual Result:

### Status:
Not Executed – Awaiting Implementation

---

## TC-10 – Password Reset Flow

### Test Case ID:
TC-10

### Feature:
Password Reset

### User Story:
As a registered user, I want to reset my password via email so that I can regain access if I forget it.

### Preconditions:
- Registered user exists
- Email system configured

### Test Steps:
1. Request password reset.
2. Receive reset email.
3. Click reset link.
4. Enter new password.
5. Submit.

### Expected Result:
- Reset link is valid and time-limited.
- Password updated successfully.
- Old password no longer works.
- Token cannot be reused.

### Actual Result:

### Status:
Not Executed – Awaiting Implementation

---

## TC-11 – Database Constraint Validation

### Test Case ID:
TC-11

### Feature:
Database Schema & Constraints

### User Story:
As a developer, I want database constraints enforced so that invalid data cannot be stored.

### Preconditions:
- Database schema migrated
- Test data available

### Test Steps:
1. Attempt to create user with duplicate email.
2. Attempt to create inventory item with negative quantity.
3. Attempt to create record with required field missing.

### Expected Result:
- Duplicate email rejected.
- Negative quantity rejected.
- Required field validation enforced.
- Database integrity maintained.

### Actual Result:

### Status:
Not Executed – Awaiting Implementation

---

# Sprint 2 Testing Strategy Summary

Sprint 2 formal testing will prioritize:

- Authentication security
- Role-based access enforcement
- Database integrity and constraints
- Proper error handling and validation

UI page shells and navigation will be validated using structured checklists during Week 2 manual testing.

Regression testing will be executed after code freeze prior to Sprint Review.

---
