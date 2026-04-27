# Sprint 4 Test Cases
Project: **Orderly**
Sprint: **Sprint 4 — Close the Customer Flow + Admin Foundation**

---

## US2.9 — User Interface for Registration and Login

### Test Case ID
TC-4.1-01

### Feature
Frontend Authentication

### User Story
As a user, I want to register, log in, reset my password, and remain authenticated so that I can securely use the application.

### Preconditions
- Backend server is running
- Frontend application is running
- Authentication endpoints are available
- Database is accessible

### Test Steps
1. Navigate to the registration page.
2. Verify registration form fields and submit button display.
3. Submit valid registration data.
4. Verify user account is created and token is stored.
5. Navigate to login page.
6. Submit valid login credentials.
7. Verify authentication state updates.
8. Submit invalid login credentials.
9. Verify error message displays.
10. Navigate to password reset request page.
11. Submit valid email.
12. Navigate to password reset confirm page.
13. Submit valid reset token and new password.
14. Log out.
15. Verify refresh token cookie clears and user returns to unauthenticated state.
16. Refresh page and verify authentication persistence when token exists.

### Expected Result
- Registration, login, password reset, and logout forms render correctly.
- Valid registration and login work successfully.
- Invalid login attempts display errors.
- Password reset request and confirmation work.
- Authentication state persists correctly.
- Logout clears authentication state.

### Actual Result
All authentication forms, validation, API integration, token handling, password reset workflows, logout behavior, and persistence behaved as expected.

### Status
PASS

### Notes
Validated through manual testing and automated frontend tests.

---

## US3.1.1 — Browse Products UI

### Test Case ID
TC-4.2-01

### Feature
Product Browsing UI

### User Story
As a customer, I want to browse products with prices, variants, and availability so that I can choose items to order.

### Preconditions
- Frontend application is running
- Backend product API is available
- Products, categories, and variants are seeded

### Test Steps
1. Navigate to storefront.
2. Verify product grid loads.
3. Confirm product cards display name, variant dropdown, price, and availability.
4. Select a different variant.
5. Verify price updates.
6. Confirm in-stock variants show quantity controls.
7. Confirm out-of-stock variants show out-of-stock message.
8. Use category filter.
9. Verify product list updates.
10. Click View Details.
11. Verify navigation to product detail page.

### Expected Result
- Storefront renders product grid successfully.
- Product cards show required information.
- Variant selection updates price and details.
- Category filtering works.
- Product detail navigation works.

### Actual Result
Product browsing UI loaded successfully, displayed correct product data, handled variant pricing, filtered by category, and navigated to product details correctly.

### Status
PASS

### Notes
Validated through manual testing, Jest, and Robot Framework.

---

## US3.1.2 — Product Browsing API

### Test Case ID
TC-4.3-01

### Feature
Product Browsing API

### User Story
As a customer, I want product data returned from the API so that the storefront can display available products accurately.

### Preconditions
- Backend server is running
- Database is seeded with products, variants, and categories

### Test Steps
1. Send GET request to `/api/v1/products`.
2. Verify response returns 200 OK.
3. Confirm paginated response structure.
4. Verify required product fields are present.
5. Test default pagination.
6. Filter by category using `categoryId`.
7. Verify products are alphabetical.
8. Verify `minPrice` reflects lowest variant price.
9. Test custom page and pageSize values.
10. Verify empty dataset behavior.

### Expected Result
- API returns valid paginated product data.
- Filtering and pagination work correctly.
- Product fields match API contract.
- Empty datasets return clean responses.

### Actual Result
Product API met all acceptance criteria for structure, filtering, pagination, sorting, field mapping, and empty-state behavior.

### Status
PASS

### Notes
Validated through manual API testing and pytest.

---

## US3.2.1 — Cart Management UI and Modifier Display

### Test Case ID
TC-4.4-01

### Feature
Shopping Cart UI

### User Story
As a customer, I want to view and manage items in my cart so I can review my order before checkout.

### Preconditions
- User is logged in
- Product with modifiers exists
- Cart API is available
- Frontend cart page is accessible

### Test Steps
1. Add customized product to cart.
2. Navigate to cart page.
3. Verify cart displays product name, quantity, and pricing.
4. Verify selected modifiers display under item.
5. Confirm modifier pricing appears in item total.
6. Increase item quantity.
7. Decrease item quantity.
8. Verify subtotal, tax, and grand total update.
9. Delete an item.
10. Use Empty Cart button.
11. Refresh page and verify cart persistence.

### Expected Result
- Cart displays items, modifiers, quantities, and totals.
- Quantity changes update totals.
- Delete and empty cart actions work.
- Cart persists after refresh.
- Empty and populated states display correctly.

### Actual Result
Cart management, modifier display, pricing, quantity updates, deletion, empty cart behavior, and persistence worked correctly.

