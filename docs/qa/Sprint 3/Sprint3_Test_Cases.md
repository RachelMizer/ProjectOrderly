# Sprint 3 Test Cases
Project: **Orderly**
Sprint: **Sprint 3 — Customer Ordering Experience**

---

## US3.1 — Product Browsing

### Test Case ID:
TC-3.1-01

### Feature:
Product Browsing

### User Story:
As a customer, I want to view a list of products with names, prices, and availability so that I can select items to order.

### Preconditions:


### Test Steps:


### Expected Result:


### Actual Result:


### Status:


### Notes:


---

## US3.2 — Shopping Cart System (Draft Order)

### Test Case ID:  
TC-3.2.2  

### Feature:  
Draft Order (Cart Management)  

### User Story:  
As a customer, I want to add, remove, and update quantities in my cart and have it saved automatically so I can prepare my order without losing my selections.  


### Preconditions:  
- User is logged in with a valid customer account  
- Second customer account exists for authorization testing  
- A user without a CustomerProfile exists  
- Product variants exist in the database (seed data loaded)  
- API is running and accessible  
- Authorization token is available  


### Test Steps:  

1. Send `POST /api/v1/orders/draft` with valid authentication  
2. Verify draft order is created  

3. Send `POST /api/v1/orders/draft` again  
4. Verify the same draft order is returned (no duplicate created)  

5. Send `POST /api/v1/orders/items` with valid `variantId` and quantity  
6. Verify item is added to the draft order  

7. Send `POST /api/v1/orders/items` again with the same `variantId`  
8. Verify quantity is merged into existing item  

9. Send `PATCH /api/v1/orders/items/{orderItemId}` with updated quantity  
10. Verify quantity updates correctly  

11. Send `PATCH /api/v1/orders/items/{orderItemId}` with quantity = 0  
12. Verify item is removed from cart  

13. Attempt `POST /api/v1/orders/draft` without authentication  
14. Verify request is rejected  

15. Attempt `POST /api/v1/orders/items` without authentication  
16. Verify request is rejected  

17. Attempt cart access with user without CustomerProfile  
18. Verify request is rejected with NOT_AUTHORIZED  

19. Send `POST /api/v1/orders/items` with invalid `variantId`  
20. Verify validation error is returned  

21. Send `POST /api/v1/orders/items` with invalid quantity (0)  
22. Verify validation error is returned  


### Expected Result:  

- Draft order is created and persists per customer  
- Only one active DRAFT order exists per customer  
- Items can be added to the cart  
- Adding the same variant updates quantity instead of creating duplicates  
- Quantities update correctly  
- Items are removed when quantity is set to zero  
- Unauthorized users cannot access or modify cart  
- Users without CustomerProfile cannot access cart  
- Invalid inputs return proper validation errors  
- Inventory quantities remain unchanged  
- Cart state persists across multiple requests  


### Actual Result:  

All operations executed successfully. Draft order creation, item addition, quantity updates, and item removal behaved as expected. Authorization and validation checks correctly blocked invalid and unauthorized requests. Cart persistence and quantity merging worked correctly. No issues observed during testing.  


### Evidence:  

![Draft Order Created](Screenshots/draft_order_created.jpg)

![One Active Draft Per Customer](Screenshots/one_active_draft_per_customer.jpg)

![Item Added](Screenshots/item_added.jpg)

![Item Added to Existing Draft](Screenshots/item_added_existing_draft.jpg)

![Invalid Variant](Screenshots/invalid_variant.jpg)

![Invalid Quantity](Screenshots/invalid_quantity.jpg)

![Draft Requires Authentication](Screenshots/draft_requires_authentication.jpg)

![Non-Customer Cannot Access Cart](Screenshots/noncustomer_cannot_access_cart.jpg)

![No User Cannot Add Item](Screenshots/nonuser_cannot_add_item.jpg)


### Status:  
Pass  


