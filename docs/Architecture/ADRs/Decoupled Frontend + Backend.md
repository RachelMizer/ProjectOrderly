# Decoupled Frontend + Backend
---
## Context:
Orderly intends to deliver an intuitive UX for both customers and business owners, utilizing React. The SRS maintains that the application will use a RESTful design, JWTs, and a client-server design. The SRS and presentation also mention "flexible, user-friendly self-service.", "scalable foundation.", "smooth operating GUI for touch screen.", "adapt to multiple devices.", "mobile app design.", etc.
At this point, the development team needs to decide on a decoupled model or a server-rendered approach.

---
## Decision
Continue with the client-server, decoupled design mentioned in the SRS. The frontend will manage UI rendering based on user interaction, while the backend exposes RESTful APIs, delivers JSON data, authenticates users, and handles business logic.

---
## Why?
+ Heavily implied by statements in SRS. 
+ With a backend powered UI, or server-side rendering, pages are constructed on the backend, injected with data, and delivered by the server, requiring a full page refresh for form submissions and UI transitions.
+ With a frontend powered UI, the application can easily support: app-like transitions, smooth screen changes, no full page reloads, real-time updates, and touch-friendly interactions
+ Improves scalability across device types through backend reusability. Computer monitors, tablets, kiosks, mobile, touch.


---
## Consequences
+ Clear separation of concerns between backend and frontend.
+ The frontend and backend can be developed and tested independently.
+ The frontend is solely responsible for managing UI. Including related to error, authorization, loading, or waiting for the backend.
+ The backend is solely responsible for authorization, business logic, database communication, and API exposure.
+ Strict coordination on APIs between frontend and backend developers.
+ Move away from the Django-typical, server-rendered URL → View → Template flow, to an API-first URL → View → JSON architecture, where the frontend is solely responsible for rendering and UI state.
---