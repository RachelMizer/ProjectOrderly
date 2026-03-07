# Sprint 2 Test Cases – Orderly  
**Sprint 2 Scope:** Database, Authentication, RBAC & Application Shell  

---

# 1. Overview

Sprint 2 establishes the foundational system architecture required for future feature development.

Primary deliverables include:

- Database schema implementation and validation  
- User authentication (registration, login, password reset)  
- Role-Based Access Control (RBAC)  
- Backend/frontend authentication integration  
- Application shell and navigation structure  

This document defines formal QA test cases for foundational and security-critical features.

Execution occurs after feature completion and prior to Sprint Review.

---

# 2. Database Schema & Relational Integrity

## TC-01 – Database Schema Migration & Relational Integrity  
**User Story:** 2.1  
**Feature:** Database Schema Implementation  

### Preconditions
- MySQL server running locally  
- Clean database available  
- Django configured for MySQL  
- Sprint 2 migrations present for:
  - accounts  
  - catalog  
  - inventory  
  - suppliers  
  - orders  

---

### Test Steps

#### Step A — Migration Integrity
1. Run `python manage.py makemigrations`  
2. Run `python manage.py migrate`  
3. Re-run `python manage.py migrate`  
4. Run `python manage.py showmigrations`  

**Expected Result**
- No migration errors  
- Second migrate shows no pending migrations  
- All Sprint 2 migrations marked applied  

---

#### Step B — Physical Schema Verification
1. Connect to MySQL  
2. Execute `SHOW TABLES;`  
3. Query foreign keys via `INFORMATION_SCHEMA.KEY_COLUMN_USAGE`  

**Expected Result**
- Core domain tables exist  
- Django system tables exist  
- Foreign key constraints enforced across apps  

---

#### Step C — Relational Usability (Happy Path)
1. Open Django shell  
2. Create linked records:

Supplier → Category → Product → ProductVariant →  
CustomerProfile → Order → OrderItem  

**Expected Result**
- Records save successfully  
- Foreign keys resolve correctly  
- Duplicate product constraint enforced  
- No ORM or database integrity errors  

---

### Actual Result
All migrations applied successfully.  
MySQL verification confirmed table creation and enforced foreign keys.  
Linked relational records created successfully.  
Duplicate product constraint correctly enforced.  

**Status:** PASS  

### Evidence

**Figure 1 – Successful migration execution**  
![Migration Output](screenshots/tc04_migrate.jpg)

**Figure 2 – showmigrations confirmation**  
![Showmigrations](screenshots/tc04_showmigrations.jpg)

**Figure 3 – MySQL table creation**  
![SHOW TABLES](screenshots/tc04_show_tables.jpg)

**Figure 4 – Relational record creation in Django shell**  
![Shell Success](screenshots/tc04_shell_success.jpg)

### Notes  
Confirms foundational database readiness required for all Sprint 2 features.

---
# 3. Backend User Registration

## TC-02 – Backend User Registration  
**User Story:** 2.4  
**Feature:** Backend Registration API  

### Preconditions
- Django backend server running  
- MySQL database connection active  
- Accounts migrations applied  
- Test email does not already exist  

---

### Test Steps
1. Send POST request to `/api/v1/auth/register/`  
2. Provide valid JSON payload including:
   - email  
   - password  
   - role  
   - firstName  
   - lastName  
3. Verify HTTP response status indicates success (200 or 201)  
4. Verify response body confirms successful registration  
5. Query `auth_user` table to confirm user record exists  
6. Confirm username equals email  

---

### Expected Result
- Registration request succeeds  
- New user record created in `auth_user`  
- Username equals email  
- Structured success response returned  
- No server errors occur  

---

### Actual Result
Registration succeeded.  

API Response:
- accessToken returned  
- expiresIn = 3600  
- tokenType = Bearer  
- customer object returned with id, email, role  

Database Verification:
- `auth_user` record created  
- username equals email  
- is_active = 1  

**Status:** PASS  

---

# 4. Email Verification (US 2.5)

