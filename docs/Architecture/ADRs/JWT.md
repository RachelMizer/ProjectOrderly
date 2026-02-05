# JWT (JSON Web Tokens) 
---
## Context:
The application provides both a customer facing ordering interface AND a business-owner facing management interface. Customers should never be able to, accidentally or maliciously, edit the menu, alter inventory counts, access sales data, etc. 
Some form of role authorization is required.

---
## Decision
Use JSON web tokens to maintain user authorization. The backend will generate and distribute a token to clients on login. The frontend will store this token, and include it in further API calls. Tokens contain the user's role. The backend will validate the token.

---
## Why?
+ Aligns with a RESTful design and stateless backend
+ Aligns with SRS

---
## Consequences
+ JWTs will be given to users upon login, assigning their role.
+ The Frontend will include its token in calls to the backend
+ The Backend will authenticate the token of incoming requests
  
+ Frontend must securely store the web token.
+ Backend must support token validation
+ Tokens may need to be refreshed


---