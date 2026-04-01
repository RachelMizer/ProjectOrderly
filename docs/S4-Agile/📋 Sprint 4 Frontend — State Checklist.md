# 📋 Sprint 4 Frontend — State Matrix

## Scope
F4.1 — Role-Based Access Control  
F4.2 — Admin Navigation  
F4.3 — Product Management  
F4.5 — Sales Dashboard  

---

# 1. 🔐 Auth + Role State Matrix

| State | Logged In | Role Known | Role | Nav Behavior | Route Behavior | API Behavior |
|------|----------|-----------|------|-------------|---------------|-------------|
| A1 | No | No | None | Hide admin nav | Redirect from admin routes | Handle 401 gracefully |
| A2 | Loading | No | Unknown | Hide or show skeleton | Show loading gate | Avoid protected calls |
| A3 | Yes | Yes | Customer | Hide admin nav | Redirect away | Handle 403 gracefully |
| A4 | Yes | Yes | Business | Show admin nav | Allow access | Allow API calls |
| A5 | Yes | Partial | Unknown | Hide until resolved | Hold route | Avoid premature calls |
| A6 | Expired | Previously Yes | Stale | Remove admin nav | Redirect to login | Handle 401 |
| A7 | Logged Out | No | None | Hide immediately | Block routes | Clear state |

---

# 2. 🧭 Navigation Visibility Matrix

| UI Element | Logged Out | Loading | Customer | Business |
|------------|-----------|--------|----------|----------|
| Admin Nav Container | No | No / Skeleton | No | Yes |
| Dashboard Link | No | No | No | Yes |
| Product Management | No | No | No | Yes |
| Inventory Management | No | No | No | Yes |
| Sales Dashboard | No | No | No | Yes |
| Admin Layout Wrapper | No | No | No | Yes |

---

# 3. 🚧 Route Protection Matrix

**Protected Routes**
- /admin
- /admin/products
- /admin/inventory
- /admin/sales-summary

| Scenario | Expected Behavior |
|----------|-----------------|
| Logged out user enters admin URL | Redirect to login |
| Customer enters admin URL | Redirect to safe page |
| Business user enters admin URL | Allow access |
| Auth loading on route entry | Show loading state |
| Token expires while on page | Redirect |
| Customer uses bookmarked admin URL | Redirect |
| Unknown admin route | Show 404 (admin only) or redirect |

---

# 4. 🌐 Backend Response Handling Matrix

| Code | Meaning | Frontend Behavior |
|------|--------|------------------|
| 200 | Success | Render UI |
| 201 | Created | Update UI |
| 204 | Deleted | Remove item |
| 400 | Validation error | Show form errors |
| 401 | Unauthorized | Redirect to login / clear auth |
| 403 | Forbidden | Show unauthorized state or redirect |
| 404 | Not found | Show error or empty state |
| 500+ | Server error | Show fallback error UI |
| Network failure | No response | Show retry option |

---

# 5. 📦 Product Management Page States (F4.3)

## Page States

| State | Behavior |
|------|----------|
| Loading | Show spinner/skeleton |
| Loaded with data | Render product list |
| Loaded empty | Show empty state |
| Fetch error | Show error message |
| 401 | Redirect to login |
| 403 | Redirect to unauthorized |

## Form States

| Action | States |
|--------|-------|
| Create | Open → Submitting → Success / Error |
| Edit | Open → Submitting → Success / Error |
| Delete | Pending → Success / Error |

## Data States

| Scenario | Behavior |
|----------|---------|
| Create success | Add item to list |
| Edit success | Update item |
| Delete success | Remove item |
| 404 (stale item) | Show error |
| Invalid data | Show validation messages |

---

# 6. 📊 Sales Dashboard States (F4.5)

| State | Behavior |
|------|----------|
| Loading | Show loading indicator |
| Loaded | Display metrics |
| Empty data | Show empty state |
| 401 | Redirect to login |
| 403 | Redirect or unauthorized message |
| Server error | Show fallback UI |
| Network failure | Show retry option |

---

# 7. 📌 Core Instance States Summary

- Logged out
- Auth loading
- Logged-in customer
- Logged-in business/admin
- Stale/expired session
- Direct admin route access
- Backend 401
- Backend 403
- Backend 400 validation errors
- Page loading state
- Empty data state
- Network/server error
- Success state (CRUD)
- Not-found/stale data

---