## TC-03 – Email Verification Flow  

### Preconditions
- Backend server running  
- Console email backend enabled  
- Test user successfully registered  
- Unique test email generated  

---

### Test Steps

#### Step A – Request Verification Email
1. Send POST request to `/api/v1/auth/email-verification`  
2. Provide JSON payload:
   - email  

**Expected Result**
- Generic response returned  
- No indication whether email exists  
- No server errors  

---

#### Step B – Capture Verification Link
1. Observe backend console output  
2. Locate verification email  
3. Extract `uid` and `token`  

**Expected Result**
- Verification link displayed in console  
- Token generated successfully  

---

#### Step C – Confirm Verification (Valid Token)
1. Send POST request to `/api/v1/auth/email-verification/confirm`  
2. Provide:
   - uid  
   - token  

**Expected Result**
- HTTP 200 returned  
- “email verified” message  
- `CustomerProfile.email_verified` set to True  

---

#### Step D – Confirm Verification (Invalid Token)
1. Repeat confirmation with invalid token  

**Expected Result**
- HTTP 400 returned  
- INVALID_TOKEN error  
- No changes to user record  

---

### Actual Result
Verification email successfully generated via manual trigger.  
Valid token confirmed email successfully.  
Invalid token properly rejected.  

**Status:** PASS  

---

# 5. JWT Login & Authentication Enforcement (US 2.6)

## TC-04 – JWT Login & Protected Endpoint  

### Preconditions
- Registered and verified user exists  
- Known valid password  

---

### Test Steps

#### Step A – Valid Login
1. Send POST request to `/api/v1/auth/login`  
2. Provide:
   - email  
   - password  

**Expected Result**
- HTTP 200 returned  
- accessToken provided  
- refreshToken set in HttpOnly cookie  
- customer object returned  

---

#### Step B – Invalid Password
1. Send login request with incorrect password  

**Expected Result**
- HTTP 400 returned  
- “Email or password is incorrect”  
- No token issued  

---

#### Step C – Protected Endpoint Without Token
1. Send GET request to `/api/v1/auth/me/` without Authorization header  

**Expected Result**
- HTTP 401 Unauthorized  
- Access denied  

---

#### Step D – Protected Endpoint With Bearer Token
1. Send GET request to `/api/v1/auth/me/`  
2. Include header:
   - Authorization: Bearer <accessToken>  

**Expected Result**
- HTTP 200 returned  
- User id, email, username, and role returned  

---

#### Step E – Refresh Token
1. Use stored refresh cookie  
2. Send POST request to `/api/v1/auth/refresh`  

**Expected Result**
- HTTP 200 returned  
- New accessToken issued  

---

#### Step F – Logout
1. Send POST request to `/api/v1/auth/logout`  
2. Attempt refresh again  

**Expected Result**
- Logout returns success message  
- Refresh token invalidated  
- Subsequent refresh returns 401  

---

### Actual Result
Login successful.  
Authentication enforcement confirmed.  
Refresh and logout flow validated successfully.  

**Status:** PASS  

---

# 6. Password Reset (US 2.7)

## TC-05 – Password Reset End-to-End  

### Preconditions
- Registered user exists  
- Console email backend enabled  

---

### Test Steps

#### Step A – Request Password Reset
1. Send POST request to `/api/v1/auth/password-reset`  
2. Provide:
   - email  

**Expected Result**
- Generic response returned  
- Reset email generated in console  

---

#### Step B – Capture Reset Link
1. Extract `uid` and `token` from console email  

**Expected Result**
- Valid reset link generated  

---

#### Step C – Confirm Password Reset
1. Send POST request to `/api/v1/auth/password-reset/confirm`  
2. Provide:
   - uid  
   - token  
   - newPassword  

**Expected Result**
- HTTP 200 returned  
- “Password has been reset successfully”  
- Password updated in database  

---

#### Step D – Validate Old Password Fails
1. Attempt login using old password  

**Expected Result**
- Login rejected  
- HTTP 400 returned  

---

