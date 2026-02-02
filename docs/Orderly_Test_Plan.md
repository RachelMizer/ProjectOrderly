# Orderly – Test Plan

## 1. Purpose
This Test Plan defines the testing strategy for the **Orderly**  project. Its purpose is to ensure the application meets the functional and non-functional requirements outlined in the Software Requirements Specification and operates reliably for both customers and business users.

Testing will be performed incrementally throughout Agile sprint cycles, with a focus on validating core functionality early and reducing project risk.

---

## 2. Testing Objectives
The objectives of testing are to:
- Verify that all **Must** requirements are implemented correctly
- Validate critical customer and business workflows
- Detect defects early and provide fast feedback to the team
- Ensure features are stable and demo-ready for sprint reviews
- Provide documented evidence of quality and testing coverage

---

## 3. Scope of Testing

### 3.1 In Scope

**Customer Functionality**
- Product catalog browsing
- Order creation and submission
- Order status visibility
- Basic input validation

**Business / Admin Functionality**
- Product management
- Inventory management and stock updates
- Restricted access to admin-only features

**System & Security**
- Authentication and session handling
- Role-based access control (Customer vs Business)
- Basic usability and responsiveness
- Error handling and validation messages

---

### 3.2 Out of Scope
The following items are not included in testing for this phase:
- Real payment gateway integration (payments are simulated)
- Load, stress, or performance testing at scale
- Native mobile application testing
- External API integrations marked as future enhancements

---

## 4. Test Approach

### 4.1 Testing Methodology
Testing will follow an **Agile, iterative approach** aligned with sprint development. Test scenarios and test cases will be created alongside backlog items and refined as features evolve.

### 4.2 Test Types
- Manual Functional Testing (primary method)
- Smoke Testing before sprint reviews
- Regression Testing for impacted features
- Exploratory Testing during sprint demos

Automated testing may be considered in later sprints if time allows but is not required for Sprint 1.

---

## 5. Test Environment
Testing will be conducted in a development environment using:
- Local or hosted development servers
- Supported web browsers (Chrome preferred)
- Seeded or mock test data
- Simulated payment workflows

---

## 6. Roles and Responsibilities

### Tester / QA
- Create and maintain test scenarios and test cases
- Execute tests for sprint backlog items
- Log and track defects
- Verify fixes and confirm readiness for sprint reviews

### Developers
- Implement features and fix reported defects
- Support defect investigation and resolution

### Scrum Master
- Ensure testing is included in sprint planning
- Track testing progress and blockers

### Team Members
- Support exploratory testing during sprint reviews
- Assist with validation of completed features

---

## 7. Test Deliverables
The following testing artifacts will be produced:
- Test Plan document
- Test scenarios and test cases
- Defect reports
- Sprint testing summaries
- Final testing summary for project release

---

## 8. Entry and Exit Criteria

### 8.1 Entry Criteria
Testing may begin when:
- Feature implementation is complete
- Acceptance criteria are defined
- Test environment is available

### 8.2 Exit Criteria
A feature is considered test-complete when:
- All acceptance criteria are met
- Critical defects are resolved or documented
- Feature is stable and demo-ready
- Test results are recorded

---

## 9. Defect Management
Defects will be tracked using the team’s agreed-upon tool (e.g., Trello or GitHub Issues). Each defect report will include:
- Summary and description
- Steps to reproduce
- Expected vs. actual results
- Severity level
- Current status

---

## 10. Risks and Mitigation

| Risk | Mitigation |
|-----|-----------|
| Incomplete requirements | Clarify during sprint planning |
| Limited testing time | Prioritize Must requirements |
| Late feature changes | Perform focused regression testing |
| Environment instability | Maintain consistent setup and documentation |

---

## 11. Test Schedule
Testing activities will align with sprint cycles:
- Test scenarios drafted during sprint planning
- Continuous testing during development
- Test status reviewed before sprint demos
- Regression testing performed before final submission

---

## 12. Approval and Maintenance
This Test Plan is a **living document** and will be reviewed and updated as requirements, scope, and development progress evolve throughout the project.
