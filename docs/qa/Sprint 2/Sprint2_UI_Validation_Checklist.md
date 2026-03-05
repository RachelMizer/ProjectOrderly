# Sprint 2 UI & Navigation Validation Checklist – Orderly

## Overview

This document outlines structured UI and navigation validation for Sprint 2.

Unlike formal test cases (used for authentication and database logic), this checklist is used to validate:

- Application shell rendering
- Navigation functionality
- Role-based route protection
- Page shell structure
- Responsive layout behavior

All items must be verified before Sprint 2 Review.

---

# 1. Application Shell & Global Navigation

## Landing Page

- [ ] Landing page loads without errors
- [ ] Clear entry points for Customer and Business users
- [ ] Navigation bar displays correctly
- [ ] No console errors present

---

## Customer Navigation

- [ ] Customer navigation bar displays correct links:
  - Menu
  - Cart
  - Orders
  - Account
- [ ] All navigation links route to correct pages
- [ ] Current active page is visually highlighted
- [ ] Browser back/forward buttons function properly
- [ ] No broken routes or 404 errors

---

## Business Admin Navigation

- [ ] Admin sidebar displays correct links:
  - Dashboard
  - Menu Management
  - Inventory
  - Orders
- [ ] All admin links route correctly
- [ ] Admin navigation not visible to customer role
- [ ] Current active admin page is highlighted
- [ ] No console or routing errors

---

# 2. Role-Based Route Protection

## Customer Role

- [ ] Customer cannot access `/admin/*` routes
- [ ] Unauthorized attempts return proper error (403 or redirect)
- [ ] API endpoints reject unauthorized access

## Business Admin Role

- [ ] Business admin can access admin routes
- [ ] Admin cannot access restricted customer-only pages if applicable
- [ ] No improper data exposure across roles

---

# 3. Page Shell Rendering – Customer Side

## Menu Browsing Page

- [ ] Page loads successfully
- [ ] Seed data displayed in grid or list format
- [ ] Product name, description, and price visible
- [ ] Layout consistent with design system

## Shopping Cart Page

- [ ] Page renders without errors
- [ ] Empty state displays correctly
- [ ] Placeholder structure exists

## Order History Page

- [ ] Seed order data displays correctly
- [ ] Order statuses visible
- [ ] Layout responsive and consistent

## Account/Profile Page

- [ ] User information displays correctly
- [ ] Role displayed correctly
- [ ] Layout consistent with other pages

---

# 4. Page Shell Rendering – Business Admin

## Admin Dashboard

- [ ] Dashboard loads without errors
- [ ] Welcome message displayed
- [ ] Placeholder widgets visible

## Menu Management Page

- [ ] Menu items display in table format
- [ ] Data consistent with seed data
- [ ] No console errors

## Inventory Page

- [ ] Inventory list displays correctly
- [ ] Stock levels visible
- [ ] Negative or invalid values not shown

## Orders Management Page

- [ ] Orders display correctly
- [ ] Status visible
- [ ] Role enforcement confirmed

---

# 5. Seed Data Validation (UI Level)

- [ ] Minimum 10 menu items visible
- [ ] Multiple product categories visible
- [ ] 2+ test users per role confirmed
- [ ] 3–5 sample orders visible
- [ ] Inventory linked properly to menu items

---

# 6. Responsive Design Validation

## Mobile (320px+)

- [ ] Navigation collapses correctly
- [ ] Layout readable and usable
- [ ] No overlapping elements
- [ ] Buttons accessible

## Tablet (768px+)

- [ ] Layout adjusts appropriately
- [ ] Grid systems align properly
- [ ] No broken components

## Desktop (1024px+)

- [ ] Full layout renders correctly
- [ ] Sidebar/navigation alignment correct
- [ ] No spacing inconsistencies

---

# 7. Design System Validation

- [ ] Color palette applied consistently
- [ ] Typography consistent across pages
- [ ] Reusable Button component functions properly
- [ ] Reusable Form Input component renders consistently
- [ ] Card and Alert components styled correctly
- [ ] Spacing consistent across layouts

---

# Final Validation

Before marking Sprint 2 complete:

- [ ] All navigation links functional
- [ ] No console errors across pages
- [ ] No critical UI defects
- [ ] Role-based access confirmed working
- [ ] UI validated on mobile, tablet, and desktop

---

# Execution Notes

- This checklist will be executed during Week 2 of Sprint 2.
- Any defects discovered will be logged in the Sprint 2 defect tracker.
- All critical and high-severity issues must be resolved before Sprint Review.

---
