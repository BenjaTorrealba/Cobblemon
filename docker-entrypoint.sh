#!/bin/sh
set -e
echo "Running DB migrations..."
npx prisma db push
echo "Seeding admin users..."
node prisma/seed.js
echo "Starting server..."
node build/index.js
