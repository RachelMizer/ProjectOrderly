# Decoupled Frontend + Backend
---
## Context:
Orderly intends to deliver an intuitive UX for both customers and business owners, utilizing React. The SRS maintains that the application will use a RESTful design, JWTs, and a client-server design. At this point, the development team needs to decide on a decoupled model or a server-rendered approach.

---
## Decision
Continue with the client-server, decoupled design mentioned in the SRS. The frontend will manage UI rendering based on user interaction, while the backend exposes RESTful APIs, delivers JSON data, authenticates users, and handles business logic.

---
## Consequences
+ Clear separation of concerns
+ The frontend and backend can be developed and tested independently.
+ The backend must support communication with the frontend in this manner.
+ The frontend is soley responsible for managing UI related to error, authorization, loading, or waiting for the backend
+ Strict coordination on APIs between frontend and backend developers
---