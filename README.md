# 🧾 Orderly
## Fast, Flexible Ordering for Any Business

Orderly is a flexible, full-stack, self-service ordering and business management platform
built for small to mid-sized businesses that need an intuitive, affordable way to manage
customer orders and business operations — all from one place.

---

## 📌 About the Project

Traditional ordering systems are either too complex or too expensive for smaller
operations. Orderly solves this with a clean, responsive customer-facing interface
and a business admin dashboard that puts real control in the hands of owners and staff.

Customers can browse, customize, and submit orders with confidence. Admins can manage
products, monitor inventory, and track sales — all backed by a secure, role-separated API.

---

## ✨ Features

### Customer Experience
- [x] User registration, login, and JWT-based authentication
- [x] Email verification and password reset workflows
- [x] Product browsing with categories, variants, and modifier customization
- [x] Persistent shopping cart backed by a DRAFT order
- [x] Order submission (DRAFT → PENDING) with confirmation and receipt
- [x] Customer profile management

### Business Admin Tools
- [x] Role-based access control — customer and business roles enforced server-side
- [x] Admin dashboard navigation
- [x] Product and variant management (create, update, delete)
- [x] Inventory management with real-time stock level tracking
- [x] Sales summary dashboard — total revenue, order count, top-selling products
- [ ] Low stock indicators and visual flags *(Sprint 5 — in progress)*
- [ ] Admin settings page *(Sprint 5 — stretch)*

### Platform & Infrastructure
- [x] RESTful API with versioned endpoints (`/api/v1/`)
- [x] GitHub Actions CI/CD pipeline (Django/pytest + React/Node)
- [x] Robot Framework E2E test suite (SeleniumLibrary)
- [x] Seed data for local development and testing
- [ ] Deployment documentation and live URL *(Sprint 5)*

### Stretch Goals
- [ ] Payment gateway integration
- [ ] Supplier management module
- [ ] Loyalty programs and customer analytics
- [ ] Multi-location support

---

## 🗂️ Data Model Overview

```
auth.User
    └── CustomerProfile (user OneToOne)
    └── BusinessProfile (user OneToOne)

Product
    ├── ProductVariant (product FK)
    │       size, price, stock_quantity
    └── ModifierGroup (product FK)
            └── ModifierOption (group FK)
                    name, price_delta

Order (customer FK)
    └── OrderItem (order FK)
            ├── ProductVariant (variant FK)
            └── OrderItemModifier (item FK)
```

---

## 🛠️ Tech Stack

| Layer           | Technology                                                |
|-----------------|-----------------------------------------------------------|
| Frontend        | React 18, React Router v6, Axios                          |
| Backend         | Django 4.x, Django REST Framework                         |
| Authentication  | SimpleJWT (Access + Refresh tokens)                       |
| Database        | MySQL 8.0                                                 |
| Testing         | pytest (backend), Robot Framework + SeleniumLibrary (E2E) |
| CI/CD           | GitHub Actions                                            |
| Version Control | Git / GitHub                                              |

---

## ⚙️ Getting Started

### Prerequisites

- Python 3.x
- Node.js
- MySQL **8.4.8 LTS** (see installation steps below)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/[your-username]/Orderly.git
cd Orderly
```

### 2. Backend Setup

In PowerShell, navigate to the `Orderly` directory (the one containing this README), then run:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

> **Note:** Navigate to `Orderly/backend/` before starting the backend server.

```powershell
python manage.py runserver
```

### 3. Database Setup

Go to [mysql.com](https://www.mysql.com) → Downloads → MySQL Community (GPL) Downloads → MySQL Community Server.
Select **version 8.4.8 LTS** for Windows and download the MSI installer.

Run the installer (select **Typical**), then run the MySQL Configurator:
- *(Optional)* Choose a database directory
- Choose **Development Computer**
- Keep the default port: `3306`
- Create a root password and store it safely
- Apply changes → Execute → Finish

In `cmd`, connect to MySQL:

```bash
mysql -u root -p
```

> If this fails, add `MySQL\MySQL Server 8.4\bin` to your PATH environment variable using the full installation path.

Once logged in, run the following:

```sql
CREATE DATABASE orderly
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

CREATE USER 'orderly_user'@'localhost'
IDENTIFIED BY 'localdevpass';

GRANT ALL PRIVILEGES ON orderly.* TO 'orderly_user'@'localhost';

