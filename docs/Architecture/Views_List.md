# Orderly — Views List (Admin vs User)
### Created by Rachel Mizer

This document lists all Django views required for the Orderly system, organized by feature area and labeled with the correct access level:

- **Admin** — full access  
- **User** — standard authenticated user  
- **Public** — no login required  

---

## 1. Authentication Views
- `login_view` — Public  
- `logout_view` — Logged‑in users  
- `password_reset_view` — Public  
- `email_verification_view` — Public  

---

## 2. Dashboard Views
- `admin_dashboard_view` — **Admin‑only**  
- `user_dashboard_view` — User  

---

## 3. Catalog (Products)
- `product_list_view` — User  
- `product_detail_view` — User  
- `product_create_view` — **Admin‑only**  
- `product_update_view` — **Admin‑only**  
- `product_delete_view` — **Admin‑only**  

---

## 4. Inventory
- `inventory_overview_view` — User  
- `inventory_adjust_view` — **Admin‑only**  
- `supplier_list_view` — User  
- `supplier_create_view` — **Admin‑only**  
- `supplier_update_view` — **Admin‑only**  

---

## 5. Orders
- `order_list_view` — User  
- `order_detail_view` — User  
- `order_create_view` — User  
- `order_update_view` — **Admin‑only**  
- `order_cancel_view` — **Admin‑only**  
- `sales_report_view` — **Admin‑only**  

---

## 6. Customers
- `customer_list_view` — User  
- `customer_detail_view` — User  
- `customer_create_view` — User  
- `customer_update_view` — User  

---

## 7. Settings
- `user_management_view` — **Admin‑only**  
- `system_settings_view` — **Admin‑only**  

---

## 8. Utility / Navigation
- `search_view` — User  
- `help_view` — User  

---

# Summary

## Admin‑Only Views
- `admin_dashboard_view`  
- `product_create_view`  
- `product_update_view`  
- `product_delete_view`  
- `inventory_adjust_view`  
- `supplier_create_view`  
- `supplier_update_view`  
- `order_update_view`  
- `order_cancel_view`  
- `sales_report_view`  
- `user_management_view`  
- `system_settings_view`  

## User Views
- `user_dashboard_view`  
- `product_list_view`  
- `product_detail_view`  
- `inventory_overview_view`  
- `supplier_list_view`  
- `order_list_view`  
- `order_detail_view`  
- `order_create_view`  
- `customer_list_view`  
- `customer_detail_view`  
- `customer_create_view`  
- `customer_update_view`  
- `search_view`  
- `help_view`  

## Public Views
- `login_view`  
- `password_reset_view`  
- `email_verification_view`  

---