### Status
PASS

### Notes
Validated through manual testing and automated tests.

---

## US3.3.2 — Finalize DRAFT Order API

### Test Case ID
TC-4.5-01

### Feature
Order Submission API

### User Story
As a customer, I want to submit my draft order so that it can move into preparation.

### Preconditions
- Authenticated customer exists
- Customer has DRAFT order
- Draft order contains at least one item
- Submit order endpoint is available

### Test Steps
1. Submit valid draft order using `/api/v1/orders/{orderId}/submit`.
2. Verify status changes from DRAFT to PENDING.
3. Submit empty order.
4. Verify 400 INVALID_INPUT response.
5. Submit order missing paymentType.
6. Verify validation error.
7. Submit order with unavailable item.
8. Verify invalid input error.
9. Attempt to submit another user’s order.
10. Verify 403 NOT_AUTHORIZED.
11. Attempt unauthenticated submission.
12. Verify 401 response.
13. Attempt to submit non-DRAFT order.
14. Verify error response.
15. Confirm failed submissions do not alter order status.

### Expected Result
- Valid draft order submits successfully.
- Invalid, empty, unauthorized, unauthenticated, or non-DRAFT submissions fail correctly.
- Failed submissions leave order in DRAFT status.

### Actual Result
Order submission API behaved correctly across valid submission, validation errors, authorization checks, and failed submission scenarios.

### Status
PASS

### Notes
Validated through PowerShell/manual API testing and pytest.

---

## US3.3.1 — Order Submission UI

### Test Case ID
TC-4.6-01

### Feature
Checkout Page

### User Story
As a customer, I want to review my cart and submit my order from checkout.

### Preconditions
- User is logged in
- Cart contains at least one item
- Submit order API is available
- Checkout page is accessible

### Test Steps
1. Navigate from cart to checkout.
2. Verify checkout page loads.
3. Confirm draft order items display with variants, quantities, and modifiers.
4. Verify subtotal, tax, and total display.
5. Confirm required customer input fields display.
6. Select Credit Card payment type.
7. Verify card field appears.
8. Select Other payment type.
9. Verify custom input appears.
10. Submit valid checkout form.
11. Verify backend submit call succeeds.
12. Verify redirect to order confirmation/detail page.
13. Confirm cart clears after submission.
14. Attempt submission with missing required fields.

### Expected Result
- Checkout page displays order review, totals, payment fields, and customer fields.
- Valid submission succeeds and redirects.
- Cart clears after successful order.
- Invalid submission is blocked.

### Actual Result
Checkout flow worked correctly across item display, payment handling, validation, submission, redirect, and cart clearing.

### Status
PASS

### Notes
Validated through manual testing and automated frontend/E2E tests.

---

## US3.4.1 — Order Confirmation Page

### Test Case ID
TC-4.7-01

### Feature
Order Confirmation UI

### User Story
As a customer, I want to see confirmation details after placing an order so I have proof of purchase.

### Preconditions
- User is logged in
- User has at least one submitted order
- Order detail endpoint is available

### Test Steps
1. Navigate to Order History.
2. Click an order.
3. Verify route changes to `/orders/{orderId}`.
4. Confirm confirmation page loads.
5. Verify Order ID, date, status, items, tax, and total display.
6. Confirm item-level product name, quantity, unit price, and item total display.
7. Verify data matches API response.

### Expected Result
- Order detail/confirmation page displays receipt details correctly.
- Navigation from Order History works.
- Page renders without errors.

### Actual Result
Order confirmation page displayed receipt data correctly and loaded successfully through Order History navigation.

### Status
PASS

### Notes
Direct post-submit redirect was noted as limited at the time; confirmation was validated through Order History.

---

## US3.4.2 — Order Status and Receipt API

### Test Case ID
TC-4.8-01

### Feature
Order Status and Receipt API

### User Story
As a customer, I want to retrieve my order status and receipt details.

### Preconditions
- Authenticated customer exists
- Submitted order exists
- Status and receipt endpoints are available

### Test Steps
1. Send GET request to `/api/v1/orders/{orderId}/status`.
2. Verify only status field returns.
3. Send GET request to `/api/v1/orders/{orderId}`.
4. Verify full order receipt fields return.
5. Confirm camelCase response format.
6. Attempt non-owner access.
7. Verify 403 NOT_AUTHORIZED.
8. Request non-existent order.
9. Verify 404 response.
10. Attempt unauthenticated access.
11. Verify 401 response.
12. Attempt unsupported HTTP method.
13. Verify 405 response.

### Expected Result
- Status endpoint returns status only.
- Receipt endpoint returns full details.
- Ownership and authentication are enforced.
- Invalid access and unsupported methods return correct errors.

### Actual Result
Order status and receipt APIs worked correctly across valid and invalid access scenarios.