FLUSH PRIVILEGES;
```

<details>
<summary>Verify your setup</summary>

```sql
-- Confirm the database exists
SHOW DATABASES;

-- Confirm utf8mb4 encoding
SHOW CREATE DATABASE orderly;
-- Expected: DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci

-- Confirm the user was created
SELECT User, Host FROM mysql.user;

-- Confirm privileges
SHOW GRANTS FOR 'orderly_user'@'localhost';
-- Expected: GRANT ALL PRIVILEGES ON `orderly`.* TO `orderly_user`@`localhost`
```

</details>

Open `orderly/backend/orderly/settings.py` and confirm the `DATABASES` block matches:

```python
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": "orderly",
        "USER": "orderly_user",
        "PASSWORD": "localdevpass",
        "HOST": "127.0.0.1",
        "PORT": "3306",
        "OPTIONS": {
            "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}
```

In PowerShell, from the `Orderly` directory:

```powershell
.venv\Scripts\Activate.ps1
cd backend
python manage.py migrate
```

### 4. Frontend Setup

Install Node.js (Windows installer is fine), then:

```powershell
cd Orderly/frontend
npm install       # Ignore vulnerability warnings
npm start
```

Visit `http://localhost:3000` for the frontend and `http://localhost:8000/api/v1/` for the API.

---

### Running Tests

**Backend unit tests:**

```bash
# From Orderly/backend
pip install -r ../requirements.txt
python manage.py migrate --noinput
pytest --tb=short -v
```

**Frontend checks:**

```bash
# From Orderly/frontend
npm install
npm run lint
npm test
```

---

### CI/CD Pipeline

Every pull request to `main` runs three automated checks via GitHub Actions:

| Job | What Runs |
|---|---|
| **Backend Tests** | Spins up MySQL 8.0, runs migrations, seeds database, runs full pytest suite |
| **Frontend Checks** | Installs dependencies, verifies `react-router-dom`, runs CI smoke tests |
| **E2E Tests** | Spins up MySQL 8.0, starts Django + React dev servers, runs Robot Framework suite (SeleniumLibrary, headless) |

All three checks must pass before a PR is eligible to merge. After pushing, open your pull request on GitHub — check statuses appear near the bottom of the PR page. Click **Details** on any check to see the full log output.

#### Seed Data

The CI pipeline seeds the database using `python manage.py seed_data --seed=42`. This creates a reproducible dataset including:
- Users: `customer1` through `customer5` with password `Password123!`
- Products, variants, categories, suppliers, and orders

The same seed command can be used locally to match the CI environment.

#### Active Workarounds

The following are temporary — see PR comments for full context:

| Workaround | Owner | Action Required |
|---|---|---|
| Hardcoded DB credentials in `settings.py` | Tristin G. | Migrate to environment variables |
| `npm install` instead of `npm ci` | Rachel M. | Run `npm install` locally, commit updated `package-lock.json` |
| `continue-on-error` on E2E tests | Kenny B. | Remove flag once Robot suite is stable in CI |

Once all workarounds are resolved, CI will fully enforce quality gates on every PR.

See [CONTRIBUTING.md](../docs/StandardsAndProcedures/CONTRIBUTING.md) for the full workflow.

---

## 🔒 Security

Authentication is handled via JWT — access tokens expire after 1 hour, with rotation
via HTTP-only refresh token cookies. Role-based access control separates customer and
business permissions, enforced server-side on every protected endpoint. All API
communication uses HTTPS, and all inputs are validated to guard against injection attacks.

---

## 📸 Screenshots

> *Coming soon — will be added prior to final submission.*

---

## 🎓 Academic Context

**Course:** CSC 289 — Programming Project Capstone  
**Institution:** Wake Technical Community College  
**Instructor:** Professor Alex Tabbal  
**Methodology:** Agile Scrum (6 two-week sprints)  

**Team 7:**

| Name             | Role                                  |
|------------------|---------------------------------------|
| Serina Rodriguez | Scrum Master / Project Manager        |
| Kim Mayo         | Product Owner, Full-Stack Development |
| Tristin Gatt     | Software Architect, Backend Lead      |
| Rachel Mizer     | Frontend Development Lead             |
| Caleb Fowlkes    | Technical Writer, Code Review Lead    |
| Kenny Bacdayan   | QA / Testing Lead                     |

*Special thanks to Tyler Royal, who contributed as Presentation Lead during the first half of the project.*

---

*Last updated: April 17, 2026*
