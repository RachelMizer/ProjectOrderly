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

These accounts are created by `seed_data`. Note: the live database contains additional manually created accounts (see [Live Database Accounts](#live-database-accounts) below).

| Username      | Password          | Role                                |
|---------------|-------------------|-------------------------------------|
| `admin`       | `AdminPass123!`   | Django Superuser (no role)          |
| `ramizer`     | `rmdevpass`       | Executive / Superuser (dev account) |
| `execuser`    | `ExecPass123!`    | Executive                           |
| `supportuser` | `SupportPass123!` | Support                             |
| `Rachel`      | `rmuserpass`      | Customer (personal account)         |
| `jortega`     | `Password123!`    | Customer                            |
| `mpatel`      | `Password123!`    | Customer                            |
| `anguyen`     | `Password123!`    | Customer                            |
| `tbrooks`     | `Password123!`    | Customer                            |
| `jkim`        | `Password123!`    | Customer                            |
| `crivera`     | `Password123!`    | Customer                            |

### What Gets Seeded

- **Users** — 1 Django superuser, 1 dev account (executive + superuser), 1 executive, 1 support, 6 sample customers, 1 personal customer account
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

---

## Live Database Accounts

The following accounts exist in the production database but are **not created by the seed commands** — they were created manually. Passwords were set at account creation and are not stored here. If access is lost, reset via the Django admin panel or management shell.

### Executive

| Username       | Email                    | Name         |
|----------------|--------------------------|--------------|
| `ramizer`      | ramizer@my.waketech.edu  | Rachel Mizer (dev / superuser) |
| `exec_kgamble` | exec_kgamble@mail.com    | Keith Gamble |

### Support

| Username       | Email                  | Name           |
|----------------|------------------------|----------------|
| `rmsupport`    | rmsupport@mail.com     | Rachel Mizer   |
| `jmsupport`    | jmsupport@mail.com     | James Mizer    |
| `pjsupport`    | pjsupport@mail.com     | Phillip Jarrow |
| `supp_kgamble` | supp_kgamble@mail.com  | Keith Gamble   |

### Store Managers

| Username      | Email                        | Name         | Store               |
|---------------|------------------------------|--------------|---------------------|
| `lharmon_ral` | lharmon_ral@quicksip.com     | Lisa Harmon  | #1 Downtown Raleigh |
| `mtate_cary`  | mtate_cary@quicksip.com      | Marcus Tate  | #2 North Cary       |
| `sowens_gsb`  | sowens_gsb@quicksip.com      | Sandra Owens | #3 Greensboro Downtown |
| `mgr_kgamble` | mgr_kgamble@mail.com         | Keith Gamble | #1 Downtown Raleigh |

### Employees

Employees use the naming convention `firstinitiallastname_locationcode` with company emails `@quicksip.com`.

**Store #1 — Downtown Raleigh** (6 employees)

| Username     | Name           |
|--------------|----------------|
| `mwebb_ral`  | Marcus Webb    |
| `jtorres_ral`| Jasmine Torres |
| `dclark_ral` | Devon Clark    |
| `pshah_ral`  | Priya Shah     |
| `tbrooks_ral`| Tyler Brooks   |
| `aosei_ral`  | Amara Osei     |

**Store #2 — North Cary** (7 employees)

| Username      | Name           |
|---------------|----------------|
| `iford_cary`  | Isaiah Ford    |
| `sreyes_cary` | Sofia Reyes    |
| `cwalsh_cary` | Connor Walsh   |
| `ajames_cary` | Aaliyah James  |
| `bmoss_cary`  | Brendan Moss   |
| `lpierce_cary`| Logan Pierce   |
| `nchen_cary`  | Natalie Chen   |

**Store #3 — Greensboro Downtown** (8 employees)

| Username       | Name           |
|----------------|----------------|
| `enakamura_gsb`| Eli Nakamura   |
| `dprice_gsb`   | Destiny Price  |
| `cmendez_gsb`  | Carlos Mendez  |
| `kbrown_gsb`   | Keisha Brown   |
| `hgrant_gsb`   | Hailey Grant   |
| `dking_gsb`    | Darnell King   |
| `mhoffman_gsb` | Mia Hoffman    |
| `zrivera_gsb`  | Zack Rivera    |

### Customers

107 customer accounts total:
- 7 created by `seed_data` (6 sample + 1 personal — see table above)
- 100 created by `seed_customers` (all use `Password123!`)
