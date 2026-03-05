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

Customer Functionality
- Product browsing and catalog display
- Order creation, customization, and submission
- Shopping cart functionality
- Order confirmation and receipt display
- Order history retrieval
- Basic input validation and error handling
- Responsive behavior across desktop, tablet, and mobile screen sizes

Business / Admin Functionality
- Product and menu management
- Inventory management and stock updates
- Low-stock notifications or indicators (if implemented)
- Basic sales summary reporting
- Prototype supplier order management workflows
- Restricted access to admin-only features

System & Security
- User authentication and session handling
- Role-based access control (Customer vs Business)
- Protected routes and secure API access patterns
- Session expiration behavior (if implemented)
- Simulated payment processing flow
- Basic usability, navigation, and validation messaging

### 3.2 Core End-to-End Workflow Validation

Testing will validate the primary customer ordering workflow:

1. Browse products
2. Select product variant
3. Customize item with modifiers
4. Add item to cart
5. Modify quantities or remove items
6. Submit order at checkout
7. View order confirmation
8. View order history

---

## 3.3 Out of Scope

The following items are explicitly excluded from testing for this project phase:

- Integration with real payment gateways (Stripe, PayPal)
- Load or stress testing at production scale
- Native mobile application testing
- Advanced analytics or AI-based recommendations
- External POS integrations
- Real supplier API integrations
- Multi-language or multi-currency support

---

## 4. Test Approach

### 4.1 Testing Methodology

Testing will follow an **Agile iterative SCRUM approach** aligned with sprint development.

Test scenarios and test cases will be created alongside backlog items and refined as features evolve. Testing will begin as soon as features become testable and continue throughout each sprint.

### 4.2 Test Types

Manual Functional Testing
- Primary testing method for validating user-facing features and business workflows.

Smoke Testing
- Performed after new builds to ensure the system is stable enough for deeper testing.

Regression Testing
- Performed after code changes to ensure existing functionality continues to work.

Exploratory Testing
- Conducted during sprint demos and QA review sessions to uncover unexpected issues.

API Endpoint Testing
- Backend REST endpoints will be tested using Postman or PowerShell.
- Responses will be validated for:
  - Correct HTTP status codes
  - Correct JSON structure
  - Validation rules
  - Authentication requirements

End-to-End Workflow Testing
- Full user workflows will be validated through both API and UI interaction.

---

## 5. Test Environment

Testing will be conducted in a simulated development environment using:

- Local development servers
- Django REST backend
- MySQL database
- Seeded test data for users, products, and orders
- Web browsers:
  - Chrome (primary)
  - Edge (secondary)
- API testing tools:
  - Postman
  - PowerShell REST commands
- Simulated payment workflows

The system will run locally using the Django development server.

No production environment will be used.

---

## 6. Roles and Responsibilities

Testing Lead / QA
- Define and maintain the test plan
- Create sprint test cases and testing matrices
- Execute manual testing
- Log, track, and verify defects
- Report testing status during stand-ups and sprint reviews

Developers
- Implement features and resolve reported defects
- Support defect investigation
- Notify QA when features are ready for testing

Scrum Master
- Ensure testing activities are included in sprint planning
- Track testing progress and blockers
- Facilitate communication between QA and development

Team Members
- Participate in exploratory testing during sprint reviews
- Assist with validation when additional testing capacity is needed

---

## 7. Test Deliverables

Project-Level Artifacts
- Test Plan document

Sprint-Level Artifacts
- Sprint test cases
- Sprint testing matrices
- Sprint testing execution summaries

Examples:

- Sprint2_Test_Cases.md
- Sprint2_Testing_Matrix.md
- Sprint3_Test_Cases.md
- Sprint3_Testing_Matrix.md

Defect Tracking
- Defect reports logged on Trello cards
- Retesting results documented in test cases

---

## 8. Entry and Exit Criteria

### 8.1 Entry Criteria

Testing may begin when:

- Feature implementation is available in the development environment
- Acceptance criteria are defined
- Required seed or test data is available

### 8.2 Exit Criteria

A feature is considered test-complete when:

- All acceptance criteria are verified
- Critical or high severity defects are resolved or documented
- Feature is stable and demo-ready
- Test results are recorded

---

## 9. Defect Management

Defects will be tracked using the team's Trello board.

Each defect report will include:

- Summary and description
- Steps to reproduce
- Expected vs actual results
- Severity level
- Current status

Severity Levels

Critical
- System crash
- Data loss
- Core workflow blocked

High
- Major functionality does not work correctly

Medium
- Feature works but has incorrect behavior

Low
- Cosmetic or minor UI issues

---

## 10. Risks and Mitigation

| Risk | Mitigation |
|-----|-----------|
| Incomplete or evolving requirements | Clarify during sprint planning |
| Limited testing time | Prioritize Must requirements and core workflows |
| Late feature changes | Perform focused regression testing |
| Environment instability | Maintain consistent setup and documentation |
| Over-scoping features | Align testing to defined sprint scope |

---

## 11. Future Testing Coverage

The following features may be tested in future sprints if implemented:

- Email verification for new accounts
- Password reset functionality
- CSV import/export features
- Report export options
- Accessibility improvements
- Advanced reporting dashboards

---

## 12. Test Schedule

Testing activities align with the sprint schedule:

- Test cases drafted during sprint planning
- Continuous testing during development
- Testing status reviewed before sprint demos
- Regression testing during later sprints
- Final validation before project presentation

---

## 13. Approval and Maintenance

This Test Plan is a living document and will be updated as project scope, sprint goals, and development progress evolve.
