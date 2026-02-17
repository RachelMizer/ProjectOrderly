# Orderly Backend — App Structure & Model Placement

This document defines the Django app boundaries for Orderly’s backend. The goal is to:
- keep responsibilities clear (frontend vs backend, domain boundaries),
- reduce merge conflicts,
- make migrations predictable,
- and help Sprint 3 developers know exactly where to add new features.

---

## App Overview (What each app owns)

### `accounts` (Identity, roles, auth workflows)
**Owns:**
- Authentication and authorization plumbing (JWT auth endpoints, login, logout, password reset)
- User role assignment (Customer vs Business User)
- Customer profile data (address/phone) tied to a Django User

**Does NOT own:**
- Orders, payments, catalog, inventory, suppliers, reporting

---

### `catalog` (What can be sold / browsed)
**Owns:**
- Product browsing structure and customizable offerings
- Categories, Products, Variants (SKUs), Modifier groups/options

**Does NOT own:**
- Inventory counts/usage (that belongs in `inventory`)
- Order-line items (belongs in `orders`)

---

### `inventory` (What gets stocked / consumed)
**Owns:**
- Inventory items (ingredients/components)
- How products/modifiers consume inventory (usage tables)
- Low-stock rules (reorder levels) and inventory adjustments (when implemented)

**Does NOT own:**
- Supplier purchasing records (belongs in `suppliers`)
- Customer-facing catalog structure (belongs in `catalog`)

---

### `orders` (Customer transactions)
**Owns:**
- Orders, OrderItems, selected modifiers per order item
- Payments associated with customer orders
- Guest checkout support (if enabled)

**Does NOT own:**
- Supplier purchasing orders (belongs in `suppliers`)
- Product definitions (belongs in `catalog`)

---

### `suppliers` (Vendor management and restocking)
**Owns:**
- Supplier vendor records
- Supplier restocking orders and line items (variants and inventory items)
- Payments to suppliers

**Does NOT own:**
- Inventory item definitions (belongs in `inventory`)
- Customer orders (belongs in `orders`)

---

### `reporting` (Admin dashboards, analytics, exports)
> NOTE: Do not name an app `admin` to avoid confusion with `django.contrib.admin`.

**Owns:**
- Reporting endpoints (sales reports, low-stock summaries, exports)
- Aggregations across orders, inventory, suppliers
- Admin-only reporting views/serializers/services

**Does NOT own:**
- Core data models like Order/Product/InventoryItem (those stay in their domain apps)

---

## Role Model (Customer vs Business User)

We have two roles:
- **Customer**: places orders
- **Business User**: manages catalog/inventory/orders/suppliers and views reporting

Implementation approach:
- Use Django’s built-in `User` model for identity.
- Use a profile model to store role.
- Use `is_staff` / `is_superuser` for Django admin access as needed.

---

## Model-to-App Placement

### `accounts`
- `UserProfile` *(recommended)*: `user (OneToOne)`, `role` (CUSTOMER/BUSINESS)
- `CustomerProfile` *(or `Customer`)*: address, phone, etc. (OneToOne with User)
- (Optional) `BusinessProfile`: only if business users need extra fields (store name, etc.)

### `catalog`
- `Category`
- `Product`
- `ProductVariant`
- `ModifierGroup`
- `ModifierOption`

### `inventory`
- `InventoryItem`
- `VariantInventoryUsage` (Variant -> InventoryItem + quantity)
- `ModifierInventoryUsage` (ModifierOption -> InventoryItem + quantity)

### `orders`
- `Order`
- `OrderItem`
- `OrderItemModifier`
- `Payment` (customer order payments)

### `suppliers`
- `Supplier`
- `SupplierOrder`
- `SupplierOrderVariantItem`
- `SupplierOrderInventoryItem`
- `SupplierPayment`

### `reporting`
- No core tables required initially (prefer read-only queries/aggregations)
- (Optional later) `ReportRun`, `ExportJob`, etc. if we need persistence for exports

---

## Cross-App Relationship Rules (to avoid circular imports)

- The app that “owns” the concept owns the model.
- Use string model references in relations when importing would create cycles:
  - `models.ForeignKey("catalog.ProductVariant", ...)`
  - `models.ForeignKey("inventory.InventoryItem", ...)`
  - `models.ForeignKey("accounts.CustomerProfile", ...)`

- Prefer `on_delete=models.PROTECT` for reference data that should not disappear:
  - Products referenced by orders
  - Inventory items referenced by usage tables

---

## Recommended `INSTALLED_APPS` order

Put Django contrib apps first, then third-party, then Orderly apps:

```python
INSTALLED_APPS = [
    # Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",

    # Local apps
    "accounts",
    "catalog",
    "inventory",
    "orders",
    "suppliers",
    "reporting",
]
