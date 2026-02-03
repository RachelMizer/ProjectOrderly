# Orderly – Test Plan

## 1. Purpose
This Test Plan defines the testing strategy for the **Orderly** project. Its purpose is to ensure the application meets the functional and non-functional requirements outlined in the Software Requirements Specification (SRS) and aligns with the approved Project Development Plan (PDP).

Testing will be performed incrementally throughout Agile SCRUM sprint cycles, with a focus on validating foundational functionality early, reducing project risk, and supporting a stable, demo-ready prototype.

---

## 2. Testing Objectives
The objectives of testing are to:
- Verify that all **Must** and applicable **Should** requirements are implemented correctly
- Validate critical customer-facing and business-owner workflows
- Detect defects early and provide fast feedback during sprint development
- Ensure features are stable and demo-ready for sprint reviews
- Provide documented evidence of quality assurance activities for academic evaluation

---

## 3. Scope of Testing

### 3.1 In Scope

**Customer Functionality**
- Product/menu catalog browsing
- Order creation, customization, and submission
- Order status visibility
- Basic input validation and error handling
- Responsive behavior across desktop, tablet, and mobile screen sizes

**Business / Admin Functionality**
- Product and menu management
- Inventory management and stock updates
- Basic sales summary reporting
- Prototype supplier order management workflows
- Restricted access to admin-only features

**System & Security**
- User authentication and session handling
- Role-based access control (Customer vs Business)
- Simulated payment processing flow
- Basic usability, navigation, and validation messaging

---

### 3.2 Out of Scope
The following items are explicitly excluded from testing for this project phase, per the PDP:
- Integration with real payment gateways (e.g., Stripe, PayPal)
- Load, stress, or performance testing at scale
- Native mobile application testing
- Advanced analytics or AI-based recommendations
- External POS system integrations
- Real supplier API integrations
- Multi-language and multi-currency support

---

## 4. Test Approach

### 4.1 Testing Methodology
Testing will follow an **Agile, iterative SCRUM approach** aligned with sprint development. Test scenarios and test cases will be created alongside backlog items and refined as features evolve. Testing will begin as soon as features become testable and continue throughout each sprint.

### 4.2 Test Types
- Manual Functional Testing (primary method)
- Smoke Testing for foundational features and sprint readiness
- Regression Testing for impacted features after changes
- Exploratory Testing during sprint demos and reviews

Automated testing may be considered in later sprints if time and scope permit but is not required for Sprint 1 or early prototype validation.

---

## 5. Test Environment
Testing will be conducted in a simulated development environment using:
- Local and/or cloud-hosted development servers
- Web browsers: Chrome (primary), Edge and Safari (secondary)
- Seeded or mock test data
- Simulated payment workflows
- Django / SQLite-based backend environment

No production-level environments or live services will be used.

---

## 6. Roles and Responsibilities

### Testing Lead / QA
- Define and maintain the test plan, test scenarios, and test cases
- Execute manual testing for sprint backlog items
- Log, track, and verify defects
- Report testing status during stand-ups and sprint reviews

### Developers
- Implement features and resolve reported defects
- Support defect investigation and clarification
- Notify QA when features are ready for testing

### Scrum Master
- Ensure testing activities are included in sprint planning
- Track testing progress, risks, and blockers
- Facilitate communication between QA and development

### Team Members
- Participate in exploratory testing during sprint reviews
- Assist in validating completed features when needed

---

## 7. Test Deliverables
The following testing artifacts will be produced throughout the project:
- Test Plan document
- Sprint-based test scenarios
- Detailed test cases
- Defect/bug reports
- Sprint testing summaries
- Final testing and quality summary for project submission

---

## 8. Entry and Exit Criteria

### 8.1 Entry Criteria
Testing may begin when:
- Feature implementation is available in the development environment
- Acceptance criteria are defined or agreed upon
- Required test data is available

### 8.2 Exit Criteria
A feature is considered test-complete when:
- All defined acceptance criteria are met
- Critical and high-severity defects are resolved or documented
- Feature is stable and demo-ready
- Test results are recorded and communicated

---

## 9. Defect Management
Defects will be tracked using the team’s agreed-upon tool (Trello). Each defect report will include:
- Summary and description
- Steps to reproduce
- Expected vs. actual results
- Severity level
- Current status

Defects will be reviewed regularly during stand-ups and sprint reviews.

---

## 10. Risks and Mitigation

| Risk | Mitigation |
|-----|-----------|
| Incomplete or evolving requirements | Clarify during sprint planning and backlog refinement |
| Limited testing time | Prioritize **Must** requirements and core workflows |
| Late feature changes | Perform focused regression testing |
| Environment instability | Maintain consistent setup and document configuration |
| Over-scoping features | Align testing strictly to PDP in-scope items |

---

## 11. Test Schedule
Testing activities will align with the six-sprint project schedule defined in the PDP:
- Test scenarios drafted during sprint planning
- Continuous manual testing during development
- Test status reviewed before sprint demos
- Regression testing during later sprints
- Final testing and validation before project presentation

---

## 12. Approval and Maintenance
This Test Plan is a **living document** and will be reviewed and updated as requirements, scope, sprint goals, and development progress evolve throughout the project lifecycle.

