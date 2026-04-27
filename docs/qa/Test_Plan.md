# Orderly Master Test Plan  

Version: 1.0  
Project: Orderly  
Prepared By: Kenny Bacdayan (QA Lead), Team 7  
Course: CSC 289 Programming Project Capstone  
Methodology: Agile Scrum  
Test Tools: Pytest, Jest, React Testing Library, Robot Framework, GitHub Actions

---

# 1. Introduction

## 1.1 Purpose
This Test Plan defines the overall testing strategy, scope, methods, environments, defect management process, and quality criteria used to validate the Orderly application for final capstone submission.

Testing was performed to verify:

- Functional requirements are satisfied  
- User stories across Sprints 1–5 meet acceptance criteria  
- Customer and admin workflows behave correctly  
- Quality risks are identified and mitigated  
- System stability is confirmed through layered manual and automated testing  
- Application is ready for final submission

---

## 1.2 Project Overview
Orderly is a full-stack ordering and business administration platform supporting customer ordering workflows and business administration tools.

### Customer Features
- User registration/login
- Product browsing and customization
- Shopping cart
- Checkout and order submission
- Order confirmation
- Order history
- Customer profile management

### Business Admin Features
- Role-based access control
- Admin navigation dashboard
- Product and variant management
- Inventory management
- Low stock monitoring
- Sales reporting
- Order fulfillment

---

## 1.3 Quality Objectives
Project quality objectives:

- Validate all acceptance criteria across Sprints 1–5  
- Maintain strong automated and manual coverage  
- Maintain CI quality gates  
- Prevent critical unresolved defects at submission  
- Demonstrate layered QA strategy using unit, integration, system, and end-to-end testing

---

# 2. Test Strategy

## 2.1 Testing Levels

| Level | Type | Tools | Status |
|---|---|---|---|
| Unit Testing | Backend | Pytest | Complete |
| Unit Testing | Frontend | Jest / RTL | Complete |
| Integration Testing | API + UI | Pytest / Jest | Complete |
| System Testing | Feature Validation | Manual Testing | Complete |
| End-to-End Testing | Workflow Automation | Robot Framework | Complete |
| Regression Testing | CI/CD Pipelines | GitHub Actions | Complete |

---

## 2.2 Test Approaches
Testing included:

- Functional Testing  
- Regression Testing  
- Integration Testing  
- API Contract Testing  
- UI Validation  
- Boundary / Negative Testing  
- Role-Based Security Testing  
- Exploratory Testing  
- End-to-End Workflow Testing

---

# 3. Test Environment

## 3.1 Hardware / Platforms
- Windows 10 / Windows 11 developer workstations
- Chrome browser (primary)
- Edge browser validation
- Responsive checks across browser viewports

---

## 3.2 Software Stack

### Backend
- Python 3.x
- Django / Django REST Framework
- MySQL 8.x

### Frontend
- React 18
- Node.js / npm
- Axios
- React Router

### Automation Tools
- Pytest
- Jest / React Testing Library
- Robot Framework + SeleniumLibrary
- GitHub Actions

---

## 3.3 Environments Used

### Local Development
Frontend  
`http://localhost:3000`

Backend API  
`http://localhost:8000/api/v1`

Database  
MySQL Port 3306

### Additional Test Environments
- Feature branches
- Pull Request branches
- Development integration branches
- GitHub Actions CI environment

---

## 3.4 Test Data
Testing used:
- Deterministic seeded datasets
- Customer and business test users
- Seeded products and variants
- Seeded orders
- Seeded inventory data
- Reporting seed data

---

# 4. Scope of Testing

## In Scope

### Customer Features
- Authentication
- Product Browsing
- Product Customization
- Cart Management
- Checkout
- Order Confirmation
- Order History
- Profile Editing

### Admin Features
- Admin Navigation
- RBAC
- Product Management
- Inventory Management
- Sales Reporting
- Low Stock Indicators
- Order Fulfillment

---

## Out of Scope
- Real payment gateway processing
- Load / performance testing
- Native mobile testing
- Production deployment certification
- Third-party integration testing

---

# 5. Requirements Traceability Matrix

| Requirement Area | Stories Covered | Manual | Pytest | Jest | Robot | Status |
|---|---|---|---|---|---|---|
Authentication | US2.x | Yes | Yes | Yes | Yes | Pass |
Product Browsing | US3.1 | Yes | Yes | Yes | Yes | Pass |
Cart / Checkout | US3.2–3.4 | Yes | Yes | Yes | Yes | Pass |
Order History | US3.5 | Yes | Yes | Yes | Yes | Pass |
Profile | US3.6 | Yes | Yes | Yes | Yes | Pass |
Customization | US3.7 | Yes | Yes | Yes | Yes | Pass |
Admin RBAC | US4.1 | Yes | Yes | Yes | Yes | Pass |
Admin Operations | US5.x | Yes | Yes | Yes | Yes | Pass |

All documented requirements were traced to test cases and validated.

---