### Notes:  



---

## US3.3 — Order Submission (Checkout)

### Test Case ID:
TC-3.3-01

### Feature:
Order Submission

### User Story:
As a customer, I want to submit my order and see its current status so that I know when it is being prepared or completed.

### Preconditions:


### Test Steps:


### Expected Result:


### Actual Result:


### Status:


### Notes:


---

## US3.4 — Order Confirmation

### Test Case ID:
TC-3.4-01

### Feature:
Order Confirmation

### User Story:
As a customer, I want to see a confirmation screen with my receipt after placing an order so that I have immediate proof of my purchase.

### Preconditions:


### Test Steps:


### Expected Result:


### Actual Result:


### Status:


### Notes:


---

## US3.5 — Order History

### Test Case ID:
TC-3.5-01

### Feature:
Order History

### User Story:
As a customer, I want to view my previous orders so that I can reorder my favorites quickly.

### Preconditions:


### Test Steps:


### Expected Result:


### Actual Result:


### Status:


### Notes:


---

## US3.6.2 — User Profile Management

### Feature
Customer Profile Management

### User Story
As a customer, I want to update my profile information so that my contact details stay current.

### Endpoints Tested
- GET `/api/v1/users/me/`
- PATCH `/api/v1/users/me/`


### TC-3.6.2-01 – Authenticated User Can View Profile

### Preconditions
- Customer account exists
- User is authenticated
- CustomerProfile record exists

### Test Steps
1. Send GET request to `/api/v1/users/me/`
2. Include Authorization header

    Authorization: Bearer <access_token>

3. Submit request

### Expected Result
- API returns **200 OK**
- Response contains user profile information including:
  - first_name
  - last_name
  - email
  - phone
  - address fields

### Actual Result
Profile data returned successfully.

### Evidence
**View Profile Endpoint**  
![View Profile](Screenshots/3.6.2/user_can_view_profile.jpg)

### Status
Pass


### TC-3.6.2-02 – Unauthorized User Cannot View Profile

### Preconditions
- API server running

### Test Steps
1. Send GET request to `/api/v1/users/me/`
2. Do **not** include Authorization header

### Expected Result
- API returns **401 Unauthorized**

### Actual Result
Unauthorized access correctly rejected.

### Status
Pass

### TC-3.6.2-03 – User Can Update Name

### Preconditions
- Authenticated user
- Existing CustomerProfile record

### Test Steps
1. Send PATCH request to `/api/v1/users/me/`
2. Include Authorization header
3. Request body:

    {
      "firstName": "John",
      "lastName": "Doe"
    }

4. Submit request

### Expected Result
- API returns **200 OK**
- User name is updated

### Actual Result
Name updated successfully.

### Evidence
**Update Name**  
![Update Name](Screenshots/3.6.2/update_name.jpg)

### Status
Pass

### TC-3.6.2-04 – User Can Update Address

### Preconditions
- Authenticated user
- Existing CustomerProfile record

### Test Steps
1. Send PATCH request to `/api/v1/users/me/`
2. Include Authorization header
3. Request body:

    {
      "address": "123 Test Street"
    }

4. Submit request

### Expected Result
- API returns **200 OK**
- Address updated successfully

### Actual Result
Address updated successfully.

### Evidence
**Update Address**  
![Update Address](Screenshots/3.6.2/update_address.jpg)

### Status
Pass


### TC-3.6.2-05 – User Can Update Email

### Preconditions
- Authenticated user
- Existing CustomerProfile record

### Test Steps
1. Send PATCH request to `/api/v1/users/me/`
2. Include Authorization header
3. Request body:

    {
      "email": "newemail@test.com"
    }

4. Submit request

### Expected Result
- API returns **200 OK**
- Email updated successfully
- Email verification triggered if required

### Actual Result
Email updated successfully.

### Evidence
**Update Email**  
![Update Email](Screenshots/3.6.2/update_email.jpg)

