# CSC289 Programming Capstone Project

**Project Name:** Orderly

**Team Number:** 7

**Team Project Manager:** Serina Rodriguez

**Team Members:** Caleb Fowlkes, Kenny Bacdayan, Kim Mayo, Rachel Mizer, Tristin Gatt



# Installation Guide

## Introduction

Orderly is a storefront and store management, web-based application. The frontend, UI side, and backend, underlying logic, are separate systems but both live inside the Orderly codebase. The backend and frontend URLs can be edited inside the .env files in the Orderly root and frontend directory.

## System Requirements

For local hosting, ensure you have Docker Desktop and Git installed.   

## Software Installation Guide (Local Hosting)

1. Verify that docker is installed.  

```
docker --version
docker compose version
```

2. Download the Orderly feat_local-Docker-Dist branch code   
   
   Navigate to the Orderly repo, switch the branch from main to feat_local-Docker-Dist, then click code and download zip. Unzip and navigate to the directory

```
cd <Orderly feat_local-Docker-Dist path>
```

3. Create Environment File
   inside example-env.txt, replace both <CHANGEME> with secure passwords. Then run:   

```
cp example-env-backend.txt .env
cp example-env-frontend.txt frontend/.env
```

4. Build and Start Application

```
docker compose up --build
```

5. Run Database Migrations
    Sometimes, MySQL can take a moment to start. Wait a few minutes to run this next command:   

```
docker compose exec backend python manage.py migrate
```

6. Seed Demo Data (OPTIONAL)

```
docker compose exec backend python manage.py seed_data
docker compose exec backend python manage.py seed_customers
docker compose exec backend python manage.py seed_orders
```

You can now access the application frontend at http://localhost:3000 or backend at http://localhost:8000   

## Launching

The following commands are used to start and stop the docker container

```
docker compose up ## Start, rebuild, and view logs
docker compose start ## Start a stopped, previously built container
docker compose down ## stop a running container
```

## Uninstalling

The following commands can be used to uninstall the docker container

```
docker compose down ## Stop and remove containers and networks
docker compose down -v ## Stop and remove containers, networks, and volumes
docker compose down --rmi all -v ## stop and remove all containers, networks, volumes, and images. Full wipe
```
