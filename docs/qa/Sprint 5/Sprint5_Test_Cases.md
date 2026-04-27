# Sprint 5 Test Cases
Project: **Orderly**  
Sprint: **Sprint 5 — Admin Operations, Reporting, Inventory & Fulfillment**

---

## US5.1 — Admin Navigation Shell & Layout

### Test Case ID
TC-5.1-01

### Feature
Admin Navigation Shell & Layout

### User Story
As a business admin, I want a persistent admin navigation menu with routes to all admin sections so that I can move between admin tools quickly.

### Preconditions
- Backend server running  
- Frontend running  
- BUSINESS user exists  
- CUSTOMER user exists  
- Roles seeded correctly  

### Test Steps
1. Log in as BUSINESS user  
2. Navigate to `/admin`  
3. Verify dashboard loads  
4. Confirm sidebar navigation is visible  
5. Navigate to Reports, Inventory, Product Catalog, and Orders  
6. Verify correct page loads for each route  
7. Verify layout persists across routes  
8. Log out and attempt admin route access  
9. Log in as CUSTOMER and attempt admin route access  

### Expected Result
- Admin routes accessible only to BUSINESS users  
- Admin layout persists across sections  
- Logged-out users redirect to login  
- CUSTOMER users blocked from admin routes  

### Actual Result
All admin navigation, route protection, and layout behaviors functioned as expected.

### Status
PASS

### Notes
Validated through manual testing, Jest coverage, and Robot automation.

---

## US5.2 — Product & Variant Management

### Test Case ID
TC-5.2-01

### Feature
Admin Product & Variant Management

### User Story
As a business admin, I want to create, edit, and delete products and variants so that the catalog reflects current offerings.

### Preconditions
- BUSINESS user authenticated  
- Product data seeded  
- Admin catalog accessible  
- Backend APIs available

### Test Steps
1. Open Product Catalog  
2. Create a product  
3. Verify product appears  
4. Edit product details  
5. Verify updates persist  
6. Add variant  
7. Update variant price/stock  
8. Delete variant  
9. Delete product  
10. Attempt invalid product submission  
11. Attempt invalid variant input  
12. Attempt access as CUSTOMER user  

### Expected Result
- Product CRUD succeeds  
- Variant CRUD succeeds  
- Invalid data rejected  
- Unauthorized users blocked  

### Actual Result
All product and variant management workflows passed successfully.

### Status
PASS

### Notes
Includes UI workflows, API validation, and RBAC verification.

---

## US5.3 — Inventory Management

### Test Case ID
TC-5.3-01

### Feature
Inventory Management

### User Story
As a business admin, I want to manage inventory levels so stock remains accurate.

### Preconditions
- Inventory data exists  
- Admin inventory page accessible  
- BUSINESS user logged in

### Test Steps
1. Open inventory page  
2. Verify ingredient-controlled section loads  
3. Verify count-based inventory loads  
4. Update stock quantity  
5. Save changes  
6. Confirm persistence after refresh  
7. Enter invalid negative stock value  
8. Verify validation blocks invalid data  
9. Create new inventory item  
10. Verify item appears immediately  
11. Attempt unauthorized access as CUSTOMER  

### Expected Result
- Inventory data loads correctly  
- Stock updates persist  
- Invalid input rejected  
- New items created successfully  
- Unauthorized access blocked

### Actual Result
Inventory workflows, validation, and authorization behaved correctly.

### Status
PASS

### Notes
Ingredient availability and count-based inventory behaviors validated.

---

## US5.4 — Sales Dashboard & Reporting

### Test Case ID
TC-5.4-01

### Feature
Sales Dashboard & Reporting

### User Story
As a business admin, I want a sales dashboard so I can monitor store performance.

### Preconditions
- Reporting endpoints available  
- BUSINESS user authenticated  
- Completed order data or empty-state scenario exists