# 6. Sprint Testing Summary

## Sprint 1
Focus:
- Environment setup
- Project scaffolding
- Initial validation

Artifacts:
- Sprint 1 Test Cases
- Sprint 1 Testing Matrix
- Sprint 1 Acceptance Coverage Report

---

## Sprint 2
Focus:
- Authentication
- Database validation
- Core account functionality

Artifacts:
- Sprint 2 Test Cases
- Sprint 2 Testing Matrix
- Sprint 2 Acceptance Coverage Report

---

## Sprint 3
Focus:
- Customer ordering workflows
- Cart and checkout
- Order history
- Profile
- Customization

Artifacts:
- Sprint 3 Test Cases
- Sprint 3 Testing Matrix
- Sprint 3 Acceptance Coverage Report

---

## Sprint 4
Focus:
- Customer flow completion
- Admin RBAC foundation

Artifacts:
- Sprint 4 Test Cases
- Sprint 4 Testing Matrix
- Sprint 4 Acceptance Coverage Report

---

## Sprint 5
Focus:
- Admin operations
- Inventory
- Reporting
- Fulfillment

Artifacts:
- Sprint 5 Test Cases
- Sprint 5 Testing Matrix
- Sprint 5 Acceptance Coverage Report

---

# 7. Automated Testing Summary

## 7.1 Backend Testing

| Metric | Result |
|---|---|
Total Tests | 301 |
Passed | 301 |
Coverage | 90%+ |
Status | Pass |

Coverage included:
- Authentication
- Orders
- Inventory
- Reporting
- Admin APIs
- Validation and error paths

---

## 7.2 Frontend Testing

| Metric | Result |
|---|---|
Test Suites | 54 |
Tests | 626 |
Statement Coverage | 90.13% |
Line Coverage | 92.18% |
Status | Pass |

Coverage included:
- Customer UI flows
- Admin pages
- Routing
- Error states
- API integration behavior

---

## 7.3 End-to-End Testing

| Metric | Result |
|---|---|
Robot Tests | 166 |
Passed | 166 |
Pass Rate | 100% |
Status | Pass |

Covered:
- Customer ordering regression
- Admin regression
- Smoke tests
- Security access scenarios

---

# 8. Manual Testing Summary

Manual testing covered:

- Functional scenarios
- Acceptance criteria validation
- UI behavior verification
- Negative testing
- Error handling validation
- Cross-browser checks

Estimated manual cases executed:
80+ scenarios

Result:
Pass

---

# 9. Defect Management

## Defect Process
Defects were tracked through:
- Trello defect cards
- PR review defects
- Manual bug reports
- Automated regression failures
- CI workflow failures
- Post-merge validation testing

---

## Sample Logged Defects

| Defect ID | Description | Severity | Status |
|---|---|---|---|
BUG-S2-01 | Backend startup blocked by undefined validator | Critical | Closed |
BUG-S2-02 | CustomerProfile schema mismatch | High | Closed |
BUG-S3-01 | Profile validation returned 500 | High | Closed |
BUG-S4-01 | Unauthorized admin route access | High | Closed |
BUG-S5-01 | Product image support failed post-merge | High | Closed |

No critical or high severity defects remained open at final submission.

---

## Defect Handling
For each defect:
- Defect reproduced
- Root cause identified
- Fix implemented
- Manual retest performed
- Automated tests added to prevent regression

---

# 10. Entry and Exit Criteria

## Entry Criteria
Testing begins when:
- Feature implemented
- Acceptance criteria defined
- Test data available
- Environment available

---

## Exit Criteria
Feature considered complete when:
- All planned tests pass
- Acceptance criteria met
- No critical defects open
- Coverage targets achieved
- Regression suites pass

---

# 11. Risk Assessment

| Risk | Mitigation |
|---|---|
Merge regressions | CI automation |
Seed data instability | Deterministic seed data |
Security defects | RBAC testing |
UI regressions | Jest + Robot automation |
Late integration defects | Regression testing |

Residual risks considered acceptable at final delivery.

---

# 12. CI/CD Quality Gates

Quality gates enforced through GitHub Actions:

## Backend Tests
- Run migrations
- Seed data
- Execute pytest suite

## Frontend Checks
- Dependency install
- React checks
- Frontend test suites

## E2E Regression
- Start backend and frontend
- Execute Robot suite

PRs required automated checks before merge.

---

# 13. Test Deliverables

Project QA deliverables include:

- Master Test Plan
- Test Cases
- Testing Matrices
- Automated Test Reports
- Acceptance Coverage Reports
- Defect Reports
- Coverage Reports
- Robot Logs
- CI Execution Evidence
- Traceability Matrix

---

# 14. Final QA Certification

All in-scope requirements across Sprints 1–5 were validated through manual, automated, and end-to-end testing.

Backend, frontend, and system-level testing achieved defined quality objectives.

No critical unresolved defects remained at final submission.

Orderly is approved from a QA perspective for capstone delivery.

**Final QA Status: PASS**

---