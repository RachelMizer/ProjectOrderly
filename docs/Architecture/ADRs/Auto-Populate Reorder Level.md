# Title: Auto-Populate Reorder Level from Stock Quantity (REVERTED)
---
## Context:

Inventory items and product variants have two stock-related fields: `stock_quantity` (current units on hand) and `reorder_level` (the threshold at which a low stock alert is triggered). Previously, `reorder_level` was a blank field on creation — the business user had to manually enter a value, or the low stock indicator would never fire for that item.

In practice, this meant new items were silently unmonitored unless the user remembered to set a reorder level, and there was no guidance on what value to use.

Additionally, a key operational constraint shaped this decision: stock counts in Orderly are managed manually by the business user, not decremented automatically by customer orders. This is intentional — real-world usage (e.g., a staff member using more of an ingredient than a recipe specifies, or a training error) means actual stock on hand can drift significantly from what order records would predict. Because of this, tying reorder level to order history or sales velocity would produce unreliable thresholds. The only trustworthy reference point is the physical count the manager enters directly.

---
## Decision

When a business user enters a `stock_quantity` while creating a new inventory item or product variant, the `reorder_level` field is automatically pre-populated at **25% of the entered stock quantity** (rounded to the nearest whole number). The user can override this value at any time before or after saving.

This applies to:
- New inventory item creation form (`AdminInventoryPage.jsx`)
- New product variant creation form (`AdminProductsPage.jsx`)

The auto-population only fires when `reorder_level` has not already been manually set by the user. If the user has typed a value into `reorder_level` directly, it is not overwritten when `stock_quantity` changes.

The 25% threshold means: alert when 75% of the initial stock has been consumed.

---
## Why?

- **Reorder level is a business judgment, not a derived metric.** A café manager knows their supplier lead times, shelf life of ingredients, and acceptable buffer. A formula cannot capture this — but a sensible default reduces the friction of getting started.
- **Stock is manually managed.** Because Orderly does not auto-decrement stock on order completion, basing reorder level on sales data would be unreliable. Staff errors, training incidents, spoilage, and manual corrections all affect real stock counts without appearing in order records.
- **25% is a reasonable middle ground** for a café context — it gives enough runway to reorder before running out without being so conservative that alerts fire constantly.
- **The field remains fully editable.** This is a UI convenience, not a system constraint. Managers retain full control and can set any value that reflects their operational reality.

---
## Reversal Note

This feature was subsequently removed. Auto-population introduced a disconnect between what the manager set and what the system used — specifically, the 25% default could silently produce a reorder level that didn't reflect actual operational needs (lead times, shelf life, supplier reliability). The reorder level is now a fully manual field on both the inventory item and variant creation forms, keeping the manager in full control with no system-derived defaults.

---
## Consequences

- New items created with a stock quantity will have a reorder level pre-filled, making low stock monitoring active by default rather than opt-in.
- Existing items in the database are unaffected — this only applies at creation time in the UI.
- The reorder level does not update automatically when stock is edited later (e.g., after a restock). Managers should review reorder levels when significantly adjusting stock quantities.
- There is no backend enforcement of the 25% rule — it is a frontend default only. The field accepts any non-negative number.

---
