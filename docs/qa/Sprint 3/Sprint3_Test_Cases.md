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
TC-3.2-01

### Feature:
Shopping Cart System

### User Story:
As a customer, I want to add, remove, and update quantities in my cart and have it saved automatically so I can prepare my order without losing my selections.

### Preconditions:


### Test Steps:


### Expected Result:


### Actual Result:


### Status:


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

## US3.6 — User Profile Management

### Test Case ID:
TC-3.6-01

### Feature:
User Profile Management

### User Story:
As a customer, I want to update my profile information so that my contact details stay current.

### Preconditions:


### Test Steps:


### Expected Result:


### Actual Result:


### Status:


### Notes:


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