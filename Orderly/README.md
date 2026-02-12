# Setting up local development environment
## Requirements
Python
Node.js
MySQL 8.4.8 (follow installation instructions below.)

## Backend
Clone repository.
navigate to Orderly directory in powershell (Directory containing this readme)
run: `python -m venv .venv`
activate virtual environment: `.venv\Scripts\Activate.ps1`(Windows)
install dependencies: `pip install -r requirements.txt`(Windows)
Double check settings. Open backend/orderly/settings.py
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

## Database
Go to https://www.mysql.com Downloads > MySQL Community (GPL) Downloads > MySQL Community Server
Select version **8.4.8 LTS** for windows and download MSI installer
Run installer, select typical installation
Run MySQL Configurator
+ (Optional) Choose database directory
+ Choose **Development Computer**
+ Keep default port: 3306
+ Create password and store safely.
+ Apply changes, Execute, Finish.
  
In cmd, run command `mysql -u root -p` (If this doesn't work, you may need to add the MySQL\MySQL Server8.4\bin directory to PATH in environment variables. Use the full path from where MySQL is installed.)
Login with the root password you created earlier
Enter these commands


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
In powershell, navigate to orderly directory, run `.venv\Scripts\Activate.ps1`
navigate to backend, run `python manage.py migrate`

## Frontend
Install Node.js (Windows installer is fine)
In powershell, navigate to /orderly/frontend, run:
```
npm install
```
Ignore vulnerability warnings.
to start the frontend server:
```
npm start
```