# Django Infrastructure Tools and Scripts

## 1\. Built-in Django Tools

### Django Admin

Provides a powerful interface for managing models like products, categories, suppliers, and logs. Highly customizable and useful for quick CRUD operations.

### Management Commands

Custom scripts that can be run using \`python manage.py yourcommand\`. Ideal for bulk imports, scheduled tasks, and data validation.

### Signals

Allow decoupled components to get notified when certain actions occur (e.g., order status changes, audit logging, low-stock alerts).

### Middleware

Used to enforce global rules like session timeouts, logging, and security headers.

### Authentication & Permissions

Handles user login, registration, password reset, email verification, and role-based access control. Essential for protecting routes and data.

## 2\. Common Python/Django Packages

### Pillow

Used for image handling (uploads, resizing, thumbnails). Required for product image support.

Installation: pip install Pillow

## Black

Code formatter that enforces consistent style and reduces merge conflicts.

Installation: pip install black

## Django-Taggit

Adds tagging functionality to models. Useful for product labels and filtering.

Installation: pip install django-taggit

### Django REST Framework (DRF)

Powerful toolkit for building Web APIs. Supports authentication, serialization, and permissions.

Installation: pip install djangorestframework

### Django-Extensions

Developer tools like shell\_plus, graph\_models, and runserver\_plus for enhanced debugging and visualization.

Installation: pip install django-extensions

### Celery

Asynchronous task queue for background jobs like email sending, report generation, and alerts.

Installation: pip install celery

## 3\. Recommended Custom Scripts

### CSV Import Script

Reads a CSV file to bulk import or update products. Validates data and logs errors.

Command: python manage.py import\_products

### Low-Stock Checker Script

Scheduled script that checks inventory levels, flags low-stock items, and sends alerts.

Command: python manage.py check\_low\_stock

### Order Status Logging Script

Triggered by signals to log every order status change and update the order timeline.

Command: Integrated via Django signals

### Database Cleanup Script

Removes soft-deleted items, clears expired sessions, and archives old logs to maintain system health.

Command: python manage.py cleanup\_database
