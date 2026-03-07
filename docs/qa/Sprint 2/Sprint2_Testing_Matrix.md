# Sprint 2 Testing Matrix – Orderly

## Sprint Scope
Sprint 2 focuses on:

- Database foundation & validation  
- User authentication system  
- Backend/Frontend authentication integration  
- Application shell & navigation  
- Seed data population  
- Design system foundation  

This matrix reflects **actual testing performed during Sprint 2**.

---

# Testing Level Definitions

| Level | Type | Description |
|------|------|-------------|
| L1 – Formal Test Cases | High Risk / Security / Core Logic | Structured test cases with positive, negative, and edge cases |
| L2 – Structured Checklist | Functional / UI / Integration | Documented validation steps; lighter-weight manual verification |
| L3 – Verification / Review | Configuration / Documentation / Visual | Confirm functionality or consistency without formal case documentation |

---

# Feature 1 – Database Foundation

| User Story | Description | Test Level | Testing Approach | Status |
|------------|------------|------------|------------------|--------|
| 2.1 | Database Schema Implementation | L1 | Validate migrations, tables, foreign keys, ORM relationships | PASS |
| 2.2 | Database Validation | L1 | Test constraints, validation rules, referential integrity | PASS |

**Primary Risks**

- Data integrity violations  
- Broken relationships between tables  
- Invalid data entering the system  

---

# Feature 2 – User Authentication System

| User Story | Description | Test Level | Testing Approach | Status |
|------------|------------|------------|------------------|--------|
| 2.4 | User Registration | L1 | Valid/invalid registration scenarios and database verification | PASS |
| 2.5 | Email Verification | L1 | Token validation, invalid token rejection, verification confirmation | PASS |
| 2.6 | Backend User Login | L1 | Authentication validation, protected endpoint access, token refresh/logout | PASS |
| 2.7 | Backend Password Reset | L1 | Password reset flow, token validation, login with new password | PASS |

**Primary Risks**

- Authentication bypass  
- Improper credential handling  
- Token reuse or expiration issues  

---

# Feature 3 – Backend & Frontend Authentication Integration

| User Story | Description | Test Level | Testing Approach | Status |
|------------|------------|------------|------------------|--------|
| 2.8 | Backend API Endpoints for Authentication | L1 | Validate endpoint responses, authentication enforcement, and status codes | PASS |
| 2.9 | Frontend Authentication Components | L2 | Manual UI validation and API integration testing | PENDING |

**Focus Areas**

- Correct HTTP status codes (200, 400, 401, 403)  
- Clear frontend error messages  
- Proper API integration  

---

# Feature 4 – Application Shell & Navigation

| User Story | Description | Test Level | Testing Approach | Status |
|------------|------------|------------|------------------|--------|
| 2.10 | Sprint 2 Visual Compilation | L3 | Visual review of integrated UI components and layout consistency | PASS |

---

# Feature 5 – Seed Data & Content

| User Story | Description | Test Level | Testing Approach | Status |
|------------|------------|------------|------------------|--------|
| 2.11 | Comprehensive Seed Data Population | L1 | Execute seed script, validate records, confirm relational data | PASS |

---

# Feature 6 – UI & Admin Interface

| User Story | Description | Test Level | Testing Approach | Status |
|------------|------------|------------|------------------|--------|
| 2.12 | UI & Admin | L3 | Manual verification of admin interface and UI shell rendering | PASS |

---

# Feature 7 – Design System

| User Story | Description | Test Level | Testing Approach | Status |
|------------|------------|------------|------------------|--------|
| 2.13 | UI Design System & Component Library | L3 | Visual review of UI components and styling consistency | PASS |
| 2.14 | Core Design System & Component Library | L3 | Verification of shared design components and layout standards | PASS |

---

# QA Effort Summary

| Testing Level | Stories | Count |
|---------------|--------|------|
| L1 – Formal Test Cases | 2.1, 2.2, 2.4, 2.5, 2.6, 2.7, 2.8, 2.11 | 8 |
| L2 – Checklist Validation | 2.9 | 1 |
| L3 – Verification / Review | 2.10, 2.12, 2.13, 2.14 | 4 |

---

# Sprint 2 QA Outcome

| Result | Count |
|------|------|
| Passed | 12 |
| Pending | 1 |
| Failed | 0 |

---

# QA Validation Summary

Sprint 2 successfully validated the core backend infrastructure of the Orderly application. Database schema integrity, validation rules, authentication mechanisms, API endpoint security, and seed data population were all tested through formal test cases and confirmed to function correctly. UI structure and design system components were reviewed through manual verification and visual inspection. One remaining item, Frontend Authentication Components (US2.9), remains pending full validation once frontend integration testing is completed.
