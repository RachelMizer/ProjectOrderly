# API Contract Review — Sprint 2

**Reviewer:** Serina Rodriguez (Scrum Master)
 **Document Reviewed:** `API_Contract.md`
 **Author:** Tristin Gatt
 **Date:** March 4, 2026
 **Trello Card:** 2.14 — Expand API Contract (Users & Orders)

------

## Sprint Coverage Summary

| Section                                                      | Status           | Sprint     |
| ------------------------------------------------------------ | ---------------- | ---------- |
| Authentication (Login, Register, Refresh, Logout, Password Reset, Confirm) | ✅ Complete       | Sprint 2   |
| Customers (Get Profile, Update Profile, Get All, Get by ID, Delete) | ✅ Complete       | Sprint 2   |
| Orders (Create, Add Item, Update Quantity, Add Modifier, Get Order, Get Status, List, Submit, Finalize, Cancel) | ✅ Complete       | Sprint 2   |
| Menu API (List Categories, List Products, Get Variants, Get Modifiers, Create/Update Product/Variant/Modifiers) | 🔲 Empty skeleton | Sprint 3   |
| Inventory API (View Levels, Adjust, Low-Stock Report, Usage) | 🔲 Empty skeleton | Sprint 3–4 |
| Reporting API (View Sales)                                   | 🔲 Empty skeleton | Sprint 3–4 |

Task 2.14 deliverables (Users and Orders endpoints) are complete. ✅

------

## Overall Feedback

Overall very detailed while handling guest users, modifiers, and role separation very well and thoughtfully. The defensive API design is appreciated — first caught at `Update Order Item Quantity` and consistent throughout.

------

## Clarifications & Suggestions

### Update Customer Profile — Potential Ambiguity on First Read

**Endpoint:** `PATCH /api/v1/users/me`

On first read, this endpoint could be ambiguous: "Does this allow partial updates or require full information?" Partial changes are shown in the example body, and the endpoint is in fact `PATCH` — but just to be clear, I would consider adding to the Rules section:

> At least one field is required. Only provided fields will be updated; omitted fields remain unchanged.

------

### List Orders — Missing 403 Response

**Endpoint:** `GET /api/v1/orders`

`List Orders` would benefit from a 403 response to avoid tampering via crafted manual API requests — consistent with the defensive API design used elsewhere in the contract.

**Suggested addition:**

```json
{
    "error": "INVALID_ROLE",
    "message": "user does not have this permission"
}
```

> **Note on 404:** 404 is correctly omitted here. A list endpoint with no matching results should return 200 with an empty array — the `/orders` collection always exists, so 404 would not apply.

------

### List Orders — Business View vs. Customer View

**Endpoint:** `GET /api/v1/orders`

For front-end purposes, would this be "Business View: Order History"? Is there a separate endpoint that covers the customer's view of their own order history?

------

## Line Errors

### Syntax Errors — `Get Order/:id` Response Body

**Section:** Get Order/:id
 **Lines:** 850–856

| Line    | Issue                                                  | Current                                   | Corrected                 |
| ------- | ------------------------------------------------------ | ----------------------------------------- | ------------------------- |
| 850     | Semicolon instead of colon                             | `"id"; 302`                               | `"id": 302`               |
| 852     | Key missing quotation marks                            | `modifiers:`                              | `"modifiers":`            |
| 850–855 | Modifier fields missing curly braces as object wrapper | `"id": 3, "groupId": 2` floating in array | `{"id": 3, "groupId": 2}` |

Corrected block:

```json
"variants": [
    {
        "id": 302,
        "variantName": "large_shirt_black",
        "modifiers": [
            {
                "id": 3,
                "groupId": 2
            }
        ]
    }
]
```

------

### Heading Convention Note — `## Get Order/:id`

**Line:** 820

On first read, `## Get Order/:id` appeared to potentially be a typo — could this be `## Get Order id:`? After review, this is confirmed to be standard REST documentation convention for indicating a URL parameter placeholder. Not an error. Noting here for transparency.

------

### Missing Code Fence — `Get Order Status`

**Lines:** 894–896

Missing both opening and closing ````` between the stated lines under `Get Order Status`, causing the JSON to render as plain text.

------

### Open Question — Order Status Values

**Section:** Get Order Status / List Orders

Do we have other statuses defined besides `PENDING` and `COMPLETED`? The product backlog references a status timeline of `Pending → In Progress → Ready → Completed`. Is the plan to keep the order journey simple, or should the full set of valid status values be documented in the contract?

------

*Reviewed by Serina Rodriguez — attach to Trello card 2.14*