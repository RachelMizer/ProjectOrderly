# Development Environment & Technology Decisions

## User Story
**As a developer**, I want to use technologies that facilitate the product architecture to develop our initial codebase and development environment.

This document reviews and finalizes the core technologies, architectural approach, and security considerations for the **Orderly** project. These decisions establish a consistent development environment and enable efficient collaboration across the team.

---

## Core Development Tools

| Category | Technology |
|-------|------------|
| Version Control | GitHub |
| IDE | Visual Studio Code |
| Backend Language | Python |
| Backend Framework | Django + Django REST Framework |
| Authentication | JWT (SimpleJWT) |
| Frontend | HTML, CSS, JavaScript (React planned) |
| Database | SQL (MySQL) |
| API Style | RESTful JSON APIs |

---

# Architectural Decisions

## Decoupled Frontend + Backend Architecture

### Context
Orderly aims to deliver an intuitive user experience for both customers and business owners. The SRS specifies a **RESTful client–server architecture**, JWT-based authentication, and a clear separation between frontend and backend responsibilities.

At this stage, the team must choose between:
- A **server-rendered approach**, or
- A **decoupled client-server model**

---

### Decision
The team will continue with a **decoupled frontend and backend architecture**, as defined in the SRS.

- The frontend is responsible for all UI rendering and user interaction.
- The backend exposes RESTful APIs, handles authentication, business logic, and database communication.
- All data exchanged between layers will use JSON over HTTPS.

---

### Consequences
**Benefits**
- Clear separation of concerns
- Frontend and backend can be developed and tested independently
- Enables future frontend flexibility (React, mobile apps, kiosks)
- Backend remains stateless and scalable

**Tradeoffs**
- Requires strict API contracts between frontend and backend
- Increased coordination between frontend and backend developers
- UI must gracefully handle loading, error, and authorization states

---

## Django-Powered Backend

### Context
Orderly requires a robust backend to:
- Enforce business rules
- Communicate with a relational database
- Support JWT-based authentication
- Scale across multiple business accounts and concurrent users

While Express/Node were initially referenced in the SRS, most team members have stronger experience with **Python**.

---

### Decision
The backend will be implemented using **Django**, with the following components:
- **Django REST Framework (DRF)** for RESTful APIs
- **SimpleJWT** for stateless JWT authentication
- Django ORM for database access and integrity

---

### Rationale
- Django provides a mature, well-documented framework with built-in security features
- The ORM simplifies database consistency and relationships
- Python aligns with team skillsets
- Django supports future features such as reporting, data aggregation, and exports

---

### Consequences
**Benefits**
- Faster initial prototyping due to Django’s conventions
- Built-in ORM reduces SQL boilerplate
- Strong security defaults

**Tradeoffs**
- Django is more opinionated than Node/Express
- Customization may be slower later in development
- Not async-first, requiring deliberate design for live features (e.g., real-time order tracking)

---

# Database Technology

## SQL-Based Relational Database

### Decision
Orderly will use a **SQL relational database (MySQL)** as the primary datastore.

### Rationale
- Strong support for relational data (orders, users, products, suppliers)
- Enforces referential integrity through foreign keys
- Compatible with Django ORM
- Well-suited for reporting and analytics

---

# Security Considerations

## AES-256 Encryption and Data Protection

### Context
The SRS specifies encryption of sensitive data at rest. AES-256 encryption was considered for protecting user data such as addresses.

---

### Evaluation
Implementing **per-user AES-256 encryption** introduces significant complexity:
- Requires managing a master key and per-user encrypted keys
- Complicates querying and reporting
- Adds overhead for analytical operations

For Orderly, most stored data (e.g., orders, product info) is not highly sensitive. Shipping addresses are the primary concern.

---

### Decision
Orderly will **not implement per-user AES-256 encryption**.

Instead:
- Sensitive fields (e.g., street addresses) may be encrypted using a **single server-side key**
- Django-compatible libraries such as `django-fernet-fields` or `django-cryptography` may be used
- All data in transit will be encrypted using HTTPS

---

### Consequences
**Benefits**
- Strong protection for sensitive fields
- Maintains database queryability and performance
- Reduced implementation complexity

**Tradeoffs**
- Less granular than per-user encryption
- Requires secure server-side key management

---

# Development Workflow

- Feature-based Git branching (e.g., `login_testing`)
- Pull requests required before merging to `main`
- Code reviews required before completion
- Jira/Trello used for task tracking
- Kanban flow:  
  **Backlog → In Progress → Review → Done**

Once the environment is set up, the codebase will live entirely within the GitHub repository, and all development will follow this workflow.

---

## Summary
These decisions finalize the **development environment and technology stack** for Orderly. The selected tools and architecture support scalability, maintainability, and team collaboration while aligning with the project’s scope and timeline.