### Status
PASS

### Notes
Validated through manual API testing and automated tests.

---

## US3.5.1 — Display Past Orders

### Test Case ID
TC-4.9-01

### Feature
Order History UI

### User Story
As a customer, I want to view my past orders so I can review previous purchases.

### Preconditions
- User is logged in
- User has past non-DRAFT orders or empty state scenario exists
- Order history endpoint is available

### Test Steps
1. Navigate to `/order-history`.
2. Verify page loads.
3. Confirm order list displays when orders exist.
4. Verify order ID, status, and total display.
5. Confirm DRAFT orders are excluded.
6. Click an order.
7. Verify navigation to order detail page.
8. Verify order detail displays items, modifiers, tax, and total.
9. Test pagination controls.
10. Verify empty state when no past orders exist.
11. Verify error handling if API fails.

### Expected Result
- Order History page displays previous orders accurately.
- Draft orders are excluded.
- Pagination works.
- Empty and error states display correctly.

### Actual Result
Order History UI displayed past orders correctly, handled pagination, supported detail navigation, and displayed empty/error states correctly.

### Status
PASS

### Notes
Validated through manual testing and automated frontend/E2E tests.

---

## US3.5.2 — Order History API

### Test Case ID
TC-4.10-01

### Feature
Order History API

### User Story
As a customer, I want the API to return only my past orders.

### Preconditions
- Authenticated customer exists
- Multiple orders exist
- Order history endpoint is available

### Test Steps
1. Send GET request to `/api/v1/orders/me`.
2. Verify 200 OK.
3. Confirm paginated structure.
4. Verify required fields are present.
5. Confirm only logged-in user orders return.
6. Confirm DRAFT orders are excluded.
7. Verify newest-first sorting.
8. Test pagination parameters.
9. Test invalid pagination inputs.
10. Verify unauthenticated request returns 401.
11. Verify user without CustomerProfile is restricted.
12. Verify empty dataset returns count 0 and empty results.

### Expected Result
- API returns only authenticated user’s non-DRAFT orders.
- Pagination and sorting work.
- Error cases are handled correctly.

### Actual Result
Order History API met all acceptance criteria for ownership, draft exclusion, sorting, pagination, and error handling.

### Status
PASS

### Notes
Validated through manual API testing and pytest.

---

## US3.6.1 — Profile Editing

### Test Case ID
TC-4.11-01

### Feature
Profile Page

### User Story
As a customer, I want to view and update my profile information.

### Preconditions
- User is logged in
- Profile API is available
- User has profile data

### Test Steps
1. Navigate to `/profile`.
2. Verify profile page loads.
3. Confirm Profile link only appears when logged in.
4. Verify profile data loads from API.
5. Confirm fields populate correctly.
6. Verify email field is disabled.
7. Update editable fields.
8. Save profile.
9. Verify success message appears.
10. Refresh page.
11. Confirm updates persist.
12. Test backend validation errors.
13. Test unauthorized access behavior.

### Expected Result
- Profile data loads correctly.
- Editable fields can be updated.
- Email is displayed but disabled.
- Updates persist.
- Success and error messages display correctly.

### Actual Result
Profile page loaded, updated, persisted, and handled success/error states correctly.

### Status
PASS

### Notes
Validated through manual testing and automated component/API integration tests.

---

## US3.7.1 — Product Customization UI

### Test Case ID
TC-4.12-01

### Feature
Product Customization

### User Story
As a customer, I want to customize products using variants and modifiers.

### Preconditions
- Product with modifiers exists
- Modifier API is available
- User can access product detail page

### Test Steps
1. Navigate to storefront.
2. Click View Details on product with modifiers.
3. Verify product detail page loads.
4. Verify product name, variants, and base price display.
5. Change variant.
6. Verify modifier groups update.
7. Select radio modifier option.
8. Select checkbox modifier options.
9. Attempt to exceed max selection.
10. Verify extra options disable.
11. Confirm total price updates.
12. Verify required modifier group displays.
13. Verify out-of-stock behavior.

### Expected Result
- Product customization page displays variants and modifiers.
- Modifier selection rules are enforced.
- Price updates correctly.
- Out-of-stock products restrict cart interaction.

### Actual Result
Customization page behaved correctly across variant switching, modifier rendering, constraints, and pricing updates.

### Status
PASS

### Notes
Validated through manual testing, Jest, and Robot Framework.

---

## US3.7.2 — Retrieve Modifier Information for a Variant

### Test Case ID
TC-4.13-01

### Feature
Modifier Retrieval API

### User Story
As a customer, I want modifier data for a selected variant so customization options display correctly.

### Preconditions
- Product and variant exist
- Modifier groups and options exist
- Modifier endpoint is available