### Status
Pass

### TC-3.6.2-06 – User Can Update Phone Number

### Preconditions
- Authenticated user
- Existing CustomerProfile record

### Test Steps
1. Send PATCH request to `/api/v1/users/me/`
2. Include Authorization header
3. Request body:

    {
      "phone": "9195551234"
    }

4. Submit request

### Expected Result
- API returns **200 OK**
- Phone number updated successfully

### Actual Result
Phone updated successfully.

### Evidence
**Update Phone**  
![Update Phone](Screenshots/3.6.2/update_phone.jpg)

### Status
Pass

### TC-3.6.2-07 – Partial Profile Update Works

### Preconditions
- Authenticated user

### Test Steps
1. Send PATCH request to `/api/v1/users/me/`
2. Include Authorization header
3. Request body:

    {
      "phone": "9195559999"
    }

### Expected Result
- API returns **200 OK**
- Only phone field updates
- Other profile fields remain unchanged

### Actual Result
Partial update works correctly.

### Evidence
**Partial Profile Update**  
![Partial Update](Screenshots/3.6.2/partial_update.jpg)

### Status
Pass

### TC-3.6.2-08 – Duplicate Email Validation

### Preconditions
- Two users exist in system

### Test Steps
1. Send PATCH request to `/api/v1/users/me/`
2. Attempt to update email to an existing user email

    {
      "email": "existing@email.com"
    }

### Expected Result
- API returns **400 Bad Request**
- Validation error indicating email already exists

### Actual Result
Duplicate email correctly rejected.

### Evidence
**Duplicate Email Validation**  
![Duplicate Email](Screenshots/3.6.2/duplicate_email.jpg)

### Status
Pass


### TC-3.6.2-09 – Invalid Phone Validation

### Test Steps
Send request body:

    {
      "phone": "abc123"
    }

### Expected Result
- API returns **400 Bad Request**
- Phone validation error

### Actual Result
Validation error returned correctly.

### Evidence
**Invalid Phone Input**  
![Invalid Phone](Screenshots/3.6.2/invalid_phone.jpg)

### Status
Pass

### TC-3.6.2-10 – Invalid State Validation

### Test Steps
Send request body:

    {
      "state": "North Carolina"
    }

### Expected Result
- API returns **400 Bad Request**
- Validation error indicating state must be two-letter code

### Actual Result
Validation error returned correctly.

### Evidence
**Invalid State Input**  
![Invalid State](Screenshots/3.6.2/invalid_state.jpg)

### Status
Pass

### TC-3.6.2-11 – Invalid Zipcode Validation

### Test Steps
Send request body:

    {
      "zipcode": "27"
    }

### Expected Result
- API returns **400 Bad Request**
- Validation error indicating invalid zipcode format

### Actual Result
Validation error returned correctly.

### Evidence
**Invalid Zipcode Input**  
![Invalid Zipcode](Screenshots/3.6.2/invalid_zipcode.jpg)

### Status
Pass

### Test Summary

| Test Case | Description | Result |
|----------|-------------|--------|
| TC-3.6.2-01 | View profile | Pass |
| TC-3.6.2-02 | Unauthorized access | Pass |
| TC-3.6.2-03 | Update name | Pass |
| TC-3.6.2-04 | Update address | Pass |
| TC-3.6.2-05 | Update email | Pass |
| TC-3.6.2-06 | Update phone | Pass |
| TC-3.6.2-07 | Partial update | Pass |
| TC-3.6.2-08 | Duplicate email validation | Pass |
| TC-3.6.2-09 | Invalid phone validation | Pass |
| TC-3.6.2-10 | Invalid state validation | Pass |
| TC-3.6.2-11 | Invalid zipcode validation | Pass |

### Overall Result
All acceptance criteria for **US3.6 – Customer Profile Update** were successfully validated.  
Profile viewing, profile updates, authentication protection, and input validation all function as expected.


