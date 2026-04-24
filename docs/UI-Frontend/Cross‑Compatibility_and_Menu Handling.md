# Orderly — Cross‑Compatibility & Menu Behavior Plan
### Created by Rachel Mizer

This document outlines the cross‑device compatibility strategy for Orderly and defines how collapsible and conditional menus will behave across desktop, tablet, and mobile layouts.

---

## 1. Cross‑Compatibility Strategy

Orderly is designed to function smoothly across three primary device classes:

### **Desktop (≥ 1200px)**
- Full navigation bar visible at all times  
- Multi‑column layouts for dashboards, tables, and forms  
- Maximum information density for admin workflows  

### **Tablet (768–1199px)**
- Navigation condenses to a slimmer horizontal bar  
- Secondary menus collapse into dropdowns  
- Tables reduce visible columns; overflow handled with horizontal scroll or stacked cards  
- Forms shift to one‑ or two‑column layouts depending on width  

### **Mobile (≤ 767px)**
- Navigation collapses into a hamburger menu  
- All menus become vertical, full‑width drawers  
- Tables convert to stacked card layouts  
- Forms become single‑column with larger tap targets  
- Reduced padding and simplified spacing  

---

## 2. Collapsible Menu Plan

### **Desktop**
- Full menu displayed across the top navigation bar  
- Submenus appear as dropdowns on hover or click  
- No collapsible behavior needed at this size  

### **Tablet**
- Primary navigation remains visible  
- Secondary navigation collapses into a dropdown or “More” menu  
- Optional: left‑side collapsible drawer for admin‑heavy workflows  

### **Mobile**
- All navigation collapses into a hamburger icon  
- Menu opens as a slide‑in drawer from the left or right  
- Submenus expand/collapse within the drawer  
- Drawer closes automatically when a link is selected  

---

## 3. Conditional Menu Visibility

Menu items change based on the user’s role:

### **Admin**
- Sees all menu items, including:  
  - Catalog management  
  - Inventory adjustments  
  - Supplier management  
  - Order editing/canceling  
  - Reports  
  - User management  
  - System settings  

### **User**
- Sees only operational items:  
  - Dashboard  
  - Catalog (view only)  
  - Inventory overview  
  - Orders (view + create)  
  - Customers  
  - Search  
  - Help  

### **Implementation Notes**
- Conditional visibility handled server‑side in templates using:  
  ```django
  {% if user.is_staff %}
      <!-- admin-only menu items -->
  {% endif %}
