# Test Scenarios (Sprint 1)

**Sprint:** 1 – Foundation & Architecture  
**Role:** Testing Lead (QA)  
**Purpose:** Define high-level system behaviors that must work for Orderly to be considered stable and testable.

---

## 1. Application Setup & Stability

**TS-01:** Verify the application starts without runtime errors.  
**TS-02:** Verify the frontend loads successfully in a supported browser.  
**TS-03:** Verify the backend service starts and remains running without crashing.  
**TS-04:** Verify no blocking console or server errors occur on initial load.  

---

## 2. Authentication & Session Management

**TS-05:** Verify a registered customer can log in using valid credentials.  
**TS-06:** Verify login fails with invalid credentials and displays an error message.  
**TS-07:** Verify an authenticated user can log out successfully.  
**TS-08:** Verify user session is cleared after logout.  
**TS-09:** Verify session behavior is consistent after a page refresh.

---

## 3. Authorization & Role-Based Access Control (RBAC)

**TS-10:** Verify unauthenticated users cannot access protected pages.  
**TS-11:** Verify customers cannot access admin-only features or routes.  
**TS-12:** Verify admins can access admin-only features.  
**TS-13:** Verify users are redirected appropriately when access is denied.  

---

## 4. Product Catalog / Menu Browsing

**TS-14:** Verify the product catalog loads and displays available items.  
**TS-15:** Verify product information (name, price) is displayed correctly.  
**TS-16:** Verify the catalog handles an empty product list gracefully.  
**TS-17:** Verify catalog behavior when data cannot be loaded.  

---

## 5. Order Creation & Submission (Thin Slice)

**TS-18:** Verify a customer can add an item to an order.  
**TS-19:** Verify a customer can update or remove items from an order.  
**TS-20:** Verify a customer can submit an order containing at least one item.  
**TS-21:** Verify an order cannot be submitted without any items.  
**TS-22:** Verify a confirmation message is shown after successful order submission.  

---

## 6. Inventory Management (Admin – Minimal)

**TS-23:** Verify an admin can view the inventory list.  
**TS-24:** Verify an admin can update inventory quantities.  
**TS-25:** Verify inventory quantities cannot be set to negative values.  
**TS-26:** Verify invalid inventory input is rejected with an error message.  

---

## 7. Input Validation & Error Handling

**TS-27:** Verify required input fields enforce validation rules.  
**TS-28:** Verify meaningful error messages are displayed for invalid actions.  
**TS-29:** Verify the system handles unexpected errors without crashing.  

---

## 8. Basic Usability & Responsiveness

**TS-30:** Verify the application is usable on desktop screen sizes.  
**TS-31:** Verify the application layout adapts to tablet and mobile screen sizes.  
**TS-32:** Verify navigation remains functional across different screen sizes.  

---

## 9. Security & Data Handling (Foundational)

**TS-33:** Verify sensitive actions require authentication.  
**TS-34:** Verify customers cannot modify admin-controlled data.  
**TS-35:** Verify user data is not exposed to unauthorized users.  

---

## 10. Sprint 1 Regression Coverage

The following scenarios will be revalidated before Sprint 1 review:
- TS-01 Application startup
- TS-05 Login success
- TS-10 Unauthorized access blocked
- TS-14 Catalog loads
- TS-20 Order submission
- TS-25 Inventory validation

---

## 11. Notes
- These scenarios define *what* must work, not *how* it is implemented.
- Detailed test cases will be created once features are implemented.
- Scenarios will be refined as requirements and acceptance criteria evolve.
