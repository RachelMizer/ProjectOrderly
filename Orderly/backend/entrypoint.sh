#!/bin/sh

echo "Starting backend setup..."

#Wait for db
echo "Waiting for database..."

until nc -z $DB_HOST 3306; do
  sleep 2
done

echo "Database is ready!"

#Flush database
echo "Flushing database..."
python manage.py flush --noinput

#Apply migrations
echo "Running migrations..."
python manage.py migrate

#Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

#Seed data
echo "Seeding data..."
python manage.py seed_data
python manage.py seed_customers
python manage.py seed_orders

echo "Backend ready"

exec python manage.py runserver 0.0.0.0:8000