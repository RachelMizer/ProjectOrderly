# Seeding the Database

Three management commands are available to populate the local development database. Run them in order — each depends on the one before it.

## Prerequisites

- Virtual environment is active
- Database is created and migrations have been applied (`python manage.py migrate`)

All commands must be run from the `backend/` directory.

---

## 1. `seed_data`

Seeds the core dataset: users, suppliers, inventory, products, variants, modifiers, and store settings.

```bash
python manage.py seed_data
```

**Idempotent** — safe to run multiple times. Existing records are updated rather than duplicated.

### Seeded Accounts

| Username    | Password       | Role                              |
|-------------|----------------|-----------------------------------|
| `ramizer`   | `rmdevpass`    | Business / Superuser (dev account)|
| `business1` | `Password123!` | Business                          |
| `business2` | `Password123!` | Business                          |
| `business3` | `Password123!` | Business                          |
| `Rachel`    | `rmuserpass`   | Customer (personal account)       |
| `jortega`   | `Password123!` | Customer                          |
| `mpatel`    | `Password123!` | Customer                          |
| `anguyen`   | `Password123!` | Customer                          |
| `tbrooks`   | `Password123!` | Customer                          |
| `jkim`      | `Password123!` | Customer                          |
| `crivera`   | `Password123!` | Customer                          |
| `admin`     | `AdminPass123!`| Django Superuser                  |

### What Gets Seeded

- **Users** — 1 superuser, 1 dev account, 3 business users, 6 sample customers, 1 personal customer account
- **Suppliers** — 7 suppliers
- **Inventory** — ~35 items with stock quantities, units, and reorder levels
- **Categories** — Coffee, Tea, Bakery, Breakfast, Seasonal
- **Products** — 12 products with variants, modifier groups, modifier options, and inventory usage links
- **Product images** — copied from `frontend/public/img/` into the media directory
- **Store settings** — Quick Sip Cafe branding, colors, and contact details

### Options

```bash
python manage.py seed_data --seed 42
```

The `--seed` flag controls the random seed used for any randomized data. Default is `42`.

---

## 2. `seed_customers`

Seeds 100 additional bulk customer accounts with randomly generated Triangle-area NC profiles. Run after `seed_data`.

```bash
python manage.py seed_customers
```

All 100 accounts use the password `Password123!`. Usernames are generated from first and last name initials (e.g. `jsmith`). **Idempotent** — existing accounts are skipped.

### Options

```bash
python manage.py seed_customers --seed 2025   # default seed
python manage.py seed_customers --clear       # delete previously seeded bulk customers before re-seeding
```

---

## 3. `seed_orders`

Seeds 500–700 completed orders per month from August 2025 through the current date, distributed across all customer profiles. Requires both `seed_data` and `seed_customers` to have been run first.

```bash
python manage.py seed_orders
```

Orders are backdated and use realistic order templates with variants and modifiers. The Pumpkin Spice Latte only appears in orders from August through November. In the current month, approximately 20% of orders are left as Pending; all prior months are fully Completed.

### Options

```bash
python manage.py seed_orders --clear   # delete all existing orders before re-seeding
```
