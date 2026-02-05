# Django Powered Backend 
---
## Context:
+ While the application frontend is used to manage the user interface, a backend is needed for business logic, communication with the database, and enforcing security. 
+ A RESTful API and JWT authorization imply a stateless design.
+ More members of the development team have strengths in Python.

---
## Decision
While Express and Node are mentioned in the SRS, we've decided to use a Django powered backend. Django-REST-Framework and Simple-JWT libraries will be leveraged to achieve Stateless, JWT, and REST implementation.

---
## Why?
Orderly will need to support multiple users making many changes accross a non-trivial database. Django includes a built-in ORM and will help developers enforce continuity across the database.

Python is the preferred language of a majority of the development team.

Python is also a strong choice for business features such as data aggregation, report generation, and report exporting.

---
## Consequences
+ Certain Django design patterns will need to be adhered to
+ Django is more opinionated than Node, speeding up initial prototyping and slowing down eventual customization
+ Clear APIs required to communicate with the JS-powered frontend
+ Django is not async-first, like Node, which will require developers to be more deliberate in designing any live features such as kitchen order screens.

---