#### Step E – Validate New Password Works
1. Attempt login using new password  

**Expected Result**
- HTTP 200 returned  
- Tokens issued successfully  

---

### Actual Result
Password reset flow executed successfully.  
Old password invalidated.  
New password validated and login successful.  

**Status:** PASS  

---
# US2.8 Authentication API Test Cases

---

### Test Case ID:
TC-US28-01

### Feature:
Authentication API

### User Story:
As a front-end developer, I want backend API endpoints for authentication so that I can integrate user registration, login, and account management into the UI.

### Preconditions:
- Backend API server running
- No Authorization header provided

### Test Steps:
1. Send GET request to `/api/v1/auth/me/`
2. Do not include an Authorization header

### Expected Result:
- System rejects request
- Response returns **401 Unauthorized**
- Error indicates authentication credentials are required

### Actual Result:
Endpoint returned **401 Unauthorized** as expected when no authentication token was provided.

### Status:
Pass

### Notes:
Confirms protected endpoints reject unauthorized requests.

---

### Test Case ID:
TC-US28-02

### Feature:
Authentication API

### User Story:
As a front-end developer, I want backend API endpoints for authentication so that I can integrate user registration, login, and account management into the UI.

### Preconditions:
- Backend server running
- Test email not previously registered

### Test Steps:
1. Send POST request to `/api/v1/auth/register`
2. Provide required fields: email, password, firstName, lastName

### Expected Result:
- Response returns **201 Created**
- Access token generated
- Refresh token cookie created
- User information returned

### Actual Result:
Registration succeeded. API returned **201 Created**, access token was generated, and refresh token cookie was set.

### Status:
Pass

### Notes:
Confirms registration endpoint functions correctly.

---

### Test Case ID:
TC-US28-03

### Feature:
Authentication API

### User Story:
As a front-end developer, I want backend API endpoints for authentication so that I can integrate user registration, login, and account management into the UI.

### Preconditions:
- A user account already exists with the test email

### Test Steps:
1. Send POST request to `/api/v1/auth/register`
2. Use an email that already exists

### Expected Result:
- Response returns **400 Bad Request**
- Error message indicates email already registered

### Actual Result:
API returned **400 Bad Request** with validation error stating email is already registered.

### Status:
Pass

### Notes:
Confirms duplicate email validation is enforced.

---

### Test Case ID:
TC-US28-04

### Feature:
Authentication API

### User Story:
As a front-end developer, I want backend API endpoints for authentication so that I can integrate user registration, login, and account management into the UI.

### Preconditions:
- User account exists
- Valid credentials available

### Test Steps:
1. Send POST request to `/api/v1/auth/login`
2. Provide valid email and password

### Expected Result:
- Response returns **200 OK**
- Access token returned
- Refresh token cookie set
- User information returned

### Actual Result:
Login successful. API returned **200 OK**, access token issued, and refresh token cookie set.

### Status:
Pass

### Notes:
Confirms authentication login flow works correctly.

---

### Test Case ID:
TC-US28-05

### Feature:
Authentication API

### User Story:
As a front-end developer, I want backend API endpoints for authentication so that I can integrate user registration, login, and account management into the UI.

### Preconditions:
- User account exists

### Test Steps:
1. Send POST request to `/api/v1/auth/login`
2. Use incorrect password

### Expected Result:
- Response returns **400**
- Error message indicates invalid credentials

### Actual Result:
API returned **400** with error message indicating incorrect credentials.

### Status:
Pass

### Notes:
Confirms incorrect login credentials are rejected.

---

### Test Case ID:
TC-US28-06

### Feature:
Authentication API

### User Story:
As a front-end developer, I want backend API endpoints for authentication so that I can integrate user registration, login, and account management into the UI.

### Preconditions:
- User logged in
- Valid access token obtained

### Test Steps:
1. Send GET request to `/api/v1/auth/me/`
2. Include header:
   Authorization: Bearer <accessToken>

### Expected Result:
- Response returns **200 OK**
- User profile information returned

### Actual Result:
API returned **200 OK** with correct user information including id, email, username, and role.