### Test Steps
1. Send GET request to `/api/v1/products/{productId}/variants/{variantId}/modifiers`.
2. Verify 200 OK.
3. Confirm response includes count and groups.
4. Verify groups include id, name, required, minSelections, maxSelections, count, and options.
5. Verify options include id, name, priceAdjustment, and imageUrl.
6. Test variant with no modifiers.
7. Verify count 0 and groups empty.
8. Test invalid variant ID.
9. Test product/variant mismatch.

### Expected Result
- Endpoint returns valid modifier groups and options.
- Variants with no modifiers return empty groups.
- Invalid IDs and mismatched relationships return 404.

### Actual Result
Modifier retrieval endpoint returned correct structure, relationships, and error responses.

### Status
PASS

### Notes
Validated through Postman/manual API testing and automated tests.

---

## US3.7.3 / US3.7.4 — Order Item Modifiers API

### Test Case ID
TC-4.14-01

### Feature
Cart Customization API

### User Story
As a customer, I want selected modifiers saved with my cart item.

### Preconditions
- User is logged in
- Draft order exists
- Order item exists
- Modifiers exist for selected variant

### Test Steps
1. Add modifier to order item.
2. Verify OrderItemModifier record is created.
3. Confirm modifier links to correct order item.
4. Verify price adjustment is stored.
5. Submit invalid modifier ID.
6. Verify INVALID_INPUT.
7. Add modifier from mismatched product/variant.
8. Verify request is rejected.
9. Attempt unauthorized modifier update.
10. Verify NOT_AUTHORIZED.
11. Attempt modifier change on non-DRAFT order.
12. Verify request is rejected.
13. Update modifier quantity.
14. Verify totals recalculate.
15. Set modifier quantity to 0.
16. Verify modifier is removed.
17. Submit negative quantity.
18. Verify validation error.

### Expected Result
- Modifiers can be added, updated, and removed for draft order items.
- Totals recalculate correctly.
- Ownership, draft restrictions, and max selection constraints are enforced.
- Invalid inputs are rejected.

### Actual Result
Order item modifier API behaved correctly across creation, updates, removal, validation, and authorization scenarios.

### Status
PASS

### Notes
Validated through manual API testing and automated tests.

---

## US4.1.2 — Role-Based Access Control for Admin Endpoints

### Test Case ID
TC-4.15-01

### Feature
Admin Endpoint RBAC

### User Story
As a business admin, I want admin endpoints restricted so only authorized business users can access admin functionality.

### Preconditions
- BUSINESS user exists
- CUSTOMER user exists
- Admin endpoints exist
- Auth tokens are available

### Test Steps
1. Send unauthenticated requests to admin endpoints.
2. Verify 401 Unauthorized.
3. Send CUSTOMER requests to admin endpoints.
4. Verify 403 Forbidden.
5. Confirm error format:
   `{ "error": "INVALID_ROLE", "message": "user does not have this permission" }`
6. Test GET, POST, PATCH, and DELETE routes.
7. Confirm permission checks happen before validation.
8. Send invalid POST as CUSTOMER.
9. Verify 403, not 400.
10. Send requests as user without role.
11. Verify 403.
12. Send valid requests as BUSINESS user.
13. Verify successful CRUD access.
14. Confirm database updates persist.

### Expected Result
- Only BUSINESS users can access admin endpoints.
- CUSTOMER and no-role users receive 403.
- Unauthenticated users receive 401.
- Error response matches API contract.
- Business users can complete valid admin actions.

### Actual Result
RBAC enforcement worked correctly across all tested admin routes and HTTP methods.

### Status
PASS

### Notes
Validated through manual API testing and pytest.

---

# Sprint 4 Test Summary

| Test Case | Description | Result |
|---|---|---|
| TC-4.1-01 | Frontend Authentication | Pass |
| TC-4.2-01 | Browse Products UI | Pass |
| TC-4.3-01 | Product Browsing API | Pass |
| TC-4.4-01 | Cart Management UI and Modifier Display | Pass |
| TC-4.5-01 | Finalize DRAFT Order API | Pass |
| TC-4.6-01 | Order Submission UI | Pass |
| TC-4.7-01 | Order Confirmation Page | Pass |
| TC-4.8-01 | Order Status and Receipt API | Pass |
| TC-4.9-01 | Display Past Orders | Pass |
| TC-4.10-01 | Order History API | Pass |
| TC-4.11-01 | Profile Editing | Pass |
| TC-4.12-01 | Product Customization UI | Pass |
| TC-4.13-01 | Modifier Retrieval API | Pass |
| TC-4.14-01 | Order Item Modifiers API | Pass |
| TC-4.15-01 | Admin Endpoint RBAC | Pass |

---

## Overall Result

All Sprint 4 tested features met acceptance criteria through manual testing, backend pytest, frontend Jest, and Robot Framework automation.

**Sprint 4 QA Status:** PASS