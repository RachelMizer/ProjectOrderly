# JWT (JSON Web Tokens) 
---
## Context:
The application provides both a customer facing ordering interface AND a business-owner facing management interface. Customers should never be able to, accidentally or maliciously, edit the menu, alter inventory counts, access sales data, etc. 
Some form of role authorization is required.

---
## Decision
Use JSON web tokens to maintain user authorization. The backend will generate and distribute a token to clients on login. The frontend will store this token, and include it in further API calls. Tokens contain the users role. The backend will validate the token.

---
## Why?
+ Aligns with a RESTful design
+ Stateless backend

---
## Consequences
+ JWTs will be given to users upon login, assigning their role.
+ The Frontend must include its token in calls to the backend
+ The Backend must authenticate the JWT of incoming requests
  
+ Tokens may need to be refreshed
+ Backend must support token validation
+ Frontend must securely store the web token.

---