### Status:
Pass

### Notes:
Confirms protected endpoint works with valid authentication.

---

### Test Case ID:
TC-US28-07

### Feature:
Authentication API

### User Story:
As a front-end developer, I want backend API endpoints for authentication so that I can integrate user registration, login, and account management into the UI.

### Preconditions:
- User logged in
- Refresh token cookie exists

### Test Steps:
1. Send POST request to `/api/v1/auth/refresh`

### Expected Result:
- Response returns **200 OK**
- New access token returned

### Actual Result:
Refresh request returned **200 OK** and generated a new access token.

### Status:
Pass

### Notes:
Confirms refresh token flow functions properly.

---

### Test Case ID:
TC-US28-08

### Feature:
Authentication API

### User Story:
As a front-end developer, I want backend API endpoints for authentication so that I can integrate user registration, login, and account management into the UI.

### Preconditions:
- User logged in
- Refresh token cookie exists

### Test Steps:
1. Send POST request to `/api/v1/auth/logout`

### Expected Result:
- Response returns **200 OK**
- Logout confirmation message returned
- Refresh token cookie removed

### Actual Result:
Logout successful. API returned **200 OK** and refresh token cookie was removed.

### Status:
Pass

### Notes:
Confirms logout invalidates refresh token.

---

### Test Case ID:
TC-US28-09

### Feature:
Authentication API

### User Story:
As a front-end developer, I want backend API endpoints for authentication so that I can integrate user registration, login, and account management into the UI.

### Preconditions:
- User logged out

### Test Steps:
1. Send POST request to `/api/v1/auth/refresh`

### Expected Result:
- Response returns **401 Unauthorized**
- Error indicates invalid refresh token

### Actual Result:
API returned **401 Unauthorized** indicating the refresh token was invalid after logout.

### Status:
Pass

### Notes:
Confirms refresh tokens cannot be reused after logout.

---

### Test Case ID:
TC-US28-10

### Feature:
Authentication API

### User Story:
As a front-end developer, I want backend API endpoints for authentication so that I can integrate user registration, login, and account management into the UI.

### Preconditions:
- User account exists

### Test Steps:
1. Send POST request to `/api/v1/auth/password-reset`
2. Provide registered email

### Expected Result:
- Response returns **200 OK**
- Reset request message returned

### Actual Result:
API returned **200 OK** with message indicating reset instructions will be sent if email exists.

### Status:
Pass

### Notes:
Console email backend displayed reset link.

---

### Test Case ID:
TC-US28-11

### Feature:
Authentication API

### User Story:
As a front-end developer, I want backend API endpoints for authentication so that I can integrate user registration, login, and account management into the UI.

### Preconditions:
- Password reset token available

### Test Steps:
1. Send POST request to `/api/v1/auth/password-reset/confirm`
2. Provide uid, token, and newPassword
3. Attempt login with old password
4. Attempt login with new password

### Expected Result:
- Password reset succeeds
- Old password rejected
- New password login succeeds

### Actual Result:
Password reset successful. Old password no longer worked, and login with new password succeeded.

### Status:
Pass

### Notes:
Confirms password reset flow works correctly.

---

# Final Test Execution Status

All authentication test cases executed successfully.

All endpoints returned correct responses and status codes according to acceptance criteria.

**QA Result: PASS**

# 7. Sprint 2 Testing Strategy

Sprint 2 testing prioritizes:

## Security
- Authentication correctness  
- Password hashing  
- JWT enforcement  
- RBAC enforcement  

## Data Integrity
- Schema migration success  
- Foreign key enforcement  
- Constraint validation  

## System Foundation
- Backend/frontend auth integration  
- Stable base for Sprint 3  

---

# 8. QA Execution Plan

**Execution Timing:**  
After feature completion and before Sprint Review.

**Regression Testing:**  
Performed after code freeze.

**Defect Tracking:**  
All failures logged in Trello with:
- Severity  
- Reproduction steps  
- Screenshots  
- Assigned developer  

---
