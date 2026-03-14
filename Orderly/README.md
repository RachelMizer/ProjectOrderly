# Setting up local development environment
## Requirements
Python
Node.js
MySQL 8.4.8 (follow installation instructions below.)

## Backend
Clone repository.
navigate to Orderly directory in powershell (Directory containing this readme).
run: `python -m venv .venv`.
activate virtual environment: `.venv\Scripts\Activate.ps1`(Windows).
install dependencies: `pip install -r requirements.txt`(Windows).
Double check settings. Open backend/orderly/settings.py.
```
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]
```
At the bottom of settings.py:
```
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    # MUST CHANGE LATER
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.AllowAny",),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "AUTH_HEADER_TYPES": ("Bearer",),
}

CORS_ALLOW_ALL_ORIGINS = True

```
To start backend server, run: `python manage.py runserver`
*Note: Navigate to `/Orderly/backend/` before starting backend server.*

## Database
Go to https://www.mysql.com Downloads > MySQL Community (GPL) Downloads > MySQL Community Server.
Select version **8.4.8 LTS** for windows and download MSI installer.
Run installer, select typical installation.
Run MySQL Configurator.
+ (Optional) Choose database directory
+ Choose **Development Computer**
+ Keep default port: 3306
+ Create password and store safely.
+ Apply changes, Execute, Finish.
  
In cmd, run command `mysql -u root -p` (If this doesn't work, you may need to add the MySQL\MySQL Server8.4\bin directory to PATH in environment variables. Use the full path from where MySQL is installed.).
Login with the root password you created earlier.
Enter these commands.


```
CREATE DATABASE orderly
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

CREATE USER 'orderly_user'@'localhost'
IDENTIFIED BY 'localdevpass';

GRANT ALL PRIVILEGES ON orderly.* TO 'orderly_user'@'localhost';

FLUSH PRIVILEGES;
```

To double check you created the database correctly:
```
SHOW DATABASES;
```
You should see orderly listed.
To double check you created the database with utf8mb4:
```
SHOW CREATE DATABASE orderly;
```
You should see `DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`

To double check the orderly user was created:
```
SELECT User, Host FROM mysql.user;
```
You should see orderly_user listed.
To check privileges:
```
SHOW GRANTS FOR 'orderly_user'@'localhost';
```
You should see: `GRANT ALL PRIVILEGES ON 'orderly'.* TO 'orderly_user'@'localhost'`

Now open orderly\backend\orderly\settings.py
Go to the DATABASES settings. It should look like this:
```
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
In powershell, navigate to orderly directory, run `.venv\Scripts\Activate.ps1`.
navigate to backend, run `python manage.py migrate`.

## Frontend
Install Node.js (Windows installer is fine).
In powershell, navigate to /orderly/frontend, run:
```
npm install
```
Ignore vulnerability warnings.
to start the frontend server:
```
npm start
```

---

## CI/CD Pipeline

Every pull request to `main` runs two automated checks via GitHub Actions:

| Check               | What Runs                                                    |
| ------------------- | ------------------------------------------------------------ |
| **Backend Tests**   | Spins up MySQL 8.0, runs migrations, installs pytest, runs full pytest suite |
| **Frontend Checks** | Installs dependencies, runs linter, runs test suite          |

Both checks must pass before a PR is eligible to merge.

---

### Viewing Results

After pushing, open your pull request on GitHub. Check statuses appear near the bottom of the PR page. Click **Details** on any check to see the full log output.

---

### Running Checks Locally Before Pushing

**Backend:**

```bash
# From Orderly/backend
pip install -r ../requirements.txt
python manage.py migrate --noinput
pytest --tb=short -v
```

**Frontend:**

```bash
# From Orderly/frontend
npm install
npm run lint
npm test
```

---

### Active Workarounds

The following are temporary — see PR comments for full context:

| Workaround                                | Owner      | Action Required                                              |
| ----------------------------------------- | ---------- | ------------------------------------------------------------ |
| `pytest \|\| true` — no tests collected   | Kenny B.   | Commit test files to repo                                    |
| `pytest` installed manually in workflow   | Tristin G. | Add `pytest` and `pytest-django` to `requirements.txt`       |
| Hardcoded DB credentials in `settings.py` | Tristin G. | Migrate to environment variables                             |
| `npm install` instead of `npm ci`         | Rachel M.  | Run `npm install` locally, commit updated `package-lock.json` |
| `continue-on-error` on lint               | Rachel M.  | Add `lint` script to `package.json`                          |
| `continue-on-error` on tests              | Rachel M.  | Add `test` script to `package.json`                          |

Once all workarounds are resolved, remove them and CI will fully enforce quality gates on every PR.

---

See [CONTRIBUTING.md](../docs/StandardsAndProcedures/CONTRIBUTING.md) for the full workflow.