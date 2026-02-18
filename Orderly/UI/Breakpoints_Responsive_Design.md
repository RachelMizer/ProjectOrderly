# Orderly — Breakpoints & Responsive Design Guide
### Created by Rachel Mizer
This document defines the breakpoint sizes and responsive layout rules used throughout the Orderly interface.

---

## 1. Breakpoint Sizes

| Device Type | Width Range | Breakpoint Rule |
|-------------|-------------|-----------------|
| Large Desktop | ≥ 1200px | `@media (min-width: 1200px)` |
| Small Desktop / Laptop | 992–1199px | `@media (max-width: 1199px)` |
| Tablet | 768–991px | `@media (max-width: 991px)` |
| Mobile | ≤ 767px | `@media (max-width: 767px)` |

---

## 2. CSS Breakpoint Structure

Add these media queries to your main stylesheet:

```css
/* ===========================
   BREAKPOINTS
=========================== */

/* Tablet and below */
@media (max-width: 1199px) {
    /* tablet adjustments */
}

/* Small tablets and large phones */
@media (max-width: 991px) {
    /* small tablet adjustments */
}

/* Mobile */
@media (max-width: 767px) {
    /* mobile adjustments */
}
