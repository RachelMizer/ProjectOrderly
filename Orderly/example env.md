## \backend\.env
```
DEBUG=True
SECRET_KEY=django-insecure-abc... #can use django command to generate key

ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=orderly
DB_USER=orderly_user
DB_PASSWORD=localdevpass
DB_HOST=127.0.0.1
DB_PORT=3306

FRONTEND_URL=http://localhost:3000
CORS_ALLOWED_ORIGINS=http://localhost:3000

JWT_SECRET=abc...
```

## \frontend\.env.development
```
# Replace all hardcoded api base urls, "http://localhost:8000", with process.env.REACT_APP_API_URL
REACT_APP_API_URL=http://localhost:8000

# App Environment
REACT_APP_ENV=development

# Optional: feature flags
REACT_APP_ENABLE_LOGGING=true
```

## \frontend\.env.production
```

# once deployed, set url to <ec2_public_address>:8000
REACT_APP_API_URL=""

REACT_APP_ENV=production

REACT_APP_ENABLE_LOGGING=false
```