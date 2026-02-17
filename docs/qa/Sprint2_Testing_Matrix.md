# Sprint 2 Testing Matrix – Orderly

## Sprint Scope
Sprint 2 focuses on:

- Database foundation & validation
- User authentication system
- Role-based access control (RBAC)
- Backend/Frontend authentication integration
- Application shell & navigation
- Seed data population
- Design system basics

This matrix defines the level of testing required for each Sprint 2 feature.

---

# Testing Level Definitions

| Level | Type | Description |
|-------|------|------------|
| **L1 – Formal Test Cases** | High Risk / Security / Core Logic | Structured test cases with positive, negative, and edge cases |
| **L2 – Structured Checklist** | Functional / UI / Integration | Documented validation steps; lighter-weight manual verification |
| **L3 – Verification / Review** | Configuration / Documentation / Visual | Confirm functionality or consistency without formal case documentation |

---

# Feature 1 – Database Foundation

| User Story | Description | Test Level | Testing Approach |
|------------|------------|------------|------------------|
| 2.1 | Database Schema Implementation | L1 | Validate tables, relationships, migrations |
| 2.2 | Database Validation | L1 | Test constraints (unique email, non-null, non-negative values) |
| 2.3 | Role-Based Data Access Controls | L1 | Validate authorized vs unauthorized queries |

**Primary Risks:**
- Data integrity violations
- Improper foreign key relationships
- Unauthorized data access

---

# Feature 2 – User Authentication System

| User Story | Description | Test Level | Testing Approach |
|------------|------------|------------|------------------|
| 2.4 | User Registration | L1 | Valid/invalid registration scenarios |
| 2.5 | Email Verification | L1 | Token validation, expiration, reuse prevention |
| 2.6 | User Login | L1 | Valid login, invalid password, unverified user |
| 2.7 | Password Reset | L1 | Reset flow, token expiration, old password rejection |

**Primary Risks:**
- Password stored in plain text
- Authentication bypass
- Token reuse or improper expiration
- Improper role assignment

---

# Feature 3 – Backend & Frontend Authentication Structure

| User Story | Description | Test Level | Testing Approach |
|------------|------------|------------|------------------|
| 2.8 | Backend API Endpoints | L2 | Validate status codes, request/response structure |
| 2.9 | Frontend Authentication Components | L2 | Validate form behavior, error handling, API connectivity |

**Focus Areas:**
- Correct status codes (200, 400, 401, 403)
- Clear frontend error messages
- No console/runtime errors

---

# Feature 4 – Application Shell & Navigation

| User Story | Description | Test Level | Testing Approach |
|------------|------------|------------|------------------|
| 2.10 | UI & Backend Communication Testing | L2 | End-to-end login → redirect → route protection validation |

**Checklist Validation Includes:**
- Customer cannot access `/admin/*`
- Business user redirected appropriately
- Navigation links function correctly
- Browser back/forward works properly

---

# Feature 5 – Seed Data & Content

| User Story | Description | Test Level | Testing Approach |
|------------|------------|------------|------------------|
| 2.11 | Comprehensive Seed Data Population | L2 | Validate record counts, relationships, realistic data |

**Validation Includes:**
- 10+ menu items
- 2+ users per role
- Sample orders linked correctly
- Inventory linked to products

---

# Feature 6 – Page Shells

| User Story | Description | Test Level | Testing Approach |
|------------|------------|------------|------------------|
| 2.12 | Customer & Admin Page Shells | L2 | Manual rendering & navigation checklist |

**Validation Includes:**
- Pages render without error
- Consistent navigation
- Seed data displayed correctly
- Responsive behavior verified

---

# Feature 7 – Design System Basics

| User Story | Description | Test Level | Testing Approach |
|------------|------------|------------|------------------|
| 2.13 | Core Design System & Components | L3 | Visual consistency & component reuse review |

**Validation Includes:**
- Consistent color palette
- Reusable components function
- Responsive breakpoints applied

---

# QA Effort Summary

| Testing Level | Number of Stories | Effort Level |
|---------------|------------------|--------------|
| L1 – Formal Test Cases | 7 | High |
| L2 – Checklist Validation | 4 | Medium |
| L3 – Verification/Review | 1 | Low |

---

# Sprint 2 QA Strategy

1. Execute all L1 tests before code freeze.
2. Complete L2 checklist validation during Week 2.
3. Perform regression testing after full integration.
4. Log and prioritize defects before Sprint Review.
5. Confirm Definition of Done criteria are met before marking stories as complete.

---

# Definition of Done – QA Validation Gate

A Sprint 2 story cannot move to **Done** unless:

- All acceptance criteria are met.
- Assigned test level validation completed.
- No open critical or high-severity defects remain.
- QA review completed.

---