---

## US3.7 — Order Item Customization (Modifiers)

### Test Case ID:
TC-3.7-01

### Feature:
Order Item Customization

### User Story:
As a customer, I want to customize items (extras or options) so that my order matches my preferences.

### Preconditions:


### Test Steps:


### Expected Result:


### Actual Result:


### Status:


### Notes:


---

## US3.8 — Seed Data (Products, Variants, Modifiers)

### Test Case ID:
TC-3.8-01

### Feature:
Seed Data & Content

### User Story:
As a developer, I want extended seed data so the team can develop and test Sprint 3 features against realistic content.

### Preconditions:
- Latest project code pulled from repository.
- Local development environment configured and virtual environment activated.
- Database migrations applied successfully.
- Local database reset or in a clean state before executing seed script.


### Test Steps:
1. Reset database to ensure reproducible seed execution.
2. Run the seed script using:

   python manage.py seed_data

3. Observe terminal output to confirm the script completes without errors.
4. Open Django shell and verify products were created:

   from catalog.models import Product
   Product.objects.count()

5. Verify product variants exist and contain populated SKU and unit price fields.

   from catalog.models import ProductVariant
   ProductVariant.objects.filter(product__name="Latte")

6. Verify modifier groups were created for variants.

   from catalog.models import ModifierGroup
   ModifierGroup.objects.count()

7. Verify modifier options exist with correct price adjustments.

   from catalog.models import ModifierOption
   ModifierOption.objects.filter(group__name="Milk Type")

8. Validate hierarchical relationships:

   Product → ProductVariant → ModifierGroup → ModifierOption

   Example queries:

   latte = Product.objects.get(name="Latte")
   latte.variants.all()

   v = latte.variants.first()
   v.modifier_groups.all()

   g = v.modifier_groups.first()
   g.options.all()

9. Reset the database again and rerun the seed script to confirm dataset reproducibility.

### Expected Result:

- Seed script executes successfully without runtime or database errors.
- Database is populated with realistic dataset including products, variants, and modifiers.
- Variants contain valid SKU and pricing values.
- Modifier groups and options exist and contain correct price adjustments.
- Relationships between products, variants, modifier groups, and options are valid.
- Seed script can be executed again from a clean database and reproduce the dataset.

### Actual Result:

Seed script executed successfully using `python manage.py seed_data`. Products, variants, modifier groups, and modifier options were created as expected. Field-level verification confirmed variants contained populated SKU and unit price values, and modifier options contained appropriate price adjustments. Relationship validation confirmed the hierarchy between Product, ProductVariant, ModifierGroup, and ModifierOption objects. The seed script was executed again after resetting the database and reproduced the dataset successfully.

### Evidence:

### Test Evidence

**Figure 1 – Seed Script Execution**
![Seed Script Run](screenshots/3.8/seed_script_run.jpg)

**Figure 2 – Products Verified**
![Verify Products](screenshots/3.8/verify_products.jpg)

**Figure 3 – Variants Exist**
![Verify Variants](screenshots/3.8/verify_variants_exist.jpg)

**Figure 4 – Product Variant Details**
![Verify Reproducibility](screenshots/3.8/verify_reproducibility.jpg)

**Figure 5 – Modifier Groups**
![Verify Modifier Groups](screenshots/3.8/verify_modifier_groups.jpg)

**Figure 6 – Modifier Options**
![Verify Modifier Options](screenshots/3.8/verify_modifier_options.jpg)

**Figure 7 – Relationship Validation**
![Validated Relationships](screenshots/3.8/Validated_relationships.jpg)

### Status:
PASS

### Notes:
Initial inspection queries displayed object string representations that did not include price fields due to the model `__str__` implementation. Additional queries were used to verify `unit_price` and `price_adjustment` fields directly. Duplicate modifier option names across variants are expected because modifier groups are created per variant in the seed dataset.