### Test Steps
1. Open admin reports dashboard  
2. Verify dashboard loads  
3. Verify stat cards display  
4. Verify chart renders  
5. Use year filter  
6. Use month filter  
7. Use search input  
8. Clear filters  
9. Validate empty state behavior if no completed orders exist  
10. Attempt access as CUSTOMER user  

### Expected Result
- Dashboard loads without errors  
- Filters and search work  
- Empty states display correctly when needed  
- Unauthorized access blocked  

### Actual Result
Reporting dashboard and endpoint integration behaved correctly.

### Status
PASS

### Notes
Validated both data-driven and empty-state scenarios.

---

## US5.5 — Low Stock Indicators

### Test Case ID
TC-5.5-01

### Feature
Low Stock Indicators

### User Story
As a business admin, I want low stock items flagged so I can identify replenishment needs.

### Preconditions
- Inventory includes reorder levels  
- Low stock endpoint available  
- Admin inventory access available

### Test Steps
1. Open inventory page  
2. Verify low stock indicators appear when threshold met  
3. Verify out-of-stock items display correctly  
4. Verify healthy stock items are not flagged  
5. Validate low stock endpoint results  
6. Verify unauthorized users cannot access feature

### Expected Result
- Low stock correctly identified  
- Out-of-stock clearly indicated  
- Threshold logic behaves correctly  
- Unauthorized users blocked

### Actual Result
Low stock logic and UI indicators behaved as expected.

### Status
PASS

### Notes
Threshold logic validated as `stock_quantity <= reorder_level`.

---

## US5.9 — Admin Order Fulfillment

### Test Case ID
TC-5.9-01

### Feature
Admin Orders / Order Fulfillment

### User Story
As a business admin, I want to process customer orders so fulfillment can be managed.

### Preconditions
- Orders exist in non-DRAFT status  
- Admin orders page available  
- BUSINESS user authenticated

### Test Steps
1. Open admin orders page  
2. Verify order table loads  
3. Search orders  
4. Use status filters  
5. Open order detail  
6. Verify item details display  
7. Return to orders page  
8. Mark pending order complete  
9. Verify status changes to COMPLETED  
10. Attempt unauthorized access as CUSTOMER

### Expected Result
- Orders page loads correctly  
- Search and filters work  
- Order details display correctly  
- Pending orders can be completed  
- Unauthorized access blocked

### Actual Result
Admin order processing, detail view, and fulfillment flow passed.

### Status
PASS

### Notes
Serializer updates validated as part of testing.

---

## DC5.1 — API Contract Validation

### Test Case ID
TC-5.10-01

### Feature
API Contract Validation

### User Story
As a developer, I want the API contract aligned with implementation so frontend and backend remain consistent.

### Preconditions
- Sprint 5 endpoints implemented  
- API contract available  
- Backend tests passing

### Test Steps
1. Review product endpoints documentation  
2. Review variant endpoint documentation  
3. Review inventory endpoint documentation  
4. Review reporting endpoint documentation  
5. Review low-stock endpoint documentation  
6. Verify request/response structures match implementation  
7. Verify documented error handling matches behavior

### Expected Result
- Documentation matches implementation  
- Authentication and validation documented  
- No critical contract mismatches

### Actual Result
API contract aligned with implemented Sprint 5 endpoints.

### Status
PASS

### Notes
Supported frontend integration and final QA verification.

---

# Sprint 5 Test Summary

| Test Case | Description | Result |
|---|---|---|
| TC-5.1-01 | Admin Navigation Shell & Layout | Pass |
| TC-5.2-01 | Product & Variant Management | Pass |
| TC-5.3-01 | Inventory Management | Pass |
| TC-5.4-01 | Sales Dashboard & Reporting | Pass |
| TC-5.5-01 | Low Stock Indicators | Pass |
| TC-5.9-01 | Admin Order Fulfillment | Pass |
| TC-5.10-01 | API Contract Validation | Pass |

---

## Overall Result
All Sprint 5 acceptance criteria successfully validated through manual testing plus automated coverage (Pytest, Jest, Robot Framework).

**Sprint 5 QA Status:** PASS